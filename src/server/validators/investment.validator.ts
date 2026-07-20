/**
 * TeslaPrimeCapital — Strict Zod Investment Validation Schemas (`investment.validator.ts`)
 */

import { z } from 'zod';

export const PlanCatalogQuerySchema = z.object({
  isActive: z.coerce.boolean().default(true),
});

export const ActiveInvestmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['ACTIVE', 'MATURED', 'CANCELLED']).optional(),
});

export const InvestmentAllocationSchema = z.object({
  planId: z.string().min(1, 'Please select a valid structured investment plan.'),
  amountUsd: z
    .string()
    .min(1, 'Capital allocation amount is required.')
    .regex(/^\d+(\.\d{1,8})?$/, 'Amount must be a positive number with up to 8 decimal places (`NUMERIC(20,8)`).'),
});

export type PlanCatalogQueryInput = z.infer<typeof PlanCatalogQuerySchema>;
export type ActiveInvestmentsQueryInput = z.infer<typeof ActiveInvestmentsQuerySchema>;
export type InvestmentAllocationInput = z.infer<typeof InvestmentAllocationSchema>;
