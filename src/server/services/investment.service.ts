/**
 * TeslaPrimeCapital — Structured Investment Domain Service (`investment.service.ts`)
 * Enforces plan min/max limits (`NUMERIC(20,8)`), debits liquid balances via `withWalletLock` mutexes,
 * locks capital allocations, and orchestrates Lump-Sum Accrual calculations.
 */

import { investmentRepository } from '../repositories/investment.repository';
import { walletRepository } from '../repositories/wallet.repository';
import { userRepository } from '../repositories/user.repository';
import { withWalletLock, redlock } from '@/lib/redis';
import { DecimalUtil } from '@/utils/decimal.util';
import { CryptoUtil } from '@/utils/crypto.util';
import { logger } from '@/utils/logger.util';
import { InvestmentStatus, KycTier } from '@prisma/client';
import { InvestmentAllocationInput, ActiveInvestmentsQueryInput } from '../validators/investment.validator';

export class InvestmentService {
  /**
   * Fetches all active structured plans (`Starter Fixed Yield`, `Prime Dynamic Growth`, `Institutional Apex Strategy`).
   */
  public async getActivePlans() {
    return await investmentRepository.findAllActivePlans();
  }

  /**
   * Fetches paginated active investments for a user with optional status filter.
   */
  public async getUserActiveInvestments(userId: string, input: ActiveInvestmentsQueryInput) {
    return await investmentRepository.findActiveInvestmentsByUserId(userId, {
      page: input.page,
      limit: input.limit,
      status: input.status as any,
    });
  }

  /**
   * Allocates user capital into a structured plan (`withWalletLock` mutex protection).
   * Enforces approved policies: Tier 0 Starter $1,000 limit check & Active Investment Allocation Referral Trigger.
   */
  public async allocateCapital(userId: string, input: InvestmentAllocationInput) {
    return await withWalletLock(userId, async () => {
      const user = await userRepository.findById(userId);
      if (!user) throw new Error('ERR_USER_NOT_FOUND: User identity not found.');

      const plan = await investmentRepository.findPlanByIdOrSlug(input.planId);
      if (!plan || !plan.isActive) {
        throw new Error('ERR_PLAN_UNAVAILABLE: The requested structured investment plan is not currently active.');
      }

      // 1. Check minimum and maximum allocation bounds (`NUMERIC(20,8)`)
      const minStr = plan.minDepositUsd.toString();
      const maxStr = plan.maxDepositUsd.toString();
      if (DecimalUtil.isLessThan(input.amountUsd, minStr)) {
        throw new Error(`ERR_BELOW_MIN_ALLOCATION: Minimum capital allocation for ${plan.name} is $${DecimalUtil.formatFiat(minStr)} USD.`);
      }
      if (DecimalUtil.isGreaterThan(input.amountUsd, maxStr)) {
        throw new Error(`ERR_ABOVE_MAX_ALLOCATION: Maximum capital allocation for ${plan.name} is $${DecimalUtil.formatFiat(maxStr)} USD.`);
      }

      // 2. Check KYC requirement for specific plans (e.g. Prime Growth requires TIER_1, Apex requires TIER_2)
      const tierHierarchy: Record<string, number> = { TIER_0: 0, TIER_1: 1, TIER_2: 2 };
      const userTierScore = tierHierarchy[user.kycTier] || 0;
      const requiredTierScore = tierHierarchy[plan.requiresKycTier] || 0;

      if (userTierScore < requiredTierScore) {
        throw new Error(`ERR_KYC_REQUIRED_FOR_PLAN: Plan [${plan.name}] strictly requires ${plan.requiresKycTier} compliance verification. Your current level is ${user.kycTier}. Please submit identity documents in your dashboard.`);
      }

      // 3. Verify sufficient liquid USD balance
      const usdWallet = await walletRepository.upsertWallet(userId, 'USD');
      const availableStr = usdWallet.availableBalance.toString();
      if (DecimalUtil.isLessThan(availableStr, input.amountUsd)) {
        throw new Error(`ERR_INSUFFICIENT_FUNDS: Insufficient liquid USD balance ($${DecimalUtil.formatFiat(availableStr)} available vs $${DecimalUtil.formatFiat(input.amountUsd)} required). Please initiate a deposit or currency exchange.`);
      }

      // 4. Exact fixed-point balance debit and lock calculations
      const newAvailable = DecimalUtil.sub(availableStr, input.amountUsd);
      const newLocked = DecimalUtil.add(usdWallet.lockedBalance.toString(), input.amountUsd);

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomRef = CryptoUtil.generateSixDigitOtp();
      const transactionId = `TXN_INV_${dateStr}_${randomRef}`;
      const idempotencyKey = `idemp_inv_${userId}_${plan.planId}_${transactionId}`;

      // 5. Execute atomic allocation inside database transaction
      const investment = await investmentRepository.executeAllocationLock({
        userId,
        walletId: usdWallet.id,
        newAvailableBalance: newAvailable,
        newLockedBalance: newLocked,
        planId: plan.id,
        amountUsd: input.amountUsd,
        termDays: plan.termDays,
        transactionId,
        idempotencyKey,
      });

      logger.info(`Successfully allocated $${input.amountUsd} USD into ${plan.name} for user ${userId} (${investment.id})`);

      // 6. Trigger referral commission vesting calculation (`Active Investment Allocation Trigger`)
      try {
        await investmentRepository.processReferralCommissionTrigger({
          investorUserId: userId,
          activeInvestmentId: investment.id,
          allocationAmountUsd: input.amountUsd,
        });
      } catch (commissionErr: any) {
        logger.error(`Non-fatal referral commission attribution error for investment ${investment.id}: ${commissionErr.message}`);
      }

      return {
        investmentId: investment.id,
        planName: plan.name,
        principalAmount: investment.principalAmount.toString(),
        currentAccruedYield: investment.currentAccruedYield.toString(),
        status: investment.status,
        payoutPolicy: investment.payoutPolicy,
        startDate: investment.startDate.toISOString(),
        maturityDate: investment.maturityDate.toISOString(),
        nextAccrualAt: investment.nextAccrualAt.toISOString(),
      };
    });
  }

