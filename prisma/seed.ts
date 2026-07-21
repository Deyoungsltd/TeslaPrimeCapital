/**
 * TeslaPrimeCapital — Database Seeder (`prisma/seed.ts`)
 * Self-contained seeder designed to run cleanly across Windows, Linux, ESM, and CJS.
 * Populates initial investment plans with car pictures (`imageUrl`) and checkmark features (`IMG_7582.jpeg` match).
 */

import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const INVESTMENT_PLANS_CONFIG = [
  {
    planId: 'plan-bronze',
    name: 'Bronze (BASE)',
    description: 'Perfect for getting started with Tesla investment. Featured vehicle: Model 3.',
    minDepositUsd: '1000.00000000',
    maxDepositUsd: '8000.00000000',
    termDays: 24,
    dailyRateNumeric: '0.01666667',
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
    dailyRateNumeric: '0.21666667',
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
    dailyRateNumeric: '0.11428571',
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
    dailyRateNumeric: '0.07071429',
    annualPercentageRate: '2581.07%',
    payoutPolicy: 'LUMP_SUM_MATURITY',
    compoundingAllowed: true,
    requiresKycTier: 'TIER_2',
    imageUrl: '/branding/car-diamond.jpg',
    profitText: '99% Profit',
    features: ['Portfolio Access', 'Investment Dashboard', '24/7 VIP Phone Support', 'Instant Multi-Sig Release']
  }
] as const;

async function main() {
  console.log('Seeding TeslaPrimeCapital enterprise database state...');

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
        imageUrl: plan.imageUrl,
        profitText: plan.profitText,
        features: plan.features as any,
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
        imageUrl: plan.imageUrl,
        profitText: plan.profitText,
        features: plan.features as any,
      },
    });
    console.log(`Upserted Plan with Car Picture: ${plan.name} (${plan.planId})`);
  }

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
