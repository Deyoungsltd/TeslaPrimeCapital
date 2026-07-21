/**
 * TeslaPrimeCapital — Strict Zod Referral & Affiliate Validation (`referral.validator.ts`)
 */

import { z } from 'zod';

export const ReferralTreeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  tierLevel: z.coerce.number().int().min(1).max(3).optional(),
  status: z.enum(['PENDING_VESTING', 'CREDITED', 'CLAWED_BACK']).optional(),
});

export type ReferralTreeQueryInput = z.infer<typeof ReferralTreeQuerySchema>;
