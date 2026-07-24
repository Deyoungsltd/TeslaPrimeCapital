/**
 * TeslaPrimeCapital — Double-Entry Financial Ledger Domain Service (`wallet.service.ts`)
 * Enforces exact fixed-point arithmetic (`DecimalUtil`) within Redis Redlock distributed mutexes (`withWalletLock`).
 */

import { walletRepository } from '../repositories/wallet.repository';
import { userRepository } from '../repositories/user.repository';
import { adminMessagingService } from './admin-messaging.service';
import { withWalletLock } from '@/lib/redis';
import { DecimalUtil } from '@/utils/decimal.util';
import { CryptoUtil } from '@/utils/crypto.util';
import { logger } from '@/utils/logger.util';
import { APP_CONFIG } from '@/config/app.config';
import { TransactionType, TransactionStatus, KycTier } from '@prisma/client';
import {
  DepositInitiationInput,
  WithdrawalInitiationInput,
  ExchangeInitiationInput,
  TransactionQueryInput,
} from '../validators/wallet.validator';
import { authenticator } from 'otplib';

authenticator.options = { window: 1 };

export class WalletService {
  private readonly MASTER_KEY = process.env.SESSION_MASTER_KEY || '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';

  /**
   * Fetches all segregated currency balances for a user. Upserts default wallets (`USD`, `EUR`, `BTC`, `ETH`) if missing.
   */
  public async getUserBalances(userId: string) {
    const existingWallets = await walletRepository.findAllByUserId(userId);
    const existingCurrencies = new Set(existingWallets.map((w) => w.currency));

    const defaultCurrencies = ['USD', 'EUR', 'BTC', 'ETH', 'USDT', 'USDC'];
    const missingCurrencies = defaultCurrencies.filter((c) => !existingCurrencies.has(c));

    if (missingCurrencies.length > 0) {
      for (const curr of missingCurrencies) {
        await walletRepository.upsertWallet(userId, curr);
      }
      return await walletRepository.findAllByUserId(userId);
    }

    return existingWallets;
  }

  /**
   * Fetches paginated transaction ledger entries for a user with optional filters.
   */
  public async getTransactions(userId: string, input: TransactionQueryInput) {
    return await walletRepository.findTransactionsByUserId(userId, {
      page: input.page,
      limit: input.limit,
      type: input.type as any,
      status: input.status as any,
      currency: input.currency,
    });
  }

