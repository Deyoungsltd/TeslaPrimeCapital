/**
 * TeslaPrimeCapital — Support Desk App Router Endpoints (`/api/v1/support/[...route]/route.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supportController } from '@/server/controllers/support.controller';

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }): Promise<Response> {
  const route = params.route.join('/');
  switch (route) {
    case 'threads':
      return await supportController.getThreads(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: `Route [${route}] not found.` }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { route: string[] } }): Promise<Response> {
  const route = params.route.join('/');
  switch (route) {
    case 'threads':
      return await supportController.postThread(req);
    case 'reply':
      return await supportController.postReply(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: `Route [${route}] not found.` }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}
