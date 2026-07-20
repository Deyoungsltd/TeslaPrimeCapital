/**
 * TeslaPrimeCapital — Strict Zod Admin Governance & Treasury Validation (`admin.validator.ts`)
 */

import { z } from 'zod';

export const UserGovernanceUpdateSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required.'),
  role: z.enum(['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_MANAGER', 'SUPPORT_AGENT', 'AFFILIATE_PARTNER', 'INVESTOR']).optional(),
  status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'LOCKED']).optional(),
  reason: z.string().min(3, 'Administrative governance modification requires an audit reason.').max(500),
});

export const WithdrawalApprovalSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required.'),
  action: z.enum(['APPROVE', 'REJECT']),
  totpCode: z.string().length(6, 'Mandatory 6-digit TOTP Two-Factor code is required to authorize treasury disbursements.'),
  notes: z.string().max(1000).optional(),
});

export const AdminQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.string().optional(),
  status: z.string().optional(),
});

export type UserGovernanceUpdateInput = z.infer<typeof UserGovernanceUpdateSchema>;
export type WithdrawalApprovalInput = z.infer<typeof WithdrawalApprovalSchema>;
export type AdminQueryInput = z.infer<typeof AdminQuerySchema>;
