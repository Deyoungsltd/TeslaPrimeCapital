/**
 * TeslaPrimeCapital — Investment Marketplace HTTP Controller (`investment.controller.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { investmentService } from '../services/investment.service';
import { checkRateLimit } from '../middlewares/rate-limit.middleware';
import { validateInput } from '../middlewares/validate.middleware';
import { extractAuthenticatedUser } from '../middlewares/authenticate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import {
  ActiveInvestmentsQuerySchema,
  InvestmentAllocationSchema,
} from '../validators/investment.validator';
import { AUTH_CONFIG } from '@/config/auth.config';
import { logger } from '@/utils/logger.util';
import { IApiResponse } from '@/contracts/api.envelope';
import { sanitizeErrorMessage } from '@/utils/error-sanitizer.util';

export class InvestmentController {
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
   * GET /api/v1/investments/plans
   */
  public async getPlans(req: NextRequest): Promise<NextResponse> {
    try {
      const plans = await investmentService.getActivePlans();
      const formatted = plans.map((p) => ({
        id: p.id,
        planId: p.planId,
        name: p.name,
        description: p.description,
        minDepositUsd: p.minDepositUsd.toString(),
        maxDepositUsd: p.maxDepositUsd.toString(),
        termDays: p.termDays,
        dailyRateNumeric: p.dailyRateNumeric.toString(),
        annualPercentageRate: p.annualPercentageRate,
        payoutPolicy: p.payoutPolicy,
        compoundingAllowed: p.compoundingAllowed,
        requiresKycTier: p.requiresKycTier,
        isActive: p.isActive,
      }));

      return InvestmentController.makeEnvelope(true, formatted, undefined, 200);
    } catch (err: any) {
      logger.error(`Get plans controller error: ${err.message}`);
      return InvestmentController.makeEnvelope(false, undefined, { code: 'ERR_GET_PLANS_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  /**
   * GET /api/v1/investments/active
   */
  public async getActiveInvestments(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) {
      return InvestmentController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Authentication required.' }, 401);
    }

    try {
      const url = new URL(req.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      const validation = validateInput(ActiveInvestmentsQuerySchema, queryParams);
      if (!validation.success || !validation.data) {
        return InvestmentController.makeEnvelope(false, undefined, validation.error, 400);
      }

      const page = validation.data.page ?? 1;
      const limit = validation.data.limit ?? 20;
      const result = await investmentService.getUserActiveInvestments(user.id, { ...validation.data, page, limit });
      const formatted = result.investments.map((inv) => ({
        id: inv.id,
        planName: inv.plan.name,
        principalAmount: inv.principalAmount.toString(),
        currentAccruedYield: inv.currentAccruedYield.toString(),
        status: inv.status,
        payoutPolicy: inv.payoutPolicy,
        startDate: inv.startDate.toISOString(),
        maturityDate: inv.maturityDate.toISOString(),
        nextAccrualAt: inv.nextAccrualAt.toISOString(),
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
      logger.error(`Get active investments controller error: ${err.message}`);
      return InvestmentController.makeEnvelope(false, undefined, { code: 'ERR_GET_ACTIVE_INVESTMENTS_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  /**
   * POST /api/v1/investments/allocate
   */
  public async allocate(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) {
      return InvestmentController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Authentication required.' }, 401);
    }

    const rateCheck = await checkRateLimit(req, 'walletMutations', AUTH_CONFIG.rateLimits.walletMutations.maxRequests, AUTH_CONFIG.rateLimits.walletMutations.windowSec, user.id);
    if (!rateCheck.allowed) {
      return InvestmentController.makeEnvelope(false, undefined, { code: 'ERR_RATE_LIMIT_EXCEEDED', message: 'Too many allocation attempts. Please wait.' }, 429);
    }

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(InvestmentAllocationSchema, body);
      if (!validation.success || !validation.data) {
        return InvestmentController.makeEnvelope(false, undefined, validation.error, 400);
      }

      const result = await investmentService.allocateCapital(user.id, validation.data);
      return InvestmentController.makeEnvelope(true, result, undefined, 201);
    } catch (err: any) {
      logger.error(`Capital allocation controller error: ${err.message}`);
      const isKycErr = err.message.includes('ERR_KYC_REQUIRED');
      const isFundsErr = err.message.includes('ERR_INSUFFICIENT_FUNDS');
      const isBoundsErr = err.message.includes('ERR_BELOW_MIN') || err.message.includes('ERR_ABOVE_MAX');

      return InvestmentController.makeEnvelope(false, undefined, {
        code: isKycErr ? 'ERR_KYC_REQUIRED' : isFundsErr ? 'ERR_INSUFFICIENT_FUNDS' : isBoundsErr ? 'ERR_ALLOCATION_BOUNDS' : 'ERR_ALLOCATION_FAILED',
        message: sanitizeErrorMessage(err, 'Failed to allocate capital into structured plan.'),
      }, isKycErr ? 403 : isFundsErr || isBoundsErr ? 400 : 500);
    }
  }

  /**
   * POST /api/v1/investments/accrue
   * Manual worker trigger endpoint restricted strictly to SUPER_ADMIN or FINANCE_MANAGER roles.
   */
  public async triggerAccrualWorker(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user || !checkPermission(user, 'accrual:trigger_worker')) {
      return InvestmentController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Insufficient administrative permissions to execute worker calculation cycle.' }, 403);
    }

    try {
      const stats = await investmentService.processDailyAccrualsAndMaturities();
      return InvestmentController.makeEnvelope(true, {
        message: 'Daily compounding and maturity cycle executed cleanly.',
        ...stats,
      }, undefined, 200);
    } catch (err: any) {
      logger.error(`Trigger accrual worker error: ${err.message}`);
      return InvestmentController.makeEnvelope(false, undefined, { code: 'ERR_ACCRUAL_WORKER_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }
}

export const investmentController = new InvestmentController();
