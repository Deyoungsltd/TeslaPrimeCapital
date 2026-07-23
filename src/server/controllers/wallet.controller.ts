/**
 * TeslaPrimeCapital — Wallet & Ledger HTTP Controller (`wallet.controller.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { walletService } from '../services/wallet.service';
import { checkRateLimit } from '../middlewares/rate-limit.middleware';
import { validateInput } from '../middlewares/validate.middleware';
import { extractAuthenticatedUser } from '../middlewares/authenticate.middleware';
import {
  DepositInitiationSchema,
  WithdrawalInitiationSchema,
  ExchangeInitiationSchema,
  TransactionQuerySchema,
} from '../validators/wallet.validator';
import { AUTH_CONFIG } from '@/config/auth.config';
import { logger } from '@/utils/logger.util';
import { IApiResponse } from '@/contracts/api.envelope';
import { sanitizeErrorMessage } from '@/utils/error-sanitizer.util';

export class WalletController {
  private static makeEnvelope<T>(success: boolean, data?: T, error?: any, status = 200): NextResponse<IApiResponse<T>> {
    const responseBody: IApiResponse<T> = {
      success,
      ...(data !== undefined && { data }),
      ...(error !== undefined && { error }),
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req_${Math.random().toString(36).substring(2, 11)}`,
      },
    };
    return NextResponse.json(responseBody, { status });
  }

  /**
   * GET /api/v1/wallet/balances
   */
  public async getBalances(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) {
      return WalletController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Authentication required.' }, 401);
    }

    try {
      const balances = await walletService.getUserBalances(user.id);
      const formatted = balances.map((b) => ({
        id: b.id,
        currency: b.currency,
        availableBalance: b.availableBalance.toString(),
        lockedBalance: b.lockedBalance.toString(),
        totalDeposited: b.totalDeposited.toString(),
        totalWithdrawn: b.totalWithdrawn.toString(),
        updatedAt: b.updatedAt.toISOString(),
      }));

      return WalletController.makeEnvelope(true, formatted, undefined, 200);
    } catch (err: any) {
      logger.error(`Get balances controller error: ${err.message}`);
      return WalletController.makeEnvelope(false, undefined, { code: 'ERR_GET_BALANCES_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  /**
   * GET /api/v1/wallet/transactions
   */
  public async getTransactions(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) {
      return WalletController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Authentication required.' }, 401);
    }

    try {
      const url = new URL(req.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      const validation = validateInput(TransactionQuerySchema, queryParams);
      if (!validation.success || !validation.data) {
        return WalletController.makeEnvelope(false, undefined, validation.error, 400);
      }

      const page = validation.data.page ?? 1;
      const limit = validation.data.limit ?? 20;
      const result = await walletService.getTransactions(user.id, { ...validation.data, page, limit });
      const formatted = result.transactions.map((tx) => ({
        id: tx.id,
        transactionId: tx.transactionId,
        type: tx.type,
        amount: tx.amount.toString(),
        currency: tx.currency,
        status: tx.status,
        metadata: tx.metadata,
        createdAt: tx.createdAt.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data: formatted,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 11)}`,
          pagination: {
            page,
            limit,
            totalCount: result.totalCount,
            hasNextPage: page * limit < result.totalCount,
          },
        },
      }, { status: 200 });
    } catch (err: any) {
      logger.error(`Get transactions controller error: ${err.message}`);
      return WalletController.makeEnvelope(false, undefined, { code: 'ERR_GET_TRANSACTIONS_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  /**
   * POST /api/v1/wallet/deposit
   */
  public async deposit(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) {
      return WalletController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Authentication required.' }, 401);
    }

    const rateCheck = await checkRateLimit(req, 'walletMutations', AUTH_CONFIG.rateLimits.walletMutations.maxRequests, AUTH_CONFIG.rateLimits.walletMutations.windowSec, user.id);
    if (!rateCheck.allowed) {
      return WalletController.makeEnvelope(false, undefined, { code: 'ERR_RATE_LIMIT_EXCEEDED', message: 'Too many transaction attempts. Please wait.' }, 429);
    }

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(DepositInitiationSchema, body);
      if (!validation.success || !validation.data) {
        return WalletController.makeEnvelope(false, undefined, validation.error, 400);
      }

      const result = await walletService.initiateDeposit(user.id, validation.data);
      return WalletController.makeEnvelope(true, result, undefined, 201);
    } catch (err: any) {
      logger.error(`Deposit initiation controller error: ${err.message}`);
      const isKycErr = err.message.includes('ERR_KYC_REQUIRED');
      return WalletController.makeEnvelope(false, undefined, {
        code: isKycErr ? 'ERR_KYC_REQUIRED' : 'ERR_DEPOSIT_INITIATION_FAILED',
        message: sanitizeErrorMessage(err, 'Failed to initiate deposit.'),
      }, isKycErr ? 403 : 400);
    }
  }

  /**
   * POST /api/v1/wallet/withdraw
   */
  public async withdraw(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) {
      return WalletController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Authentication required.' }, 401);
    }

    const rateCheck = await checkRateLimit(req, 'walletMutations', AUTH_CONFIG.rateLimits.walletMutations.maxRequests, AUTH_CONFIG.rateLimits.walletMutations.windowSec, user.id);
    if (!rateCheck.allowed) {
      return WalletController.makeEnvelope(false, undefined, { code: 'ERR_RATE_LIMIT_EXCEEDED', message: 'Too many transaction attempts. Please wait.' }, 429);
    }

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(WithdrawalInitiationSchema, body);
      if (!validation.success || !validation.data) {
        return WalletController.makeEnvelope(false, undefined, validation.error, 400);
      }

      const result = await walletService.initiateWithdrawal(user.id, validation.data);
      return WalletController.makeEnvelope(true, result, undefined, 201);
    } catch (err: any) {
      logger.error(`Withdrawal initiation controller error: ${err.message}`);
      const isKycErr = err.message.includes('ERR_KYC_REQUIRED');
      const isMfaErr = err.message.includes('ERR_MFA_REQUIRED') || err.message.includes('ERR_INVALID_TOTP');
      const isFundsErr = err.message.includes('ERR_INSUFFICIENT_FUNDS');

      return WalletController.makeEnvelope(false, undefined, {
        code: isKycErr ? 'ERR_KYC_REQUIRED' : isMfaErr ? 'ERR_MFA_REQUIRED' : isFundsErr ? 'ERR_INSUFFICIENT_FUNDS' : 'ERR_WITHDRAWAL_FAILED',
        message: sanitizeErrorMessage(err, 'Failed to submit withdrawal request.'),
      }, isKycErr || isMfaErr ? 403 : isFundsErr ? 400 : 500);
    }
  }

  /**
   * POST /api/v1/wallet/exchange
   */
  public async exchange(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) {
      return WalletController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Authentication required.' }, 401);
    }

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(ExchangeInitiationSchema, body);
      if (!validation.success || !validation.data) {
        return WalletController.makeEnvelope(false, undefined, validation.error, 400);
      }

      const result = await walletService.executeExchange(user.id, validation.data);
      return WalletController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      logger.error(`Exchange controller error: ${err.message}`);
      return WalletController.makeEnvelope(false, undefined, { code: 'ERR_EXCHANGE_FAILED', message: sanitizeErrorMessage(err) }, 400);
    }
  }
}

export const walletController = new WalletController();
