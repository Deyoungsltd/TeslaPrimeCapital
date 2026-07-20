/**
 * TeslaPrimeCapital — Role-Based Access Control (RBAC) Authorization Middleware (`authorize.middleware.ts`)
 * Evaluates hierarchical roles and fine-grained permission scopes before route execution.
 */

import { UserRole } from '@prisma/client';
import { logger } from '@/utils/logger.util';
import { IAuthenticatedUser } from './authenticate.middleware';

export type PermissionScope =
  | 'users:read_basic'
  | 'users:read_pii'
  | 'users:manage_roles'
  | 'kyc:review_docs'
  | 'kyc:approve_reject'
  | 'plans:create_update'
  | 'investments:allocate'
  | 'accrual:trigger_worker'
  | 'wallet:deposit'
  | 'wallet:withdraw_req'
  | 'withdrawals:approve'
  | 'referrals:read_all'
  | 'audit_logs:read';

// Hierarchical Role-to-Permission Scope Mapping Table
const RolePermissionMatrix: Record<UserRole, PermissionScope[]> = {
  [UserRole.SUPER_ADMIN]: [
    'users:read_basic',
    'users:read_pii',
    'users:manage_roles',
    'kyc:review_docs',
    'kyc:approve_reject',
    'plans:create_update',
    'investments:allocate',
    'accrual:trigger_worker',
    'wallet:deposit',
    'withdrawals:approve',
    'referrals:read_all',
    'audit_logs:read',
  ],
  [UserRole.COMPLIANCE_OFFICER]: [
    'users:read_basic',
    'users:read_pii',
    'kyc:review_docs',
    'kyc:approve_reject',
    'audit_logs:read',
  ],
  [UserRole.FINANCE_MANAGER]: [
    'users:read_basic',
    'accrual:trigger_worker',
    'withdrawals:approve',
    'audit_logs:read',
  ],
  [UserRole.SUPPORT_AGENT]: [
    'users:read_basic',
  ],
  [UserRole.AFFILIATE_PARTNER]: [
    'users:read_basic',
  ],
  [UserRole.INVESTOR]: [
    'users:read_basic',
    'investments:allocate',
    'wallet:deposit',
    'wallet:withdraw_req',
  ],
};

export function checkPermission(user: IAuthenticatedUser | null, requiredScope: PermissionScope): boolean {
  if (!user) {
    return false;
  }

  const permissions = RolePermissionMatrix[user.role] || [];
  const isPermitted = permissions.includes(requiredScope);

  if (!isPermitted) {
    logger.warn(`RBAC Permission Denied: User ${user.id} (${user.role}) attempted to access scope [${requiredScope}] without authorization.`);
  }

  return isPermitted;
}
