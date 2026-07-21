/**
 * TeslaPrimeCapital — Referral App Router Endpoints (`/api/v1/referrals/[...route]/route.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { referralController } from '@/server/controllers/referral.controller';

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }): Promise<NextResponse> {
  const route = params.route.join('/');
  switch (route) {
    case 'profile':
      return await referralController.getProfile(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: `Route [/api/v1/referrals/${route}] not found.` }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}
