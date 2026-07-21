/**
 * TeslaPrimeCapital — Notification App Router Endpoints (`/api/v1/notifications/[...route]/route.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { notificationController } from '@/server/controllers/notification.controller';

export async function GET(req: NextRequest, { params }: { params: { route: string[] } }): Promise<Response> {
  const route = params.route.join('/');
  switch (route) {
    case 'unread-count':
      return await notificationController.getUnreadCount(req);
    case 'list':
      return await notificationController.getList(req);
    case 'stream':
      return await notificationController.streamSse(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: `Route [${route}] not found.` }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { route: string[] } }): Promise<NextResponse> {
  const route = params.route.join('/');
  switch (route) {
    case 'mark-read':
      return await notificationController.markRead(req);
    case 'mark-all-read':
      return await notificationController.markAllRead(req);
    default:
      return NextResponse.json({ success: false, error: { code: 'ERR_ENDPOINT_NOT_FOUND', message: `Route [${route}] not found.` }, meta: { timestamp: new Date().toISOString(), requestId: 'req_404' } }, { status: 404 });
  }
}
