/**
 * TeslaPrimeCapital — Referral & Affiliate HTTP Controller (`referral.controller.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { referralService } from '../services/referral.service';
import { validateInput } from '../middlewares/validate.middleware';
import { extractAuthenticatedUser } from '../middlewares/authenticate.middleware';
import { ReferralTreeQuerySchema } from '../validators/referral.validator';
import { logger } from '@/utils/logger.util';
import { IApiResponse } from '@/contracts/api.envelope';

export class ReferralController {
  private static makeEnvelope<T>(success: boolean, data?: T, error?: any, status = 200): NextResponse<IApiResponse<T>> {
    return NextResponse.json({
      success,
      ...(data !== undefined && { data }),
      ...(error !== undefined && { error }),
      meta: { timestamp: new Date().toISOString(), requestId: `req_${Math.random().toString(36).substring(2, 11)}` },
    }, { status });
  }

  /**
   * GET /api/v1/referrals/profile
   */
  public async getProfile(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) {
      return ReferralController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Authentication required.' }, 401);
    }

    try {
      const url = new URL(req.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      const validation = validateInput(ReferralTreeQuerySchema, queryParams);
      if (!validation.success || !validation.data) {
        return ReferralController.makeEnvelope(false, undefined, validation.error, 400);
      }

      const page = validation.data.page ?? 1;
      const limit = validation.data.limit ?? 20;
      const result = await referralService.getAffiliateProfile(user.id, { ...validation.data, page, limit });
      return ReferralController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      logger.error(`Referral profile controller error: ${err.message}`);
      return ReferralController.makeEnvelope(false, undefined, { code: 'ERR_GET_REFERRAL_PROFILE_FAILED', message: err.message }, 500);
    }
  }
}

export const referralController = new ReferralController();
