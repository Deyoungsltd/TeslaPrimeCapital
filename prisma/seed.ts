/**
 * TeslaPrimeCapital — Database Seeder (`prisma/seed.ts`)
 * Self-contained seeder designed to run cleanly across Windows, Linux, ESM, and CJS.
 * Populates initial investment plans, default super-admin, and initial system state.
 */

import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const INVESTMENT_PLANS_CONFIG = [
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

async function main() {
  console.log('Seeding TeslaPrimeCapital enterprise database state...');

  // 1. Seed Investment Plans
  for (const plan of INVESTMENT_PLANS_CONFIG) {
    await prisma.plan.upsert({
      where: { planId: plan.planId },
      update: {
        name: plan.name,
        description: plan.description,
        minDepositUsd: plan.minDepositUsd,
        maxDepositUsd: plan.maxDepositUsd,
        termDays: plan.termDays,
        dailyRateNumeric: plan.dailyRateNumeric,
        annualPercentageRate: plan.annualPercentageRate,
        payoutPolicy: plan.payoutPolicy as any,
        compoundingAllowed: plan.compoundingAllowed,
        requiresKycTier: plan.requiresKycTier as any,
        isActive: true,
      },
      create: {
        planId: plan.planId,
        name: plan.name,
        description: plan.description,
        minDepositUsd: plan.minDepositUsd,
        maxDepositUsd: plan.maxDepositUsd,
        termDays: plan.termDays,
        dailyRateNumeric: plan.dailyRateNumeric,
        annualPercentageRate: plan.annualPercentageRate,
        payoutPolicy: plan.payoutPolicy as any,
        compoundingAllowed: plan.compoundingAllowed,
        requiresKycTier: plan.requiresKycTier as any,
        isActive: true,
      },
    });
    console.log(`Upserted Plan: ${plan.name} (${plan.planId})`);
  }

  // 2. Seed Default Super-Admin User
  const adminEmail = 'superadmin@teslaprimecapital.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const defaultPasswordHash = await argon2.hash('SuperAdmin@TeslaPrime2026!', {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: defaultPasswordHash,
        firstName: 'System',
        lastName: 'SuperAdmin',
        role: 'SUPER_ADMIN' as any,
        status: 'ACTIVE' as any,
        kycTier: 'TIER_2' as any,
        twoFactorEnabled: true,
        referralCode: 'TESLA_SUPER_ADMIN',
      },
    });
    console.log(`Created Super-Admin account: ${adminUser.email} (ID: ${adminUser.id})`);
  } else {
    console.log(`Super-Admin account already exists (${adminEmail}). Skipping creation.`);
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Fatal exception during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
