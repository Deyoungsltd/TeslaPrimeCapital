/**
 * TeslaPrimeCapital — Brand Media HTTP Controller (`media.controller.ts`)
 * Admin-gated endpoints for the Brand Library console. Every route requires
 * the `plans:create_update` governance scope (SUPER_ADMIN tier).
 */
import { NextRequest, NextResponse } from 'next/server';
import { mediaService } from '../services/media.service';
import { extractAuthenticatedUser } from '../middlewares/authenticate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { validateInput } from '../middlewares/validate.middleware';
import { MediaRecordRequestSchema, MediaRevertRequestSchema, MediaTextSetRequestSchema, MediaTextRevertRequestSchema } from '../validators/media.validator';
import { sanitizeErrorMessage } from '@/utils/error-sanitizer.util';
import { logger } from '@/utils/logger.util';
import { IApiResponse } from '@/contracts/api.envelope';

export class MediaController {
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

  private static async requireGovernanceScope(req: NextRequest) {
    const user = await extractAuthenticatedUser(req);
    if (!user || !checkPermission(user, 'plans:create_update')) {
      return null;
    }
    return user;
  }

  /** GET /api/v1/admin/media/list */
  public async list(req: NextRequest): Promise<NextResponse> {
    const user = await MediaController.requireGovernanceScope(req);
    if (!user) return MediaController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Media governance permissions required.' }, 403);
    try {
      const assets = await mediaService.listAssets();
      return MediaController.makeEnvelope(true, { assets }, undefined, 200);
    } catch (err: any) {
      logger.error(`Media list controller error: ${err.message}`);
      return MediaController.makeEnvelope(false, undefined, { code: 'ERR_MEDIA_LIST_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  /** POST /api/v1/admin/media/signature */
  public async signature(req: NextRequest): Promise<NextResponse> {
    const user = await MediaController.requireGovernanceScope(req);
    if (!user) return MediaController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Media governance permissions required.' }, 403);
    try {
      const payload = await mediaService.generateUploadSignature(user.id);
      return MediaController.makeEnvelope(true, payload, undefined, 200);
    } catch (err: any) {
      logger.error(`Media signature controller error: ${err.message}`);
      return MediaController.makeEnvelope(false, undefined, { code: 'ERR_MEDIA_SIGNATURE_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  /** POST /api/v1/admin/media/record */
  public async record(req: NextRequest): Promise<NextResponse> {
    const user = await MediaController.requireGovernanceScope(req);
    if (!user) return MediaController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Media governance permissions required.' }, 403);
    try {
      const body = await req.json();
      const validation = validateInput(MediaRecordRequestSchema, body);
      if (!validation.success || !validation.data) return MediaController.makeEnvelope(false, undefined, validation.error, 400);
      const result = await mediaService.recordAsset(user.id, validation.data);
      return MediaController.makeEnvelope(true, result, undefined, 201);
    } catch (err: any) {
      logger.error(`Media record controller error: ${err.message}`);
      const isDomain = err.message.startsWith('ERR_MEDIA_');
      return MediaController.makeEnvelope(false, undefined, { code: isDomain ? err.message.split(':')[0] : 'ERR_MEDIA_RECORD_FAILED', message: sanitizeErrorMessage(err) }, isDomain ? 400 : 500);
    }
  }

  /** POST /api/v1/admin/media/revert */
  public async revert(req: NextRequest): Promise<NextResponse> {
    const user = await MediaController.requireGovernanceScope(req);
    if (!user) return MediaController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Media governance permissions required.' }, 403);
    try {
      const body = await req.json();
      const validation = validateInput(MediaRevertRequestSchema, body);
      if (!validation.success || !validation.data) return MediaController.makeEnvelope(false, undefined, validation.error, 400);
      const result = await mediaService.revertAsset(user.id, validation.data.key);
      return MediaController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      logger.error(`Media revert controller error: ${err.message}`);
      return MediaController.makeEnvelope(false, undefined, { code: 'ERR_MEDIA_REVERT_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  /** POST /api/v1/admin/media/text */
  public async setText(req: NextRequest): Promise<NextResponse> {
    const user = await MediaController.requireGovernanceScope(req);
    if (!user) return MediaController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Media governance permissions required.' }, 403);
    try {
      const body = await req.json();
      const validation = validateInput(MediaTextSetRequestSchema, body);
      if (!validation.success || !validation.data) return MediaController.makeEnvelope(false, undefined, validation.error, 400);
      const result = await mediaService.recordText(user.id, validation.data.key, validation.data.value);
      return MediaController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      logger.error(`Media text-set controller error: ${err.message}`);
      const isDomain = err.message.startsWith('ERR_MEDIA_');
      return MediaController.makeEnvelope(false, undefined, { code: isDomain ? err.message.split(':')[0] : 'ERR_MEDIA_TEXT_FAILED', message: sanitizeErrorMessage(err) }, isDomain ? 400 : 500);
    }
  }

  /** POST /api/v1/admin/media/text/revert */
  public async revertText(req: NextRequest): Promise<NextResponse> {
    const user = await MediaController.requireGovernanceScope(req);
    if (!user) return MediaController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Media governance permissions required.' }, 403);
    try {
      const body = await req.json();
      const validation = validateInput(MediaTextRevertRequestSchema, body);
      if (!validation.success || !validation.data) return MediaController.makeEnvelope(false, undefined, validation.error, 400);
      const result = await mediaService.revertText(user.id, validation.data.key);
      return MediaController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      logger.error(`Media text-revert controller error: ${err.message}`);
      return MediaController.makeEnvelope(false, undefined, { code: 'ERR_MEDIA_TEXT_REVERT_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }
}

export const mediaController = new MediaController();
