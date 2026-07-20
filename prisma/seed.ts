/**
 * TeslaPrimeCapital — Database Seeder (`prisma/seed.ts`)
 * Populates initial investment plans, default super-admin, and initial system state.
 */

import { PrismaClient } from '@prisma/client';
import { INVESTMENT_PLANS_CONFIG } from '../src/config/plans.config';
import { CryptoUtil } from '../src/utils/crypto.util';

const prisma = new PrismaClient();

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
        payoutPolicy: plan.payoutPolicy,
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
        payoutPolicy: plan.payoutPolicy,
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
    const defaultPasswordHash = await CryptoUtil.hashPassword('SuperAdmin@TeslaPrime2026!');
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
