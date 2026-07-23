/**
 * TeslaPrimeCapital — Admin Governance HTTP Controller (`admin.controller.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '../services/admin.service';
import { validateInput } from '../middlewares/validate.middleware';
import { extractAuthenticatedUser } from '../middlewares/authenticate.middleware';
import { checkPermission } from '../middlewares/authorize.middleware';
import { UserGovernanceUpdateSchema, WithdrawalApprovalSchema, AdminQuerySchema } from '../validators/admin.validator';
import { logger } from '@/utils/logger.util';
import { IApiResponse } from '@/contracts/api.envelope';
import { sanitizeErrorMessage } from '@/utils/error-sanitizer.util';

export class AdminController {
  private static makeEnvelope<T>(success: boolean, data?: T, error?: any, status = 200): NextResponse<IApiResponse<T>> {
    return NextResponse.json({
      success,
      ...(data !== undefined && { data }),
      ...(error !== undefined && { error }),
      meta: { timestamp: new Date().toISOString(), requestId: `req_${Math.random().toString(36).substring(2, 11)}` },
    }, { status });
  }

  public async getOverview(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user || !checkPermission(user, 'users:read_pii')) return AdminController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Admin permissions required.' }, 403);

    try {
      const metrics = await adminService.getExecutiveOverview();
      return AdminController.makeEnvelope(true, metrics, undefined, 200);
    } catch (err: any) {
      return AdminController.makeEnvelope(false, undefined, { code: 'ERR_GET_OVERVIEW_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async getUsers(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user || !checkPermission(user, 'users:read_pii')) return AdminController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Admin permissions required.' }, 403);

    try {
      const url = new URL(req.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      const validation = validateInput(AdminQuerySchema, queryParams);
      if (!validation.success || !validation.data) return AdminController.makeEnvelope(false, undefined, validation.error, 400);

      const page = validation.data.page ?? 1;
      const limit = validation.data.limit ?? 20;
      const result = await adminService.getUsersList({ ...validation.data, page, limit });
      const formatted = result.users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        status: u.status,
        kycTier: u.kycTier,
        twoFactorEnabled: u.twoFactorEnabled,
        referralCode: u.referralCode,
        createdAt: u.createdAt.toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data: formatted,
        meta: { timestamp: new Date().toISOString(), requestId: 'req_adm', pagination: { page, limit, totalCount: result.totalCount, hasNextPage: page * limit < result.totalCount } },
      }, { status: 200 });
    } catch (err: any) {
      return AdminController.makeEnvelope(false, undefined, { code: 'ERR_GET_USERS_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async updateUser(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user || !checkPermission(user, 'users:manage_roles')) return AdminController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'SUPER_ADMIN role required.' }, 403);

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(UserGovernanceUpdateSchema, body);
      if (!validation.success || !validation.data) return AdminController.makeEnvelope(false, undefined, validation.error, 400);

      const result = await adminService.updateGovernance(user.id, validation.data);
      return AdminController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      return AdminController.makeEnvelope(false, undefined, { code: 'ERR_UPDATE_USER_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async getWithdrawalsQueue(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user || !checkPermission(user, 'withdrawals:approve')) return AdminController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Treasury permissions required.' }, 403);

    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '20', 10);
      const result = await adminService.getPendingWithdrawalsQueue(page, limit);
      return AdminController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      return AdminController.makeEnvelope(false, undefined, { code: 'ERR_GET_WITHDRAWALS_QUEUE_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async executeWithdrawalAction(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user || !checkPermission(user, 'withdrawals:approve')) return AdminController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Treasury permissions required.' }, 403);

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(WithdrawalApprovalSchema, body);
      if (!validation.success || !validation.data) return AdminController.makeEnvelope(false, undefined, validation.error, 400);

      const result = await adminService.executeWithdrawalReview(user.id, validation.data);
      return AdminController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      const isMfa = err.message.includes('ERR_ADMIN_MFA') || err.message.includes('ERR_INVALID_TOTP');
      return AdminController.makeEnvelope(false, undefined, { code: isMfa ? 'ERR_INVALID_TOTP' : 'ERR_WITHDRAWAL_REVIEW_FAILED', message: sanitizeErrorMessage(err) }, isMfa ? 403 : 500);
    }
  }

  public async getAuditLogs(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user || !checkPermission(user, 'audit_logs:read')) return AdminController.makeEnvelope(false, undefined, { code: 'ERR_FORBIDDEN', message: 'Audit viewing permissions required.' }, 403);

    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '30', 10);
      const result = await adminService.getSystemAuditLogs(page, limit);
      return AdminController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      return AdminController.makeEnvelope(false, undefined, { code: 'ERR_GET_AUDIT_LOGS_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }
}

export const adminController = new AdminController();
