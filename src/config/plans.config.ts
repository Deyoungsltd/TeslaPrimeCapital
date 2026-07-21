/**
 * TeslaPrimeCapital — Structured Investment Plan Baseline Configuration
 * Enforces approved Phase 1 decisions: Lump Sum at Plan Maturity & Tier 0 Starter ($1k limit without KYC).
 */

export interface IPlanConfiguration {
  planId: string;
  name: string;
  description: string;
  minDepositUsd: string;
  maxDepositUsd: string;
  termDays: number;
  dailyRateNumeric: string; // e.g. '0.00350000' for 0.35% daily
  annualPercentageRate: string; // e.g. '127.75%'
  payoutPolicy: 'LUMP_SUM_MATURITY';
  compoundingAllowed: boolean;
  requiresKycTier: 'TIER_0' | 'TIER_1' | 'TIER_2';
}

export const INVESTMENT_PLANS_CONFIG: readonly IPlanConfiguration[] = [
  {
    planId: 'plan-starter-fixed',
    name: 'Starter Fixed Yield',
    description: 'Accessible 30-day structured allocation designed for onboarding retail investors. No KYC required up to $1,000.',
    minDepositUsd: '100.00000000',
    maxDepositUsd: '4999.00000000',
    termDays: 30,
    dailyRateNumeric: '0.00250000', // 0.25% daily -> 7.5% per 30-day term
    annualPercentageRate: '91.25%',
    payoutPolicy: 'LUMP_SUM_MATURITY',
    compoundingAllowed: false,
    requiresKycTier: 'TIER_0'
  },
  {
    planId: 'plan-prime-growth',
    name: 'Prime Dynamic Growth',
    description: 'High-performance 90-day algorithmic capital allocation with optional rollover maturity rules.',
    minDepositUsd: '5000.00000000',
    maxDepositUsd: '49999.00000000',
    termDays: 90,
    dailyRateNumeric: '0.00400000', // 0.40% daily -> 36% per 90-day term
    annualPercentageRate: '146.00%',
    payoutPolicy: 'LUMP_SUM_MATURITY',
    compoundingAllowed: true,
    requiresKycTier: 'TIER_1'
  },
  {
    planId: 'plan-institutional-apex',
    name: 'Institutional Apex Strategy',
    description: 'Bespoke high-liquidity capital management pool for institutional syndicates and high-net-worth clients.',
    minDepositUsd: '50000.00000000',
    maxDepositUsd: '1000000.00000000',
    termDays: 180,
    dailyRateNumeric: '0.00550000', // 0.55% daily -> 99% per 180-day term
    annualPercentageRate: '200.75%',
    payoutPolicy: 'LUMP_SUM_MATURITY',
    compoundingAllowed: true,
    requiresKycTier: 'TIER_2'
  }
] as const;
