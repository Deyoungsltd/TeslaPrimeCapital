/**
 * TeslaPrimeCapital — Investment DTOs
 */

export interface IPlanDTO {
  id: string;
  planId: string;
  name: string;
  description: string;
  minDepositUsd: string;
  maxDepositUsd: string;
  termDays: number;
  dailyRateNumeric: string;
  annualPercentageRate: string;
  payoutPolicy: 'LUMP_SUM_MATURITY';
  compoundingAllowed: boolean;
  requiresKycTier: 'TIER_0' | 'TIER_1' | 'TIER_2';
  isActive: boolean;
}

export interface IInvestmentAllocationRequest {
  planId: string;
  amountUsd: string; // Must be exact NUMERIC(20,8) string within min/max bounds
}

export interface IActiveInvestmentDTO {
  id: string;
  planName: string;
  principalAmount: string;
  currentAccruedYield: string;
  status: 'ACTIVE' | 'MATURED' | 'CANCELLED';
  payoutPolicy: 'LUMP_SUM_MATURITY';
  startDate: string;
  maturityDate: string;
  nextAccrualAt: string;
}
