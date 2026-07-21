/**
 * TeslaPrimeCapital — Investment Database Repository (`investment.repository.ts`)
 * Encapsulates Prisma queries for plans, active allocations, accrual logs, and maturity payouts.
 */

import { prisma } from '@/lib/prisma';
import { Plan, ActiveInvestment, AccrualLog, Prisma, InvestmentStatus, PayoutPolicy, TransactionType, TransactionStatus, CommissionStatus } from '@prisma/client';
import { DecimalUtil } from '@/utils/decimal.util';

export class InvestmentRepository {
  public async findAllActivePlans(): Promise<Plan[]> {
    return await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { minDepositUsd: 'asc' },
    });
  }

  public async findPlanByIdOrSlug(planIdOrSlug: string): Promise<Plan | null> {
    return await prisma.plan.findFirst({
      where: {
        OR: [
          { id: planIdOrSlug },
          { planId: planIdOrSlug },
        ],
      },
    });
  }

  public async findActiveInvestmentsByUserId(userId: string, options: {
    page: number;
    limit: number;
    status?: InvestmentStatus;
  }): Promise<{ investments: (ActiveInvestment & { plan: Plan })[]; totalCount: number }> {
    const where: any = {
      userId,
      ...(options.status && { status: options.status }),
    };

    const [investments, totalCount] = await Promise.all([
      prisma.activeInvestment.findMany({
        where,
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.activeInvestment.count({ where }),
    ]);

    return { investments, totalCount };
  }

  /**
   * Executes atomic capital allocation: debits wallet available, credits locked, creates ActiveInvestment + Transaction.
   */
  public async executeAllocationLock(data: {
    userId: string;
    walletId: string;
    newAvailableBalance: string;
    newLockedBalance: string;
    planId: string;
    amountUsd: string;
    termDays: number;
    transactionId: string;
    idempotencyKey: string;
  }): Promise<ActiveInvestment> {
    const now = new Date();
    const maturityDate = new Date(now.getTime() + data.termDays * 86400000);
    const nextAccrualAt = new Date(now.getTime() + 86400000); // exactly 24 hours later

    return await prisma.$transaction(async (tx: any) => {
      // 1. Update USD wallet balance (`NUMERIC(20,8)`)
      await tx.wallet.update({
        where: { id: data.walletId },
        data: {
          availableBalance: data.newAvailableBalance,
          lockedBalance: data.newLockedBalance,
        },
      });

      // 2. Create ActiveInvestment record (`LUMP_SUM_MATURITY` policy)
      const investment = await tx.activeInvestment.create({
        data: {
          userId: data.userId,
          planId: data.planId,
          principalAmount: data.amountUsd,
          currentAccruedYield: '0.00000000',
          status: InvestmentStatus.ACTIVE,
          payoutPolicy: PayoutPolicy.LUMP_SUM_MATURITY,
          startDate: now,
          maturityDate,
          nextAccrualAt,
        },
      });

      // 3. Create double-entry ledger Transaction (`INVESTMENT_LOCK`)
      await tx.transaction.create({
        data: {
          transactionId: data.transactionId,
          userId: data.userId,
          walletId: data.walletId,
          type: TransactionType.INVESTMENT_LOCK,
          amount: data.amountUsd,
          currency: 'USD',
          status: TransactionStatus.COMPLETED,
          metadata: {
            activeInvestmentId: investment.id,
            planId: data.planId,
            termDays: data.termDays,
            maturityDate: maturityDate.toISOString(),
          },
          idempotencyKey: data.idempotencyKey,
        },
      });

      return investment;
    });
  }

  /**
   * Fetches ripe active investments ready for daily yield accrual calculations (`nextAccrualAt <= NOW()`).
   * Paginated for high-throughput BullMQ worker consumption (`500 records per batch`).
   */
  public async findRipeActiveInvestments(skip = 0, take = 500): Promise<(ActiveInvestment & { plan: Plan })[]> {
    return await prisma.activeInvestment.findMany({
      where: {
        status: InvestmentStatus.ACTIVE,
        nextAccrualAt: { lte: new Date() },
      },
      include: { plan: true },
      orderBy: { nextAccrualAt: 'asc' },
      skip,
      take,
    });
  }

  /**
   * Executes atomic daily interest tracking record (`AccrualLog`) and updates `currentAccruedYield`.
   * Enforces approved policy (`Lump Sum at Plan Maturity`): tracks growth internally without modifying wallet balance yet.
   */
  public async executeDailyAccrualLog(data: {
    activeInvestmentId: string;
    dailyRateNumeric: string;
    principalSnapshot: string;
    yieldEarned: string;
    newTotalAccruedYield: string;
    nextAccrualAt: Date;
  }): Promise<AccrualLog> {
    return await prisma.$transaction(async (tx: any) => {
      // 1. Create AccrualLog record
      const log = await tx.accrualLog.create({
        data: {
          activeInvestmentId: data.activeInvestmentId,
          dailyRateApplied: data.dailyRateNumeric,
          principalSnapshot: data.principalSnapshot,
          yieldEarned: data.yieldEarned,
          accrualDate: new Date(),
        },
      });

      // 2. Update ActiveInvestment total accrued yield and next accrual timestamp
      await tx.activeInvestment.update({
        where: { id: data.activeInvestmentId },
        data: {
          currentAccruedYield: data.newTotalAccruedYield,
          nextAccrualAt: data.nextAccrualAt,
        },
      });

      return log;
    });
  }

  /**
   * Executes atomic maturity payout when `NOW() >= maturityDate`.
   * Enforces approved policy (`Lump Sum at Plan Maturity`): debits `lockedBalance` by principal,
   * credits `availableBalance` with `principalAmount + totalAccruedYield`, sets `status = MATURED`,
   * and creates double-entry `Transaction` ledger records.
   */
  public async executeMaturityPayout(data: {
    activeInvestmentId: string;
    userId: string;
    walletId: string;
    principalAmount: string;
    totalAccruedYield: string;
    newAvailableBalance: string;
    newLockedBalance: string;
    payoutTransactionId: string;
    idempotencyKey: string;
  }): Promise<void> {
    await prisma.$transaction(async (tx: any) => {
      // 1. Update USD wallet balance: return principal + lump-sum yield to available liquid balance
      await tx.wallet.update({
        where: { id: data.walletId },
        data: {
          availableBalance: data.newAvailableBalance,
          lockedBalance: data.newLockedBalance,
        },
      });

      // 2. Mark ActiveInvestment as MATURED
      await tx.activeInvestment.update({
        where: { id: data.activeInvestmentId },
        data: {
          status: InvestmentStatus.MATURED,
        },
      });

      // 3. Create double-entry ledger Transaction (`YIELD_PAYOUT`)
      const payoutTx = await tx.transaction.create({
        data: {
          transactionId: data.payoutTransactionId,
          userId: data.userId,
          walletId: data.walletId,
          type: TransactionType.YIELD_PAYOUT,
          amount: data.totalAccruedYield,
          currency: 'USD',
          status: TransactionStatus.COMPLETED,
          metadata: {
            activeInvestmentId: data.activeInvestmentId,
            principalAmount: data.principalAmount,
            lumpSumYieldEarned: data.totalAccruedYield,
            payoutPolicy: 'LUMP_SUM_MATURITY',
          },
          idempotencyKey: data.idempotencyKey,
        },
      });

      // 4. Link existing AccrualLog records for this investment to the finalized payout transaction
      await tx.accrualLog.updateMany({
        where: { activeInvestmentId: data.activeInvestmentId, transactionId: null },
        data: { transactionId: payoutTx.id },
      });
    });
  }

  /**
   * Triggers referral commission vesting verification (`Active Investment Allocation Trigger`).
   * Evaluates referrer tree (Tier 1: 5%, Tier 2: 2%, Tier 3: 1%) and credits commission balances.
   */
  public async processReferralCommissionTrigger(data: {
    investorUserId: string;
    activeInvestmentId: string;
    allocationAmountUsd: string;
  }): Promise<void> {
    const investor = await prisma.user.findUnique({
      where: { id: data.investorUserId },
      include: {
        referredBy: {
          include: {
            referredBy: {
              include: { referredBy: true },
            },
          },
        },
      },
    });

    if (!investor || !investor.referredBy) return;

    const tiers = [
      { level: 1, user: investor.referredBy, pct: '0.0500' },          // Tier 1: 5%
      { level: 2, user: investor.referredBy.referredBy, pct: '0.0200' }, // Tier 2: 2%
      { level: 3, user: investor.referredBy.referredBy?.referredBy, pct: '0.0100' }, // Tier 3: 1%
    ];

    for (const tier of tiers) {
      if (!tier.user) continue;

      const commissionEarned = DecimalUtil.mul(data.allocationAmountUsd, tier.pct);
      const wallet = await prisma.wallet.upsert({
        where: { userId_currency: { userId: tier.user.id, currency: 'USD' } },
        update: {},
        create: { userId: tier.user.id, currency: 'USD', availableBalance: '0.00000000', lockedBalance: '0.00000000', totalDeposited: '0.00000000', totalWithdrawn: '0.00000000' },
      });

      const newAvailable = DecimalUtil.add(wallet.availableBalance.toString(), commissionEarned);

      await prisma.$transaction(async (tx: any) => {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { availableBalance: newAvailable },
        });

        await tx.commissionLog.create({
          data: {
            referrerId: tier.user.id,
            referredUserId: data.investorUserId,
            activeInvestmentId: data.activeInvestmentId,
            tierLevel: tier.level,
            commissionPercentage: tier.pct,
            qualifyingAmount: data.allocationAmountUsd,
            commissionEarned,
            status: CommissionStatus.CREDITED,
          },
        });

        await tx.transaction.create({
          data: {
            transactionId: `TXN_COM_${Date.now()}_T${tier.level}_${tier.user.id.slice(0, 4)}`,
            userId: tier.user.id,
            walletId: wallet.id,
            type: TransactionType.COMMISSION,
            amount: commissionEarned,
            currency: 'USD',
            status: TransactionStatus.COMPLETED,
            metadata: {
              tierLevel: tier.level,
              referredUserId: data.investorUserId,
              qualifyingAllocation: data.allocationAmountUsd,
              triggerPolicy: 'ACTIVE_INVESTMENT_ALLOCATION_TRIGGER',
            },
            idempotencyKey: `idemp_com_${tier.user.id}_${data.activeInvestmentId}_t${tier.level}`,
          },
        });
      });
    }
  }
}

export const investmentRepository = new InvestmentRepository();