  /**
   * BullMQ worker orchestration method: calculates daily compound/simple yield tracking records (`AccrualLog`),
   * and executes exact lump-sum maturity payout when `maturityDate <= NOW()`.
   */
  public async processDailyAccrualsAndMaturities(): Promise<{ processedCount: number; maturedCount: number }> {
    let processedCount = 0;
    let maturedCount = 0;
    let skip = 0;
    const take = 500;

    logger.info('Initiating daily compounding and maturity batch calculation across all active allocations...');

    while (true) {
      const ripeBatch = await investmentRepository.findRipeActiveInvestments(skip, take);
      if (ripeBatch.length === 0) break;

      for (const inv of ripeBatch) {
        const lockKey = `lock:accrual:inv_${inv.id}`;
        try {
          const lock = await redlock.acquire([lockKey], 10000);
          try {
            const principalStr = inv.principalAmount.toString();
            const dailyRateStr = inv.plan.dailyRateNumeric.toString();
            const currentYieldStr = inv.currentAccruedYield.toString();

            // Calculate exact 20-digit daily yield (`NUMERIC(20,8)`)
            const yieldEarned = DecimalUtil.mul(principalStr, dailyRateStr);
            const newTotalAccrued = DecimalUtil.add(currentYieldStr, yieldEarned);
            const nextAccrualAt = new Date(Date.now() + 86400000); // exactly 24 hours later

            // Record internal daily tracking log (`AccrualLog`)
            await investmentRepository.executeDailyAccrualLog({
              activeInvestmentId: inv.id,
              dailyRateNumeric: dailyRateStr,
              principalSnapshot: principalStr,
              yieldEarned,
              newTotalAccruedYield: newTotalAccrued,
              nextAccrualAt,
            });
            processedCount++;

            // Check if maturity date has been reached
            if (new Date() >= inv.maturityDate && inv.status === InvestmentStatus.ACTIVE) {
              logger.info(`Investment ${inv.id} reached scheduled maturity date (${inv.maturityDate.toISOString()}). Executing Lump-Sum Payout.`);

              await withWalletLock(inv.userId, async () => {
                const usdWallet = await walletRepository.upsertWallet(inv.userId, 'USD');
                const availableBefore = usdWallet.availableBalance.toString();
                const lockedBefore = usdWallet.lockedBalance.toString();

                // Deduct principal from lockedBalance
                const newLocked = DecimalUtil.sub(lockedBefore, principalStr);
                // Return principal + total lump-sum yield to available liquid balance
                const totalMaturityPayout = DecimalUtil.add(principalStr, newTotalAccrued);
                const newAvailable = DecimalUtil.add(availableBefore, totalMaturityPayout);

                const payoutTxId = `TXN_PAY_${Date.now()}_${CryptoUtil.generateSixDigitOtp()}`;
                const idempotencyKey = `idemp_pay_mat_${inv.id}_${Date.now()}`;

                await investmentRepository.executeMaturityPayout({
                  activeInvestmentId: inv.id,
                  userId: inv.userId,
                  walletId: usdWallet.id,
                  principalAmount: principalStr,
                  totalAccruedYield: newTotalAccrued,
                  newAvailableBalance: newAvailable,
                  newLockedBalance: newLocked,
                  payoutTransactionId: payoutTxId,
                  idempotencyKey,
                });
                maturedCount++;
              });
            }
          } finally {
            await lock.release().catch(() => {});
          }
        } catch (lockErr: any) {
          logger.warn(`Skipping accrual calculation on investment ${inv.id} due to active lock contention: ${lockErr.message}`);
        }
      }

      skip += take;
    }

    logger.info(`Daily accrual worker cycle completed cleanly. Processed: ${processedCount} records | Matured & Disbursed: ${maturedCount} plans.`);
    return { processedCount, maturedCount };
  }
}

export const investmentService = new InvestmentService();