  /**
   * Initiates a multi-gateway deposit (`STRIPE`, `COINPAYMENTS`, `BANK_WIRE`).
   * Enforces our approved policy: Tier 0 Starter ($1,000 limit without KYC).
   */
  public async initiateDeposit(userId: string, input: DepositInitiationInput) {
    const result = await withWalletLock(userId, async () => {
      const user = await userRepository.findById(userId);
      if (!user) throw new Error('ERR_USER_NOT_FOUND: User identity not found.');

      const currencyConfig = APP_CONFIG.supportedCurrencies.find((c) => c.code === input.currency);
      if (!currencyConfig) {
        throw new Error(`ERR_UNSUPPORTED_CURRENCY: Currency [${input.currency}] is not active on this gateway.`);
      }

      if (DecimalUtil.isLessThan(input.amount, currencyConfig.minDeposit)) {
        throw new Error(`ERR_BELOW_MIN_DEPOSIT: Minimum deposit for ${input.currency} is ${currencyConfig.minDeposit}.`);
      }

      const wallet = await walletRepository.upsertWallet(userId, input.currency);

      // Enforce Tier 0 Starter $1,000 Limit policy
      if (user.kycTier === KycTier.TIER_0 && input.currency === 'USD') {
        const totalAfter = DecimalUtil.add(wallet.totalDeposited.toString(), input.amount);
        if (DecimalUtil.isGreaterThan(totalAfter, '1000.00000000')) {
          throw new Error('ERR_KYC_REQUIRED_DEPOSIT: Cumulative deposits exceeding $1,000 USD equivalent require Tier 1 (Government ID + Selfie) verification. Please complete KYC verification in your dashboard.');
        }
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomRef = CryptoUtil.generateSixDigitOtp();
      const transactionId = `TXN_DEP_${dateStr}_${randomRef}`;
      const idempotencyKey = `idemp_dep_${userId}_${transactionId}`;

      const pendingTx = await walletRepository.createTransaction({
        transactionId,
        userId,
        walletId: wallet.id,
        type: TransactionType.DEPOSIT,
        amount: input.amount,
        currency: input.currency,
        status: TransactionStatus.PENDING_REVIEW,
        metadata: {
          gateway: input.gateway,
          initiatedAt: new Date().toISOString(),
          simulatedGatewayRef: `ch_${input.gateway.toLowerCase()}_${randomRef}`,
        },
        idempotencyKey,
      });

      logger.info(`Deposit initiated for user ${userId}: ${input.amount} ${input.currency} via ${input.gateway} (${transactionId})`);

      let checkoutUrl = undefined;
      let cryptoDepositAddress = undefined;

      if (input.gateway === 'STRIPE') {
        checkoutUrl = `${APP_CONFIG.platformName.toLowerCase()}.com/checkout/gateway/${transactionId}`;
      } else if (input.gateway === 'COINPAYMENTS') {
        cryptoDepositAddress = `0x71C...${CryptoUtil.generateSixDigitOtp()}...${userId.slice(0, 4)}`;
      }

      return {
        transactionId: pendingTx.transactionId,
        status: pendingTx.status,
        amount: pendingTx.amount.toString(),
        currency: pendingTx.currency,
        gateway: input.gateway,
        checkoutUrl,
        cryptoDepositAddress,
        paymentReference: `REF_${randomRef}`,
      };
    });

    // Treasury Desk intake acknowledgement — delivered outside the wallet lock
    // window. Creates the conversation thread the settlement decision will land in.
    await adminMessagingService.deliverDeskMessage({
      userId,
      category: 'DEPOSIT_WITHDRAWAL',
      deskLabel: 'Treasury Desk',
      subject: `Deposit Instructions Issued — ${result.amount} ${result.currency}`,
      priority: 'MEDIUM',
      body: `Your deposit of ${result.amount} ${result.currency} via ${result.gateway} has been registered and queued for treasury confirmation.\n\nReference: ${result.transactionId}. Once settlement is confirmed by the Treasury Desk you will receive a signed message in this thread and your available balance updates immediately.\n\nIf anything looks different from what you intended, reply here before settlement completes.`,
      notification: {
        type: 'TRANSACTION',
        title: 'Treasury Desk: Deposit Registered',
      },
    });

    return result;
  }

  /**
   * Initiates a withdrawal request.
   * Enforces Two-Factor Authentication (`TOTP`), acquires `Redlock` mutex, verifies available balance,
   * debits available, credits locked, and sets status to `PENDING_REVIEW` per our 100% Mandatory Admin Review rule.
   */
  public async initiateWithdrawal(userId: string, input: WithdrawalInitiationInput) {
    const result = await withWalletLock(userId, async () => {
      const user = await userRepository.findById(userId);
      if (!user) throw new Error('ERR_USER_NOT_FOUND: User identity not found.');

      // 1. Enforce KYC Tier 1 verification requirement for withdrawals
      if (user.kycTier === KycTier.TIER_0) {
        throw new Error('ERR_KYC_REQUIRED_WITHDRAWAL: Per compliance rules (`Tier 0 Starter`), withdrawals are disabled for unverified accounts. Please submit Tier 1 Government ID and Selfie verification before withdrawing.');
      }

      // 2. Enforce Two-Factor Authentication (TOTP) verification
      if (!user.twoFactorEnabled || !user.twoFactorSecret) {
        throw new Error('ERR_MFA_REQUIRED: Two-Factor Authentication (TOTP) must be enabled in your security settings before initiating a withdrawal.');
      }

      const decryptedSecret = CryptoUtil.decryptSecret(user.twoFactorSecret, this.MASTER_KEY);
      const totpValid = authenticator.verify({ token: input.totpCode, secret: decryptedSecret });
      if (!totpValid) {
        logger.warn(`Invalid TOTP code during withdrawal attempt for user ${userId}`);
        throw new Error('ERR_INVALID_TOTP: The 6-digit authenticator code is incorrect or expired.');
      }

      const currencyConfig = APP_CONFIG.supportedCurrencies.find((c) => c.code === input.currency);
      if (!currencyConfig) {
        throw new Error(`ERR_UNSUPPORTED_CURRENCY: Currency [${input.currency}] is not active.`);
      }

      if (DecimalUtil.isLessThan(input.amount, currencyConfig.minWithdrawal)) {
        throw new Error(`ERR_BELOW_MIN_WITHDRAWAL: Minimum withdrawal for ${input.currency} is ${currencyConfig.minWithdrawal}.`);
      }

      const wallet = await walletRepository.findByUserIdAndCurrency(userId, input.currency);
      if (!wallet) {
        throw new Error(`ERR_WALLET_NOT_FOUND: No active wallet found for currency [${input.currency}].`);
      }

      const availableStr = wallet.availableBalance.toString();
      if (DecimalUtil.isLessThan(availableStr, input.amount)) {
        logger.warn(`Withdrawal rejected due to insufficient funds: requested ${input.amount} ${input.currency}, available ${availableStr}`);
        throw new Error(`ERR_INSUFFICIENT_FUNDS: Available wallet balance (${DecimalUtil.formatFiat(availableStr)} ${input.currency}) is lower than requested withdrawal amount.`);
      }

      // 3. Exact fixed-point balance calculations (`DecimalUtil`)
      const newAvailable = DecimalUtil.sub(availableStr, input.amount);
      const newLocked = DecimalUtil.add(wallet.lockedBalance.toString(), input.amount);

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomRef = CryptoUtil.generateSixDigitOtp();
      const transactionId = `TXN_WTH_${dateStr}_${randomRef}`;
      const idempotencyKey = `idemp_wth_${userId}_${transactionId}`;

      // 4. Execute atomic withdrawal locking transaction (`PENDING_REVIEW` per approved 100% Admin rule)
      const withdrawalTx = await walletRepository.executeWithdrawalLock(wallet.id, newAvailable, newLocked, {
        transactionId,
        userId,
        amount: input.amount,
        currency: input.currency,
        destination: input.destinationAddressOrBank,
        idempotencyKey,
      });

      logger.info(`Withdrawal successfully locked into PENDING_REVIEW for user ${userId}: ${input.amount} ${input.currency} (${transactionId})`);

      return {
        transactionId: withdrawalTx.transactionId,
        amount: withdrawalTx.amount.toString(),
        currency: withdrawalTx.currency,
        status: withdrawalTx.status,
        message: 'Withdrawal request submitted successfully. Per platform treasury rules (`100% Mandatory Admin Review`), your request has been placed in the review queue for compliance and finance officer inspection.',
      };
    });

    // Treasury Desk intake acknowledgement — delivered outside the wallet lock
    // window. The disbursement/decline verdict will continue in the same thread.
    await adminMessagingService.deliverDeskMessage({
      userId,
      category: 'DEPOSIT_WITHDRAWAL',
      deskLabel: 'Treasury Desk',
      subject: `Withdrawal Queued for Review — ${result.amount} ${result.currency}`,
      priority: 'HIGH',
      body: `Your withdrawal request for ${result.amount} ${result.currency} has been received and locked under mandatory treasury review.\n\nReference: ${result.transactionId}. An officer is now inspecting the destination details. You will receive a signed Treasury Desk message in this thread the moment the disbursement is approved — or, if anything is flagged, the exact correction needed with your funds returned to your available balance.`,
      notification: {
        type: 'TRANSACTION',
        title: 'Treasury Desk: Withdrawal Queued for Review',
      },
    });

    return result;
  }

  /**
   * Multi-currency exchange between user sub-balances (`fromCurrency` -> `toCurrency`).
   */
  public async executeExchange(userId: string, input: ExchangeInitiationInput) {
    if (input.fromCurrency === input.toCurrency) {
      throw new Error('ERR_IDENTICAL_CURRENCY: Source and destination currencies must be different.');
    }

    return await withWalletLock(userId, async () => {
      const fromWallet = await walletRepository.findByUserIdAndCurrency(userId, input.fromCurrency);
      if (!fromWallet || DecimalUtil.isLessThan(fromWallet.availableBalance.toString(), input.amount)) {
        throw new Error(`ERR_INSUFFICIENT_FUNDS: Insufficient available balance in ${input.fromCurrency} wallet.`);
      }

      const toWallet = await walletRepository.upsertWallet(userId, input.toCurrency);

      // Oracle simulated conversion rate table
      const rates: Record<string, string> = {
        'USD:EUR': '0.92000000', 'EUR:USD': '1.08695652',
        'USD:BTC': '0.00001550', 'BTC:USD': '64516.12903225',
        'USD:ETH': '0.00028500', 'ETH:USD': '3508.77192982',
        'USD:USDT': '1.00000000', 'USDT:USD': '1.00000000',
      };
      const pairKey = `${input.fromCurrency}:${input.toCurrency}`;
      const rate = rates[pairKey] || '1.00000000';

      const convertedAmount = DecimalUtil.mul(input.amount, rate);
      const spreadFee = DecimalUtil.mul(convertedAmount, '0.0075'); // 0.75% exchange spread
      const netCredited = DecimalUtil.sub(convertedAmount, spreadFee);

      await walletRepository.executeWithdrawalLock(fromWallet.id, DecimalUtil.sub(fromWallet.availableBalance.toString(), input.amount), fromWallet.lockedBalance.toString(), {
        transactionId: `TXN_EXC_OUT_${CryptoUtil.generateSixDigitOtp()}`,
        userId,
        amount: input.amount,
        currency: input.fromCurrency,
        destination: `Exchange to ${input.toCurrency}`,
        idempotencyKey: `idemp_exc_${userId}_${Date.now()}_out`,
      });

      const inTx = await walletRepository.createTransaction({
        transactionId: `TXN_EXC_IN_${CryptoUtil.generateSixDigitOtp()}`,
        userId,
        walletId: toWallet.id,
        type: TransactionType.EXCHANGE,
        amount: netCredited,
        currency: input.toCurrency,
        status: TransactionStatus.COMPLETED,
        metadata: { exchangeRate: rate, spreadFee, fromAmount: input.amount, fromCurrency: input.fromCurrency },
        idempotencyKey: `idemp_exc_${userId}_${Date.now()}_in`,
      });

      return {
        transactionId: inTx.transactionId,
        fromAmount: input.amount,
        fromCurrency: input.fromCurrency,
        toAmount: netCredited,
        toCurrency: input.toCurrency,
        exchangeRate: rate,
        status: 'COMPLETED',
      };
    });
  }
}

export const walletService = new WalletService();
