import { describe, it, expect } from 'vitest';
import { RegisterRequestSchema, LoginRequestSchema } from '../../src/server/validators/auth.validator';
import { DepositInitiationSchema, WithdrawalInitiationSchema } from '../../src/server/validators/wallet.validator';
import { InvestmentAllocationSchema } from '../../src/server/validators/investment.validator';

describe('Zod Validation Boundaries — Enterprise Security & Input Defense Suite', () => {
  it('rejects passwords that fail to meet strict 12-character complexity thresholds', () => {
    const weakResult = RegisterRequestSchema.safeParse({
      email: 'investor@teslaprimecapital.com',
      password: 'weakpassword',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(weakResult.success).toBe(false);

    const strongResult = RegisterRequestSchema.safeParse({
      email: 'investor@teslaprimecapital.com',
      password: 'SecureEnterprise@Password2026!',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(strongResult.success).toBe(true);
  });

  it('rejects withdrawal requests lacking a valid 6-digit TOTP Two-Factor code', () => {
    const invalidWth = WithdrawalInitiationSchema.safeParse({
      amount: '500.00000000',
      currency: 'USD',
      destinationAddressOrBank: 'IBAN US88239018239018230',
      totpCode: '1234', // Only 4 digits
    });
    expect(invalidWth.success).toBe(false);

    const validWth = WithdrawalInitiationSchema.safeParse({
      amount: '500.00000000',
      currency: 'USD',
      destinationAddressOrBank: 'IBAN US88239018239018230',
      totpCode: '481923',
    });
    expect(validWth.success).toBe(true);
  });

  it('rejects investment allocations with negative or non-numeric amount boundaries', () => {
    const invalidAlloc = InvestmentAllocationSchema.safeParse({
      planId: 'plan-prime-growth',
      amountUsd: '-5000.00',
    });
    expect(invalidAlloc.success).toBe(false);
  });
});
