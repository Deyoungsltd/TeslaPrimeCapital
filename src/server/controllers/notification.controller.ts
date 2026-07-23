/**
 * TeslaPrimeCapital — Notification HTTP Controller (`notification.controller.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '../services/notification.service';
import { validateInput } from '../middlewares/validate.middleware';
import { extractAuthenticatedUser } from '../middlewares/authenticate.middleware';
import { NotificationQuerySchema, NotificationMarkReadSchema } from '../validators/notification.validator';
import { logger } from '@/utils/logger.util';
import { prisma } from '@/lib/prisma';
import { IApiResponse } from '@/contracts/api.envelope';
import { sanitizeErrorMessage } from '@/utils/error-sanitizer.util';

export class NotificationController {
  private static makeEnvelope<T>(success: boolean, data?: T, error?: any, status = 200): NextResponse<IApiResponse<T>> {
    return NextResponse.json({
      success,
      ...(data !== undefined && { data }),
      ...(error !== undefined && { error }),
      meta: { timestamp: new Date().toISOString(), requestId: `req_${Math.random().toString(36).substring(2, 11)}` },
    }, { status });
  }

  /**
   * Public settlement feed: returns the most recent COMPLETED yield payouts
   * and withdrawals with privacy-masked beneficiary names (`First L.`).
   * Only genuinely settled transactions are returned — never fabricated.
   */
  public async getRecentPayouts(_req: NextRequest): Promise<NextResponse> {
    try {
      const settledTransactions = await prisma.transaction.findMany({
        where: {
          status: 'COMPLETED',
          type: { in: ['YIELD_PAYOUT', 'WITHDRAWAL'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: { user: { select: { firstName: true, lastName: true } } },
      });

      const payouts = settledTransactions.map((txn) => ({
        name: `${txn.user.firstName.trim()} ${(txn.user.lastName.trim().charAt(0) || '').toUpperCase()}.`,
        amount: txn.amount.toString(),
        currency: txn.currency,
        occurredAt: txn.createdAt.toISOString(),
      }));

      return NotificationController.makeEnvelope(true, { payouts }, undefined, 200);
    } catch (err: any) {
      logger.error(`Recent payouts feed retrieval failure: ${err.message}`);
      return NotificationController.makeEnvelope(false, undefined, { code: 'ERR_RECENT_PAYOUTS_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async getUnreadCount(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return NotificationController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Auth required.' }, 401);

    try {
      const count = await notificationService.getUnreadCount(user.id);
      return NotificationController.makeEnvelope(true, { unreadCount: count }, undefined, 200);
    } catch (err: any) {
      return NotificationController.makeEnvelope(false, undefined, { code: 'ERR_GET_UNREAD_COUNT_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async getList(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return NotificationController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Auth required.' }, 401);

    try {
      const url = new URL(req.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      const validation = validateInput(NotificationQuerySchema, queryParams);
      if (!validation.success || !validation.data) return NotificationController.makeEnvelope(false, undefined, validation.error, 400);

      const page = validation.data.page ?? 1;
      const limit = validation.data.limit ?? 20;
      const result = await notificationService.getUserNotifications(user.id, { ...validation.data, page, limit });
      const formatted = result.notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        metadata: n.metadata,
        createdAt: n.createdAt.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data: formatted,
        meta: { timestamp: new Date().toISOString(), requestId: 'req_notif', pagination: { page, limit, totalCount: result.totalCount, hasNextPage: page * limit < result.totalCount } },
      }, { status: 200 });
    } catch (err: any) {
      return NotificationController.makeEnvelope(false, undefined, { code: 'ERR_GET_NOTIFICATIONS_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async markRead(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return NotificationController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Auth required.' }, 401);

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(NotificationMarkReadSchema, body);
      if (!validation.success || !validation.data) return NotificationController.makeEnvelope(false, undefined, validation.error, 400);

      const result = await notificationService.markAsRead(user.id, validation.data);
      return NotificationController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      return NotificationController.makeEnvelope(false, undefined, { code: 'ERR_MARK_READ_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async markAllRead(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return NotificationController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Auth required.' }, 401);

    try {
      const result = await notificationService.markAllAsRead(user.id);
      return NotificationController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      return NotificationController.makeEnvelope(false, undefined, { code: 'ERR_MARK_ALL_READ_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  /**
   * GET /api/v1/notifications/stream (`text/event-stream`)
   */
  public async streamSse(req: NextRequest): Promise<Response> {
    const user = await extractAuthenticatedUser(req);
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const stream = new ReadableStream({
      start(controller) {
        notificationService.registerSseClient(user.id, controller);
        // Send initial heartbeat
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'CONNECTED', userId: user.id })}\n\n`));
      },
      cancel(controller) {
        notificationService.unregisterSseClient(user.id, controller);
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  }
}

export const notificationController = new NotificationController();
