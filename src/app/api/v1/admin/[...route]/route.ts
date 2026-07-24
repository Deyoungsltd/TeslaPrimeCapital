/**
 * TeslaPrimeCapital — Admin App Router Endpoints (`/api/v1/admin/[...route]/route.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminController } from '@/server/controllers/admin.controller';
import { mediaController } from '@/server/controllers/media.controller';

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }): Promise<NextResponse> {
  const route = params.route.join('/');
  switch (route) {
    case 'overview':
      return await adminController.getOverview(req);
    case 'users':
      return await adminController.getUsers(req);
    case 'withdrawals/queue':
      return await adminController.getWithdrawalsQueue(req);
    case 'deposits/queue':
      return await adminController.getDepositsQueue(req);
    case 'audit-logs':
      return await adminController.getAuditLogs(req);
    case 'media/list':
      return await mediaController.list(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: `Admin route [${route}] not found.` }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { route: string[] } }): Promise<NextResponse> {
  const route = params.route.join('/');
  switch (route) {
    case 'users/update':
      return await adminController.updateUser(req);
    case 'withdrawals/action':
      return await adminController.executeWithdrawalAction(req);
    case 'deposits/action':
      return await adminController.executeDepositAction(req);
    case 'broadcast/send':
      return await adminController.sendBroadcast(req);
    case 'media/signature':
      return await mediaController.signature(req);
    case 'media/record':
      return await mediaController.record(req);
    case 'media/revert':
      return await mediaController.revert(req);
    case 'media/text':
      return await mediaController.setText(req);
    case 'media/text/revert':
      return await mediaController.revertText(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: `Admin route [${route}] not found.` }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}
