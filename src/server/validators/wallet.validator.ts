/**
 * TeslaPrimeCapital — Strict Zod Wallet & Ledger Validation Schemas (`wallet.validator.ts`)
 */

import { z } from 'zod';
import { APP_CONFIG } from '@/config/app.config';

const supportedCodes = APP_CONFIG.supportedCurrencies.map((c) => c.code) as [string, ...string[]];

export const CurrencyQuerySchema = z.object({
  currency: z.enum(supportedCodes).optional(),
});

export const TransactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'INVESTMENT_LOCK', 'YIELD_PAYOUT', 'COMMISSION', 'PENALTY', 'EXCHANGE']).optional(),
  status: z.enum(['PENDING_REVIEW', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED']).optional(),
  currency: z.enum(supportedCodes).optional(),
});

export const DepositInitiationSchema = z.object({
  amount: z
    .string()
    .min(1, 'Deposit amount is required.')
    .regex(/^\d+(\.\d{1,8})?$/, 'Amount must be a positive number with up to 8 decimal places.'),
  currency: z.enum(supportedCodes, {
    errorMap: () => ({ message: 'Please select a valid supported fiat or digital currency.' }),
  }),
  gateway: z.enum(['STRIPE', 'COINPAYMENTS', 'BANK_WIRE'], {
    errorMap: () => ({ message: 'Please select a valid payment gateway (`STRIPE`, `COINPAYMENTS`, `BANK_WIRE`).' }),
  }),
});

export const WithdrawalInitiationSchema = z.object({
  amount: z
    .string()
    .min(1, 'Withdrawal amount is required.')
    .regex(/^\d+(\.\d{1,8})?$/, 'Amount must be a positive number with up to 8 decimal places.'),
  currency: z.enum(supportedCodes),
  destinationAddressOrBank: z.string().min(5, 'Please enter your complete bank account IBAN/SWIFT or crypto wallet destination address.').max(255),
  totpCode: z.string().length(6, 'Mandatory Two-Factor Authentication (TOTP) 6-digit code is required to authorize withdrawals.'),
});

export const ExchangeInitiationSchema = z.object({
  fromCurrency: z.enum(supportedCodes),
  toCurrency: z.enum(supportedCodes),
  amount: z
    .string()
    .min(1, 'Exchange amount is required.')
    .regex(/^\d+(\.\d{1,8})?$/, 'Amount must be a positive number with up to 8 decimal places.'),
});

export type TransactionQueryInput = z.infer<typeof TransactionQuerySchema>;
export type DepositInitiationInput = z.infer<typeof DepositInitiationSchema>;
export type WithdrawalInitiationInput = z.infer<typeof WithdrawalInitiationSchema>;
export type ExchangeInitiationInput = z.infer<typeof ExchangeInitiationSchema>;
