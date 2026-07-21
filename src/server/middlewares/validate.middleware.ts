/**
 * TeslaPrimeCapital — Request Body & Query Zod Validation Middleware (`validate.middleware.ts`)
 */

import { z } from 'zod';
import { IApiResponse, IApiErrorDetail } from '@/contracts/api.envelope';

export function validateInput<T>(schema: z.ZodType<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details: IApiErrorDetail[] };
} {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details: IApiErrorDetail[] = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      issue: err.message,
    }));
    return {
      success: false,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message: 'The submitted request payload failed validation checks.',
        details,
      },
    };
  }
  return { success: true, data: result.data };
}
