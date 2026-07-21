/**
 * TeslaPrimeCapital — Structured Investment Plan Baseline Configuration
 * Enforces approved Phase 1 decisions: Lump Sum at Plan Maturity & Tier 0 Starter ($1k limit without KYC).
 * Includes car pictures (`imageUrl`) and checkmark features (`IMG_7582.jpeg` match).
 */

export interface IPlanConfiguration {
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
  imageUrl?: string;
  profitText?: string;
  features?: string[];
}

export const INVESTMENT_PLANS_CONFIG: readonly IPlanConfiguration[] = [
  {
    planId: 'plan-bronze',
    name: 'Bronze (BASE)',
    description: 'Perfect for getting started with Tesla investment. Featured vehicle: Model 3.',
    minDepositUsd: '1000.00000000',
    maxDepositUsd: '8000.00000000',
    termDays: 24,
    dailyRateNumeric: '0.01666667', // 40% over 24 days
    annualPercentageRate: '608.33%',
    payoutPolicy: 'LUMP_SUM_MATURITY',
    compoundingAllowed: false,
    requiresKycTier: 'TIER_0',
    imageUrl: '/branding/car-bronze.jpg',
    profitText: '40% Profit',
    features: ['Portfolio Access', 'Investment Dashboard', 'Email Support', 'Daily Accrual Tracking']
  },
  {
    planId: 'plan-silver',
    name: 'Silver',
    description: 'Enhanced returns for serious investors. Featured vehicle: Model Y / Cybertruck.',
    minDepositUsd: '5000.00000000',
    maxDepositUsd: '14999.00000000',
    termDays: 3,
    dailyRateNumeric: '0.21666667', // 65% over 3 days
    annualPercentageRate: '7908.33%',
    payoutPolicy: 'LUMP_SUM_MATURITY',
    compoundingAllowed: false,
    requiresKycTier: 'TIER_1',
    imageUrl: '/branding/car-silver.jpg',
    profitText: '65% Profit',
    features: ['Portfolio Access', 'Investment Dashboard', 'Email Support', 'Priority Liquidity Release']
  },
  {
    planId: 'plan-gold',
    name: 'Gold',
    description: 'Premium investment with exclusive benefits. Featured vehicle: Model S Plaid.',
    minDepositUsd: '10000.00000000',
    maxDepositUsd: '50000.00000000',
    termDays: 7,
    dailyRateNumeric: '0.11428571', // 80% over 7 days
    annualPercentageRate: '4171.43%',
    payoutPolicy: 'LUMP_SUM_MATURITY',
    compoundingAllowed: true,
    requiresKycTier: 'TIER_1',
    imageUrl: '/branding/car-gold.jpg',
    profitText: '80% Profit',
    features: ['Portfolio Access', 'Investment Dashboard', 'Email Support', 'Dedicated Account Manager']
  },
  {
    planId: 'plan-diamond',
    name: 'Diamond (Platinum)',
    description: 'Elite flagship capital management pool. Featured vehicle: Cybertruck / Roadster.',
    minDepositUsd: '50000.00000000',
    maxDepositUsd: '1000000.00000000',
    termDays: 14,
    dailyRateNumeric: '0.07071429', // 99% over 14 days
    annualPercentageRate: '2581.07%',
    payoutPolicy: 'LUMP_SUM_MATURITY',
    compoundingAllowed: true,
    requiresKycTier: 'TIER_2',
    imageUrl: '/branding/car-diamond.jpg',
    profitText: '99% Profit',
    features: ['Portfolio Access', 'Investment Dashboard', '24/7 VIP Phone Support', 'Instant Multi-Sig Release']
  }
] as const;
