/**
 * TeslaPrimeCapital — Admin Governance Database Repository (`admin.repository.ts`)
 */

import { prisma } from '@/lib/prisma';
import { User, Transaction, AuditLog, Prisma, UserRole, AccountStatus, TransactionStatus, TransactionType } from '@prisma/client';
import { DecimalUtil } from '@/utils/decimal.util';

export class AdminRepository {
  public async getExecutiveMetrics(): Promise<{
    totalUsersCount: number;
    activeInvestorsCount: number;
    totalDepositedUsd: string;
    totalWithdrawnUsd: string;
    totalLockedWithdrawalsUsd: string;
    activeInvestmentsUsd: string;
  }> {
    const [userCount, investorCount, wallets, activeInvs, pendingWithdrawals] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.INVESTOR, status: AccountStatus.ACTIVE } }),
      prisma.wallet.findMany({ where: { currency: 'USD' } }),
      prisma.activeInvestment.findMany({ where: { status: 'ACTIVE' } }),
      prisma.transaction.findMany({ where: { type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING_REVIEW, currency: 'USD' } }),
    ]);

    let totalDep = '0.00000000';
    let totalWth = '0.00000000';
    for (const w of wallets) {
      totalDep = DecimalUtil.add(totalDep, w.totalDeposited.toString());
      totalWth = DecimalUtil.add(totalWth, w.totalWithdrawn.toString());
    }

    let activeInvUsd = '0.00000000';
    for (const inv of activeInvs) {
      activeInvUsd = DecimalUtil.add(activeInvUsd, inv.principalAmount.toString());
    }

    let lockedWthUsd = '0.00000000';
    for (const pw of pendingWithdrawals) {
      lockedWthUsd = DecimalUtil.add(lockedWthUsd, pw.amount.toString());
    }

    return {
      totalUsersCount: userCount,
      activeInvestorsCount: investorCount,
      totalDepositedUsd: totalDep,
      totalWithdrawnUsd: totalWth,
      totalLockedWithdrawalsUsd: lockedWthUsd,
      activeInvestmentsUsd: activeInvUsd,
    };
  }

  public async getUsers(options: { page: number; limit: number; role?: string; status?: string }): Promise<{ users: User[]; totalCount: number }> {
    const where: any = {
      ...(options.role && { role: options.role as any }),
      ...(options.status && { status: options.status as any }),
    };
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (options.page - 1) * options.limit, take: options.limit }),
      prisma.user.count({ where }),
    ]);
    return { users, totalCount };
  }

  public async updateUserGovernance(adminId: string, data: { targetUserId: string; role?: UserRole; status?: AccountStatus; reason: string }): Promise<User> {
    return await prisma.$transaction(async (tx: any) => {
      const oldUser = await tx.user.findUnique({ where: { id: data.targetUserId } });
      const updated = await tx.user.update({
        where: { id: data.targetUserId },
        data: {
          ...(data.role && { role: data.role }),
          ...(data.status && { status: data.status }),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          actorRole: 'SUPER_ADMIN',
          actionType: 'USER_GOVERNANCE_UPDATE',
          resourceId: data.targetUserId,
          oldValue: { role: oldUser?.role, status: oldUser?.status },
          newValue: { role: updated.role, status: updated.status, reason: data.reason },
        },
      });

      return updated;
    });
  }

  public async getPendingWithdrawals(options: { page: number; limit: number }): Promise<{ transactions: (Transaction & { user: { email: string; firstName: string; lastName: string; kycTier: string } })[]; totalCount: number }> {
    const where = { type: TransactionType.WITHDRAWAL, status: TransactionStatus.PENDING_REVIEW };
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { user: { select: { email: true, firstName: true, lastName: true, kycTier: true } } },
        orderBy: { createdAt: 'asc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.transaction.count({ where }),
    ]);
    return { transactions, totalCount };
  }

  public async getPendingDeposits(options: { page: number; limit: number }): Promise<{ transactions: (Transaction & { user: { email: string; firstName: string; lastName: string; kycTier: string } })[]; totalCount: number }> {
    const where = { type: TransactionType.DEPOSIT, status: TransactionStatus.PENDING_REVIEW };
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { user: { select: { email: true, firstName: true, lastName: true, kycTier: true } } },
        orderBy: { createdAt: 'asc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.transaction.count({ where }),
    ]);
    return { transactions, totalCount };
  }

  /**
   * Executes deposit settlement sign-off inside an atomic Prisma transaction.
   * If APPROVED: credits availableBalance + totalDeposited, sets status COMPLETED.
   * If REJECTED: leaves all balances untouched, sets status REJECTED.
   */
  public async executeDepositDecision(adminId: string, data: {
    transactionId: string;
    action: 'APPROVE' | 'REJECT';
    notes?: string;
  }): Promise<Transaction & { user: { email: string; firstName: string } }> {
    return await prisma.$transaction(async (tx: any) => {
      const transaction = await tx.transaction.findUnique({
        where: { transactionId: data.transactionId },
        include: { user: { select: { email: true, firstName: true } } },
      });

      if (!transaction || transaction.type !== TransactionType.DEPOSIT || transaction.status !== TransactionStatus.PENDING_REVIEW) {
        throw new Error('ERR_TRANSACTION_NOT_PENDING: Deposit is not in PENDING_REVIEW state.');
      }

      const wallet = await tx.wallet.findUnique({ where: { id: transaction.walletId } });
      if (!wallet) throw new Error('ERR_WALLET_NOT_FOUND: Associated wallet not found.');

      const amtStr = transaction.amount.toString();

      if (data.action === 'APPROVE') {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            availableBalance: DecimalUtil.add(wallet.availableBalance.toString(), amtStr),
            totalDeposited: DecimalUtil.add(wallet.totalDeposited.toString(), amtStr),
          },
        });
      }

      const newStatus = data.action === 'APPROVE' ? TransactionStatus.COMPLETED : TransactionStatus.REJECTED;
      const updatedTx = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          approvedById: adminId,
          metadata: {
            ...((transaction.metadata as object) || {}),
            adminAction: data.action,
            adminNotes: data.notes || 'Treasury settlement review finalized',
            reviewedAt: new Date().toISOString(),
          },
        },
        include: { user: { select: { email: true, firstName: true } } },
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          actorRole: 'FINANCE_MANAGER',
          actionType: `DEPOSIT_${data.action}`,
          resourceId: transaction.transactionId,
          oldValue: { status: 'PENDING_REVIEW', amount: amtStr, currency: transaction.currency },
          newValue: { status: newStatus, notes: data.notes },
        },
      });

      return updatedTx;
    });
  }

  /**
   * Resolves the recipient set for a platform broadcast, segmented by audience.
   * Only ACTIVE retail investors are ever addressable.
   */
  public async getBroadcastAudienceContacts(audience: 'ALL_INVESTORS' | 'TIER_1_AND_ABOVE' | 'TIER_2_ONLY'): Promise<{ id: string; email: string; firstName: string }[]> {
    const kycFilter =
      audience === 'TIER_2_ONLY'
        ? { kycTier: 'TIER_2' as const }
        : audience === 'TIER_1_AND_ABOVE'
          ? { kycTier: { in: ['TIER_1' as const, 'TIER_2' as const] } }
          : {};

    return await prisma.user.findMany({
      where: {
        role: UserRole.INVESTOR,
        status: AccountStatus.ACTIVE,
        ...kycFilter,
      },
      select: { id: true, email: true, firstName: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Executes multi-sig treasury withdrawal disbursement sign-off inside atomic Prisma transaction.
   * If APPROVED: deducts lockedBalance, adds totalWithdrawn, sets status COMPLETED.
   * If REJECTED: returns lockedBalance back to availableBalance, sets status REJECTED.
   */
  public async executeWithdrawalDecision(adminId: string, data: {
    transactionId: string;
    action: 'APPROVE' | 'REJECT';
    notes?: string;
  }): Promise<Transaction & { user: { email: string; firstName: string } }> {
    return await prisma.$transaction(async (tx: any) => {
      const transaction = await tx.transaction.findUnique({
        where: { transactionId: data.transactionId },
        include: { user: { select: { email: true, firstName: true } } },
      });

      if (!transaction || transaction.status !== TransactionStatus.PENDING_REVIEW) {
        throw new Error('ERR_TRANSACTION_NOT_PENDING: Transaction is not in PENDING_REVIEW state.');
      }

      const wallet = await tx.wallet.findUnique({ where: { id: transaction.walletId } });
      if (!wallet) throw new Error('ERR_WALLET_NOT_FOUND: Associated wallet not found.');

      const amtStr = transaction.amount.toString();
      const lockedBefore = wallet.lockedBalance.toString();
      const newLocked = DecimalUtil.sub(lockedBefore, amtStr);

      if (data.action === 'APPROVE') {
        const newTotalWithdrawn = DecimalUtil.add(wallet.totalWithdrawn.toString(), amtStr);
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { lockedBalance: newLocked, totalWithdrawn: newTotalWithdrawn },
        });
      } else {
        // Rejected -> return funds to availableBalance
        const newAvailable = DecimalUtil.add(wallet.availableBalance.toString(), amtStr);
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { lockedBalance: newLocked, availableBalance: newAvailable },
        });
      }

      const newStatus = data.action === 'APPROVE' ? TransactionStatus.COMPLETED : TransactionStatus.REJECTED;
      const updatedTx = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          approvedById: adminId,
          metadata: {
            ...((transaction.metadata as object) || {}),
            adminAction: data.action,
            adminNotes: data.notes || 'Treasury review finalized',
            reviewedAt: new Date().toISOString(),
          },
        },
        include: { user: { select: { email: true, firstName: true } } },
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          actorRole: 'FINANCE_MANAGER',
          actionType: `WITHDRAWAL_${data.action}`,
          resourceId: transaction.transactionId,
          oldValue: { status: 'PENDING_REVIEW', amount: amtStr },
          newValue: { status: newStatus, notes: data.notes },
        },
      });

      return updatedTx;
    });
  }

  public async getAuditLogs(options: { page: number; limit: number }): Promise<{ logs: AuditLog[]; totalCount: number }> {
    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, skip: (options.page - 1) * options.limit, take: options.limit }),
      prisma.auditLog.count(),
    ]);
    return { logs, totalCount };
  }
}

export const adminRepository = new AdminRepository();
