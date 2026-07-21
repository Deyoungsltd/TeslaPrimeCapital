/**
 * TeslaPrimeCapital — Strict Zod Input Validation Schemas (`auth.validator.ts`)
 */

import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email('Please provide a valid, properly formatted email address.').max(255),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters in length.')
    .max(128, 'Password cannot exceed 128 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z).')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter (a-z).')
    .regex(/[0-9]/, 'Password must contain at least one numerical digit (0-9).')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special symbol (@$!%*?&#^).'),
  firstName: z.string().min(2, 'First name must be at least 2 characters.').max(100),
  lastName: z.string().min(2, 'Last name must be at least 2 characters.').max(100),
  phone: z.string().max(50).optional(),
  referralCode: z.string().max(50).optional(),
});

export const LoginRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  totpCode: z.string().length(6, 'TOTP authenticator code must be exactly 6 digits.').optional(),
});

export const OtpVerificationRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address.'),
  otpCode: z.string().length(6, 'One-Time Password (OTP) must be exactly 6 numerical digits.'),
});

export const TotpEnableRequestSchema = z.object({
  secret: z.string().min(16, 'Invalid TOTP secret seed format.'),
  totpCode: z.string().length(6, 'Please provide the 6-digit code from your authenticator app to confirm verification.'),
});

export type RegisterRequestInput = z.infer<typeof RegisterRequestSchema>;
export type LoginRequestInput = z.infer<typeof LoginRequestSchema>;
export type OtpVerificationRequestInput = z.infer<typeof OtpVerificationRequestSchema>;
export type TotpEnableRequestInput = z.infer<typeof TotpEnableRequestSchema>;
