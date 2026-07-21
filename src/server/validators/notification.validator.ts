/**
 * TeslaPrimeCapital — Strict Zod Notification Validation (`notification.validator.ts`)
 */

import { z } from 'zod';

export const NotificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['SYSTEM', 'TRANSACTION', 'INVESTMENT', 'SECURITY', 'COMMISSION', 'KYC']).optional(),
  unreadOnly: z.coerce.boolean().optional(),
});

export const NotificationMarkReadSchema = z.object({
  notificationIds: z.array(z.string().min(1)).min(1, 'At least one notification ID is required.'),
});

export type NotificationQueryInput = z.infer<typeof NotificationQuerySchema>;
export type NotificationMarkReadInput = z.infer<typeof NotificationMarkReadSchema>;
