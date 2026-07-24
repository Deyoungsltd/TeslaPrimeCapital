/**
 * TeslaPrimeCapital — Support Desk HTTP Controller (`support.controller.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supportService } from '../services/support.service';
import { validateInput } from '../middlewares/validate.middleware';
import { extractAuthenticatedUser } from '../middlewares/authenticate.middleware';
import { SupportReplySchema, SupportCreateThreadSchema } from '../validators/support.validator';
import { logger } from '@/utils/logger.util';
import { IApiResponse } from '@/contracts/api.envelope';
import { sanitizeErrorMessage } from '@/utils/error-sanitizer.util';

export class SupportController {
  private static makeEnvelope<T>(success: boolean, data?: T, error?: any, status = 200): NextResponse<IApiResponse<T>> {
    return NextResponse.json({
      success,
      ...(data !== undefined && { data }),
      ...(error !== undefined && { error }),
      meta: { timestamp: new Date().toISOString(), requestId: `req_${Math.random().toString(36).substring(2, 11)}` },
    }, { status });
  }

  /**
   * GET /api/v1/support/threads — full desk conversation history for the client.
   */
  public async getThreads(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return SupportController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Auth required.' }, 401);

    try {
      const result = await supportService.getUserThreads(user.id);
      return SupportController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      logger.error(`Support threads retrieval failure for user ${user.id}: ${err.message}`);
      return SupportController.makeEnvelope(false, undefined, { code: 'ERR_GET_THREADS_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  /**
   * POST /api/v1/support/reply — client appends a message to a thread they own.
   */
  public async postReply(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return SupportController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Auth required.' }, 401);

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(SupportReplySchema, body);
      if (!validation.success || !validation.data) return SupportController.makeEnvelope(false, undefined, validation.error, 400);

      const result = await supportService.replyAsUser(user.id, validation.data);
      return SupportController.makeEnvelope(true, result, undefined, 201);
    } catch (err: any) {
      const isNotFound = typeof err?.message === 'string' && err.message.startsWith('ERR_THREAD_NOT_FOUND');
      logger.error(`Support reply failure for user ${user.id}: ${err.message}`);
      return SupportController.makeEnvelope(
        false,
        undefined,
        { code: isNotFound ? 'ERR_THREAD_NOT_FOUND' : 'ERR_REPLY_FAILED', message: sanitizeErrorMessage(err) },
        isNotFound ? 404 : 500
      );
    }
  }

  /**
   * POST /api/v1/support/threads — client opens a new conversation with the desk.
   */
  public async postThread(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return SupportController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Auth required.' }, 401);

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(SupportCreateThreadSchema, body);
      if (!validation.success || !validation.data) return SupportController.makeEnvelope(false, undefined, validation.error, 400);

      const result = await supportService.openThreadAsUser(user.id, {
        ...validation.data,
        category: validation.data.category ?? 'GENERAL',
      });
      return SupportController.makeEnvelope(true, result, undefined, 201);
    } catch (err: any) {
      logger.error(`Support thread creation failure for user ${user.id}: ${err.message}`);
      return SupportController.makeEnvelope(false, undefined, { code: 'ERR_CREATE_THREAD_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }
}

export const supportController = new SupportController();
