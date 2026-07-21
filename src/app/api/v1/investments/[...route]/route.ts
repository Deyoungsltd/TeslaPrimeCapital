/**
 * TeslaPrimeCapital — Investment Marketplace App Router Endpoints (`/api/v1/investments/[...route]/route.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { investmentController } from '@/server/controllers/investment.controller';

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }): Promise<NextResponse> {
  const route = params.route.join('/');
  switch (route) {
    case 'plans':
      return await investmentController.getPlans(req);
    case 'active':
      return await investmentController.getActiveInvestments(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: `Route [/api/v1/investments/${route}] not found.` }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { route: string[] } }): Promise<NextResponse> {
  const route = params.route.join('/');
  switch (route) {
    case 'allocate':
      return await investmentController.allocate(req);
    case 'accrue':
      return await investmentController.triggerAccrualWorker(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: `Route [/api/v1/investments/${route}] not found.` }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}
