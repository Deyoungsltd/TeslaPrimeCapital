/**
 * TeslaPrimeCapital — Static Marketing Mirror of the Seeded Plan Registry.
 *
 * These definitions MUST stay numerically identical to prisma/seed.ts — the
 * marketing site and the live allocation engine quote the same term sheets.
 * No vanity percentages, no vehicle props, no "guaranteed profit" language:
 * every figure here is a rate the settlement engine actually honors.
 */
export interface IMarketingPlanDefinition {
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
  imageUrl: string;
  features: string[];
}

export const INVESTMENT_PLANS_CONFIG: IMarketingPlanDefinition[] = [
  {
    planId: 'plan-starter-fixed',
    name: 'Starter Fixed Yield',
    description: 'A 30-day, term-locked allocation with a fixed daily rate — the on-ramp tier. No identity verification is required up to the $1,000 Tier-0 ceiling.',
    minDepositUsd: '100.00000000',
    maxDepositUsd: '4999.00000000',
    termDays: 30,
    dailyRateNumeric: '0.00250000',
    annualPercentageRate: '91.25%',
    payoutPolicy: 'LUMP_SUM_MATURITY',
    compoundingAllowed: false,
    requiresKycTier: 'TIER_0',
    imageUrl: '/branding/car-bronze.jpg',
    features: [
      'Fixed 0.25% daily accrual at 00:00 UTC',
      'Principal + yield settle in one lump sum at maturity',
      'Line-by-line accrual log from day one',
      'Referral engine eligible (5% · 2% · 1%)',
    ],
  },
  {
    planId: 'plan-prime-growth',
    name: 'Prime Dynamic Growth',
    description: 'A 90-day compounding position for verified clients. Daily yield rolls back into principal each settlement run, so the base grows every single day of the term.',
    minDepositUsd: '5000.00000000',
    maxDepositUsd: '49999.00000000',
    termDays: 90,
    dailyRateNumeric: '0.00400000',
    annualPercentageRate: '146.00%',
    payoutPolicy: 'LUMP_SUM_MATURITY',
    compoundingAllowed: true,
    requiresKycTier: 'TIER_1',
    imageUrl: '/branding/car-gold.jpg',
    features: [
      '0.40% daily rate, compounded every 00:00 UTC',
      'Verified Tier-1 document clearance required',
      'TOTP-secured, human-reviewed withdrawals',
      'Line-by-line accrual log from day one',
    ],
  },
  {
    planId: 'plan-institutional-apex',
    name: 'Institutional Apex Strategy',
    description: 'A 180-day, high-liquidity mandate for fully verified institutional clients and syndicates — the platform’s longest term and deepest review standards.',
    minDepositUsd: '50000.00000000',
    maxDepositUsd: '1000000.00000000',
    termDays: 180,
    dailyRateNumeric: '0.00550000',
    annualPercentageRate: '200.75%',
    payoutPolicy: 'LUMP_SUM_MATURITY',
    compoundingAllowed: true,
    requiresKycTier: 'TIER_2',
    imageUrl: '/branding/car-diamond.jpg',
    features: [
      '0.55% daily rate, compounded every 00:00 UTC',
      'Tier-2 institutional verification required',
      'Human-reviewed, multi-attestation withdrawals',
      'Institutional-grade audit reporting',
    ],
  },
];
