/**
 * TeslaPrimeCapital — Reporting & Analytics Domain Service (`reporting.service.ts`)
 */

import { reportingRepository } from '../repositories/reporting.repository';
import { userRepository } from '../repositories/user.repository';
import { DecimalUtil } from '@/utils/decimal.util';

export class ReportingService {
  public async getUserAnalytics(userId: string) {
    return await reportingRepository.getUserAnalyticsSummary(userId);
  }

  /**
   * Generates a strict, exportable CSV financial tax statement for an investor.
   */
  public async generateUserTaxStatementCsv(userId: string): Promise<string> {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('ERR_USER_NOT_FOUND: User identity not found.');

    const transactions = await reportingRepository.getExportableTransactions(userId);
    const summary = await reportingRepository.getUserAnalyticsSummary(userId);

    let csv = `TESLAPRIME CAPITAL — ENTERPRISE FINANCIAL TAX STATEMENT\n`;
    csv += `Account Holder,${user.firstName} ${user.lastName}\n`;
    csv += `Email Address,${user.email}\n`;
    csv += `Statement Generated (UTC),${new Date().toISOString()}\n`;
    csv += `Verified Compliance Level,${user.kycTier}\n\n`;

    csv += `PORTFOLIO SUMMARY\n`;
    csv += `Total Lifetime Deposited (USD),${DecimalUtil.formatFiat(summary.totalDepositedUsd)}\n`;
    csv += `Total Lifetime Withdrawn (USD),${DecimalUtil.formatFiat(summary.totalWithdrawnUsd)}\n`;
    csv += `Total Active Capital Allocations (USD),${DecimalUtil.formatFiat(summary.totalActiveCapitalUsd)}\n`;
    csv += `Total Accrued Compounding Yield (USD),${DecimalUtil.formatFiat(summary.totalYieldAccruedUsd)}\n`;
    csv += `Total Affiliate Referral Commissions (USD),${DecimalUtil.formatFiat(summary.totalCommissionsUsd)}\n\n`;

    csv += `COMPLETE DOUBLE-ENTRY TRANSACTION LEDGER\n`;
    csv += `Reference ID,Timestamp (UTC),Operation Type,Exact Amount (NUMERIC(20.8)),Currency,Ledger Status,Idempotency Key\n`;

    for (const tx of transactions) {
      csv += `${tx.transactionId},"${tx.createdAt.toISOString()}",${tx.type},${tx.amount.toString()},${tx.currency},${tx.status},${tx.idempotencyKey}\n`;
    }

    return csv;
  }
}

export const reportingService = new ReportingService();
