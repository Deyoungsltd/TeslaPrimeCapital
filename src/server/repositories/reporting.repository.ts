/**
 * TeslaPrimeCapital — Reporting & Analytics Database Repository (`reporting.repository.ts`)
 */

import { prisma } from '@/lib/prisma';
import { DecimalUtil } from '@/utils/decimal.util';

export class ReportingRepository {
  public async getUserAnalyticsSummary(userId: string): Promise<{
    totalDepositedUsd: string;
    totalWithdrawnUsd: string;
    totalActiveCapitalUsd: string;
    totalYieldAccruedUsd: string;
    totalCommissionsUsd: string;
    recentAccruals: { date: string; yieldEarned: string; planName: string }[];
  }> {
    const [wallets, activeInvs, accrualLogs, commissionLogs] = await Promise.all([
      prisma.wallet.findMany({ where: { userId, currency: 'USD' } }),
      prisma.activeInvestment.findMany({ where: { userId, status: 'ACTIVE' }, include: { plan: true } }),
      prisma.accrualLog.findMany({
        where: { activeInvestment: { userId } },
        include: { activeInvestment: { include: { plan: true } } },
        orderBy: { accrualDate: 'desc' },
        take: 30,
      }),
      prisma.commissionLog.findMany({ where: { referrerId: userId, status: 'CREDITED' } }),
    ]);

    let dep = '0.00000000';
    let wth = '0.00000000';
    for (const w of wallets) {
      dep = DecimalUtil.add(dep, w.totalDeposited.toString());
      wth = DecimalUtil.add(wth, w.totalWithdrawn.toString());
    }

    let activeCap = '0.00000000';
    let yieldAccrued = '0.00000000';
    for (const inv of activeInvs) {
      activeCap = DecimalUtil.add(activeCap, inv.principalAmount.toString());
      yieldAccrued = DecimalUtil.add(yieldAccrued, inv.currentAccruedYield.toString());
    }

    let commissions = '0.00000000';
    for (const c of commissionLogs) {
      commissions = DecimalUtil.add(commissions, c.commissionEarned.toString());
    }

    const formattedAccruals = accrualLogs.map((a: any) => ({
      date: a.accrualDate.toISOString().slice(0, 10),
      yieldEarned: a.yieldEarned.toString(),
      planName: a.activeInvestment.plan.name,
    }));

    return {
      totalDepositedUsd: dep,
      totalWithdrawnUsd: wth,
      totalActiveCapitalUsd: activeCap,
      totalYieldAccruedUsd: yieldAccrued,
      totalCommissionsUsd: commissions,
      recentAccruals: formattedAccruals,
    };
  }

  public async getExportableTransactions(userId: string): Promise<any[]> {
    return await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const reportingRepository = new ReportingRepository();
