/**
 * TeslaPrimeCapital — Wallet & Ledger Database Repository (`wallet.repository.ts`)
 * Encapsulates all Prisma queries for multi-currency wallets and double-entry transaction records.
 */

import { prisma } from '@/lib/prisma';
import { Wallet, Transaction, Prisma, TransactionType, TransactionStatus } from '@prisma/client';
import { DecimalUtil } from '@/utils/decimal.util';

export class WalletRepository {
  public async findByUserIdAndCurrency(userId: string, currency: string): Promise<Wallet | null> {
    return await prisma.wallet.findUnique({
      where: {
        userId_currency: {
          userId,
          currency: currency.toUpperCase(),
        },
      },
    });
  }

  public async findAllByUserId(userId: string): Promise<Wallet[]> {
    return await prisma.wallet.findMany({
      where: { userId },
      orderBy: { currency: 'asc' },
    });
  }

  public async upsertWallet(userId: string, currency: string): Promise<Wallet> {
    return await prisma.wallet.upsert({
      where: {
        userId_currency: {
          userId,
          currency: currency.toUpperCase(),
        },
      },
      update: {},
      create: {
        userId,
        currency: currency.toUpperCase(),
        availableBalance: '0.00000000',
        lockedBalance: '0.00000000',
        totalDeposited: '0.00000000',
        totalWithdrawn: '0.00000000',
      },
    });
  }

  public async findTransactionsByUserId(userId: string, options: {
    page: number;
    limit: number;
    type?: TransactionType;
    status?: TransactionStatus;
    currency?: string;
  }): Promise<{ transactions: Transaction[]; totalCount: number }> {
    const where: any = {
      userId,
      ...(options.type && { type: options.type }),
      ...(options.status && { status: options.status }),
      ...(options.currency && { currency: options.currency.toUpperCase() }),
    };

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, totalCount };
  }

  public async createTransaction(data: {
    transactionId: string;
    userId: string;
    walletId: string;
    type: TransactionType;
    amount: string;
    currency: string;
    status: TransactionStatus;
    metadata?: any;
    idempotencyKey: string;
  }): Promise<Transaction> {
    return await prisma.transaction.create({
      data: {
        transactionId: data.transactionId,
        userId: data.userId,
        walletId: data.walletId,
        type: data.type,
        amount: data.amount,
        currency: data.currency.toUpperCase(),
        status: data.status,
        metadata: data.metadata ?? undefined,
        idempotencyKey: data.idempotencyKey,
      },
    });
  }

  /**
   * Executes an atomic withdrawal locking transaction: debits available, credits locked, and writes ledger record.
   */
  public async executeWithdrawalLock(
    walletId: string,
    newAvailable: string,
    newLocked: string,
    transactionData: {
      transactionId: string;
      userId: string;
      amount: string;
      currency: string;
      destination: string;
      idempotencyKey: string;
    }
  ): Promise<Transaction> {
    return await prisma.$transaction(async (tx: any) => {
      // 1. Update wallet balance with exact Decimal strings
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          availableBalance: newAvailable,
          lockedBalance: newLocked,
        },
      });

      // 2. Create double-entry pending withdrawal transaction
      return await tx.transaction.create({
        data: {
          transactionId: transactionData.transactionId,
          userId: transactionData.userId,
          walletId: walletId,
          type: TransactionType.WITHDRAWAL,
          amount: transactionData.amount,
          currency: transactionData.currency.toUpperCase(),
          status: TransactionStatus.PENDING_REVIEW, // Strictly enforcing 100% Mandatory Admin Review rule
          metadata: {
            destinationAddressOrBank: transactionData.destination,
            lockReason: 'USER_WITHDRAWAL_REQUEST_SUBMITTED',
            reviewedByAdmin: false,
          },
          idempotencyKey: transactionData.idempotencyKey,
        },
      });
    });
  }
}

export const walletRepository = new WalletRepository();
