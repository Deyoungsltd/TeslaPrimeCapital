/**
 * TeslaPrimeCapital — Strict Zod Support Desk Validation (`support.validator.ts`)
 */

import { z } from 'zod';

export const SupportReplySchema = z.object({
  threadId: z.string().uuid('A valid conversation thread reference is required.'),
  message: z.string().trim().min(2, 'Message must be at least 2 characters.').max(1200, 'Message must not exceed 1,200 characters.'),
});

export const SupportCreateThreadSchema = z.object({
  subject: z.string().trim().min(4, 'Subject must be at least 4 characters.').max(120, 'Subject must not exceed 120 characters.'),
  message: z.string().trim().min(2, 'Message must be at least 2 characters.').max(1200, 'Message must not exceed 1,200 characters.'),
  category: z.enum(['GENERAL', 'DEPOSIT_WITHDRAWAL', 'INVESTMENT_PLAN', 'KYC_VERIFICATION', 'SECURITY_2FA']).default('GENERAL'),
});

export type SupportReplyInput = z.infer<typeof SupportReplySchema>;
export type SupportCreateThreadInput = z.infer<typeof SupportCreateThreadSchema>;
