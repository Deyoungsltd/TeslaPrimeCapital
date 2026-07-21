/**
 * TeslaPrimeCapital — Referral & Commission Database Repository (`referral.repository.ts`)
 */

import { prisma } from '@/lib/prisma';
import { User, CommissionLog, CommissionStatus } from '@prisma/client';

export class ReferralRepository {
  /**
   * Fetches affiliate summary statistics: direct referrals count, tier counts, and commission totals (`NUMERIC(20,8)`).
   */
  public async getReferralSummary(userId: string): Promise<{
    tier1Count: number;
    tier2Count: number;
    tier3Count: number;
    totalEarnedUsd: string;
    pendingVestingUsd: string;
  }> {
    const [tier1Users, commissions] = await Promise.all([
      prisma.user.findMany({
        where: { referredById: userId },
        select: { id: true },
      }),
      prisma.commissionLog.findMany({
        where: { referrerId: userId },
      }),
    ]);

    const tier1Ids = tier1Users.map((u: any) => u.id);
    let tier2Ids: string[] = [];
    let tier3Ids: string[] = [];

    if (tier1Ids.length > 0) {
      const tier2Users = await prisma.user.findMany({
        where: { referredById: { in: tier1Ids } },
        select: { id: true },
      });
      tier2Ids = tier2Users.map((u: any) => u.id);
    }

    if (tier2Ids.length > 0) {
      const tier3Users = await prisma.user.findMany({
        where: { referredById: { in: tier2Ids } },
        select: { id: true },
      });
      tier3Ids = tier3Users.map((u: any) => u.id);
    }

    let totalEarned = 0;
    let pendingVesting = 0;
    for (const c of commissions) {
      const amt = Number(c.commissionEarned.toString());
      if (c.status === CommissionStatus.CREDITED) totalEarned += amt;
      else if (c.status === CommissionStatus.PENDING_VESTING) pendingVesting += amt;
    }

    return {
      tier1Count: tier1Ids.length,
      tier2Count: tier2Ids.length,
      tier3Count: tier3Ids.length,
      totalEarnedUsd: totalEarned.toFixed(8),
      pendingVestingUsd: pendingVesting.toFixed(8),
    };
  }

  /**
   * Fetches paginated commission logs (`CommissionLog`) for an affiliate partner.
   */
  public async getCommissionLogs(userId: string, options: {
    page: number;
    limit: number;
    tierLevel?: number;
    status?: CommissionStatus;
  }): Promise<{ logs: (CommissionLog & { referredUser: { email: string; firstName: string; lastName: string } })[]; totalCount: number }> {
    const where: any = {
      referrerId: userId,
      ...(options.tierLevel && { tierLevel: options.tierLevel }),
      ...(options.status && { status: options.status }),
    };

    const [logs, totalCount] = await Promise.all([
      prisma.commissionLog.findMany({
        where,
        include: { referredUser: { select: { email: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.commissionLog.count({ where }),
    ]);

    return { logs, totalCount };
  }
}

export const referralRepository = new ReferralRepository();
