/**
 * TeslaPrimeCapital — Reporting App Router Endpoints (`/api/v1/reporting/[...route]/route.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { reportingController } from '@/server/controllers/reporting.controller';

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }): Promise<Response> {
  const route = params.route.join('/');
  switch (route) {
    case 'analytics':
      return await reportingController.getAnalytics(req);
    case 'export/csv':
      return await reportingController.exportCsv(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: `Route [${route}] not found.` }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}
