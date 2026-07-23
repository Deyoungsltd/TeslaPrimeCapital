/**
 * TeslaPrimeCapital — KYC Compliance HTTP Controller (`kyc.controller.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { kycService } from '../services/kyc.service';
import { checkRateLimit } from '../middlewares/rate-limit.middleware';
import { validateInput } from '../middlewares/validate.middleware';
import { extractAuthenticatedUser } from '../middlewares/authenticate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { UploadSignatureRequestSchema, DocumentRecordRequestSchema, AdminReviewActionSchema } from '../validators/kyc.validator';
import { logger } from '@/utils/logger.util';
import { IApiResponse } from '@/contracts/api.envelope';
import { sanitizeErrorMessage } from '@/utils/error-sanitizer.util';

export class KYCController {
  private static makeEnvelope<T>(success: boolean, data?: T, error?: any, status = 200): NextResponse<IApiResponse<T>> {
    return NextResponse.json({
      success,
      ...(data !== undefined && { data }),
      ...(error !== undefined && { error }),
      meta: { timestamp: new Date().toISOString(), requestId: `req_${Math.random().toString(36).substring(2, 11)}` },
    }, { status });
  }

  public async getUploadSignature(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return KYCController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Auth required.' }, 401);

    const rateCheck = await checkRateLimit(req, 'kyc', 10, 3600, user.id);
    if (!rateCheck.allowed) return KYCController.makeEnvelope(false, undefined, { code: 'ERR_RATE_LIMIT_EXCEEDED', message: 'Upload limit exceeded.' }, 429);

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(UploadSignatureRequestSchema, body);
      if (!validation.success || !validation.data) return KYCController.makeEnvelope(false, undefined, validation.error, 400);

      const result = await kycService.generateUploadSignature(user.id, validation.data);
      return KYCController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      return KYCController.makeEnvelope(false, undefined, { code: 'ERR_UPLOAD_SIGNATURE_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async recordDocument(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return KYCController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Auth required.' }, 401);

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(DocumentRecordRequestSchema, body);
      if (!validation.success || !validation.data) return KYCController.makeEnvelope(false, undefined, validation.error, 400);

      const result = await kycService.recordUploadedDocument(user.id, validation.data);
      return KYCController.makeEnvelope(true, result, undefined, 201);
    } catch (err: any) {
      return KYCController.makeEnvelope(false, undefined, { code: 'ERR_RECORD_DOCUMENT_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async getUserDocuments(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return KYCController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Auth required.' }, 401);

    try {
      const docs = await kycService.getUserDocuments(user.id);
      return KYCController.makeEnvelope(true, docs, undefined, 200);
    } catch (err: any) {
      return KYCController.makeEnvelope(false, undefined, { code: 'ERR_GET_DOCUMENTS_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async getPendingQueue(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user || !checkPermission(user, 'kyc:review_docs')) {
      return KYCController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Insufficient compliance officer permissions.' }, 403);
    }

    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const result = await kycService.getPendingReviewQueue(page, limit);
      return KYCController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      return KYCController.makeEnvelope(false, undefined, { code: 'ERR_GET_PENDING_QUEUE_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async getSecureUrl(req: NextRequest, documentId: string): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user || !checkPermission(user, 'kyc:review_docs')) {
      return KYCController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Insufficient compliance officer permissions.' }, 403);
    }

    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';
      const result = await kycService.getSecureDocumentViewUrl(user.id, documentId, ip);
      return KYCController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      return KYCController.makeEnvelope(false, undefined, { code: 'ERR_GET_SECURE_URL_FAILED', message: sanitizeErrorMessage(err) }, 404);
    }
  }

  public async reviewAction(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user || !checkPermission(user, 'kyc:approve_reject')) {
      return KYCController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Insufficient compliance officer permissions.' }, 403);
    }

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(AdminReviewActionSchema, body);
      if (!validation.success || !validation.data) return KYCController.makeEnvelope(false, undefined, validation.error, 400);

      const result = await kycService.reviewDocument(user.id, validation.data);
      return KYCController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      return KYCController.makeEnvelope(false, undefined, { code: 'ERR_REVIEW_ACTION_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }
}

export const kycController = new KYCController();
