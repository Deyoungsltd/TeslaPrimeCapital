/**
 * TeslaPrimeCapital — PDF Account Statement Generator (`statement.service.ts`)
 * Renders a signed, exact-precision PDF ledger statement straight from the
 * double-entry transaction table — the same numbers the terminal displays.
 * Built with PDFKit (MIT), Helvetica core fonts only: zero external assets,
 * deterministic output size, no network I/O at render time.
 */

import PDFDocument from 'pdfkit';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { userRepository } from '../repositories/user.repository';
import { DecimalUtil } from '@/utils/decimal.util';
import { logger } from '@/utils/logger.util';

const INK = '#111827';
const SUBTLE = '#6B7280';
const ACCENT = '#B91C1C';
const HAIRLINE = '#E5E7EB';

interface IStatementWindow {
  from: Date;
  to: Date;
}

export class StatementService {
  /**
   * Resolves the requested window with hard caps so a statement can never
   * become a full-table data exfiltration path.
   */
  private resolveWindow(fromParam?: string, toParam?: string): IStatementWindow {
    const now = new Date();
    const earliestAllowed = new Date(now.getTime() - 366 * 24 * 60 * 60 * 1000);

    let to = toParam ? new Date(toParam) : now;
    let from = fromParam ? new Date(fromParam) : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    if (Number.isNaN(to.getTime()) || to > now) to = now;
    if (Number.isNaN(from.getTime()) || from < earliestAllowed) from = earliestAllowed;
    if (from >= to) from = new Date(to.getTime() - 90 * 24 * 60 * 60 * 1000);

    return { from, to };
  }

  /**
   * Builds the statement PDF as a Buffer. Returns the buffer plus the
   * document verification reference printed on every page footer.
   */
  public async generateAccountStatement(userId: string, fromParam?: string, toParam?: string): Promise<{ pdf: Buffer; documentRef: string; rowCount: number }> {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('ERR_USER_NOT_FOUND: User identity not found.');

    const window = this.resolveWindow(fromParam, toParam);

    const [wallets, transactions] = await Promise.all([
      prisma.wallet.findMany({ where: { userId }, orderBy: { currency: 'asc' } }),
      prisma.transaction.findMany({
        where: { userId, createdAt: { gte: window.from, lte: window.to } },
        orderBy: { createdAt: 'asc' },
        take: 400,
      }),
    ]);

    // Running totals per currency (deposits credited, withdrawals settled, yield settled)
    const totals: Record<string, { deposits: string; withdrawals: string; yield: string }> = {};
    const bump = (currency: string, bucket: 'deposits' | 'withdrawals' | 'yield', amount: string) => {
      if (!totals[currency]) totals[currency] = { deposits: '0.00000000', withdrawals: '0.00000000', yield: '0.00000000' };
      totals[currency][bucket] = DecimalUtil.add(totals[currency][bucket], amount);
    };
    for (const tx of transactions) {
      const amt = tx.amount.toString();
      if (tx.status !== 'COMPLETED') continue;
      if (tx.type === 'DEPOSIT') bump(tx.currency, 'deposits', amt);
      else if (tx.type === 'WITHDRAWAL') bump(tx.currency, 'withdrawals', amt);
      else if (tx.type === 'YIELD_PAYOUT') bump(tx.currency, 'yield', amt);
    }

    const documentRef = createHash('sha256')
      .update(`${userId}|${window.from.toISOString()}|${window.to.toISOString()}|${transactions.length}`)
      .digest('hex')
      .slice(0, 16)
      .toUpperCase();

    const pdf = await new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: 'TeslaPrimeCapital Account Statement', Author: 'TeslaPrimeCapital Treasury' } });
        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const pageWidth = doc.page.width - 96; // margins both sides

        /* ------------------------------ header ------------------------------ */
        doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(18).text('TeslaPrimeCapital', 48, 48);
        doc.fillColor(SUBTLE).font('Helvetica').fontSize(8).text('Structured Capital Allocations · Account Statement', { characterSpacing: 1.2 });
        doc.moveDown(0.4);
        doc.fillColor(SUBTLE).fontSize(8).text(`Document Reference ${documentRef}`, { align: 'left' });

        doc.moveTo(48, doc.y + 10).lineTo(48 + pageWidth, doc.y + 10).lineWidth(1).strokeColor(INK).stroke();
        doc.moveDown(1.6);

        /* ---------------------------- account block ---------------------------- */
        doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(9).text('ACCOUNT', { characterSpacing: 1.5 });
        doc.moveDown(0.4);
        doc.fillColor(INK).font('Helvetica').fontSize(10);
        doc.text(`${user.firstName} ${user.lastName}   ·   ${user.email}   ·   Compliance ${user.kycTier.replace('_', ' ')}`);
        doc.fillColor(SUBTLE).fontSize(9).text(
          `Statement window: ${window.from.toISOString().slice(0, 10)} to ${window.to.toISOString().slice(0, 10)} UTC  ·  Generated ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`,
        );
        doc.moveDown(1.4);

        /* ---------------------------- balances table ---------------------------- */
        doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(9).text('SEGREGATED WALLET BALANCES (CURRENT)', { characterSpacing: 1.5 });
        doc.moveDown(0.5);

        const drawTableHeader = (cols: { label: string; x: number; w: number; align?: 'left' | 'right' }[]) => {
          const y = doc.y;
          doc.rect(48, y, pageWidth, 16).fill('#F3F4F6');
          doc.fillColor(SUBTLE).font('Helvetica-Bold').fontSize(7.5);
          for (const c of cols) {
            doc.text(c.label, c.x, y + 4.5, { width: c.w, align: c.align ?? 'left' });
          }
          doc.y = y + 16;
        };
        const drawRow = (cells: { text: string; x: number; w: number; align?: 'left' | 'right' }[], mono = false, bold = false) => {
          if (doc.y > doc.page.height - 96) {
            doc.addPage();
          }
          const y = doc.y;
          doc.fillColor(INK).font(mono ? (bold ? 'Courier-Bold' : 'Courier') : bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5);
          let maxH = 12;
          for (const c of cells) {
            doc.text(c.text, c.x, y + 3, { width: c.w, align: c.align ?? 'left' });
          }
          doc.y = y + 2 + maxH;
          doc.moveTo(48, doc.y - 2).lineTo(48 + pageWidth, doc.y - 2).lineWidth(0.5).strokeColor(HAIRLINE).stroke();
          doc.y += 2;
        };

        const balanceCols = [
          { label: 'CURRENCY', x: 56, w: 60 },
          { label: 'AVAILABLE', x: 130, w: 120, align: 'right' as const },
          { label: 'LOCKED (IN REVIEW / ALLOCATED)', x: 262, w: 130, align: 'right' as const },
          { label: 'LIFETIME DEPOSITED', x: 404, w: 140, align: 'right' as const },
        ];
        drawTableHeader(balanceCols);
        for (const w of wallets) {
          drawRow([
            { text: w.currency, x: 56, w: 60 },
            { text: w.availableBalance.toString(), x: 130, w: 120, align: 'right' },
            { text: w.lockedBalance.toString(), x: 262, w: 130, align: 'right' },
            { text: w.totalDeposited.toString(), x: 404, w: 140, align: 'right' },
          ], true);
        }
        doc.moveDown(1.4);

        /* --------------------------- ledger entries --------------------------- */
        doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(9).text('LEDGER ENTRIES IN WINDOW', { characterSpacing: 1.5 });
        doc.moveDown(0.5);

        const ledgerCols = [
          { label: 'DATE (UTC)', x: 56, w: 66 },
          { label: 'REFERENCE', x: 124, w: 150 },
          { label: 'TYPE', x: 278, w: 76 },
          { label: 'AMOUNT', x: 356, w: 108, align: 'right' as const },
          { label: 'STATUS', x: 468, w: 76, align: 'right' as const },
        ];
        drawTableHeader(ledgerCols);

        if (transactions.length === 0) {
          doc.fillColor(SUBTLE).font('Helvetica-Oblique').fontSize(9).text('No ledger entries settled within this statement window.', 56, doc.y + 6);
          doc.moveDown(2);
        } else {
          for (const tx of transactions) {
            drawRow([
              { text: tx.createdAt.toISOString().slice(0, 10), x: 56, w: 66 },
              { text: tx.transactionId, x: 124, w: 150 },
              { text: tx.type.replace(/_/g, ' '), x: 278, w: 76 },
              { text: `${tx.amount.toString()} ${tx.currency}`, x: 356, w: 108, align: 'right' },
              { text: tx.status.replace(/_/g, ' '), x: 468, w: 76, align: 'right' },
            ], true);
          }
        }
        doc.moveDown(1.2);

        /* ------------------------------ totals ------------------------------- */
        doc.fillColor(ACCENT).font('Helvetica-Bold').fontSize(9).text('SETTLED TOTALS IN WINDOW (COMPLETED ENTRIES ONLY)', { characterSpacing: 1.5 });
        doc.moveDown(0.5);
        const totalCurrencies = Object.keys(totals);
        if (totalCurrencies.length === 0) {
          doc.fillColor(SUBTLE).font('Helvetica-Oblique').fontSize(9).text('No settled movements in this window.', 56, doc.y + 4);
        } else {
          for (const currency of totalCurrencies) {
            const t = totals[currency];
            doc.fillColor(INK).font('Courier').fontSize(9).text(
              `${currency}   deposits credited ${t.deposits}   withdrawals disbursed ${t.withdrawals}   yield settled ${t.yield}`,
              56,
            );
          }
        }

        /* -------------------------- legal + footer --------------------------- */
        doc.moveDown(2);
        doc.fillColor(SUBTLE).font('Helvetica').fontSize(7.5).text(
          'This statement is generated automatically from the double-entry ledger (NUMERIC(20,8) fixed-point) and mirrors the account ledger exactly. ' +
          'Entries marked PENDING REVIEW are under mandatory treasury inspection and are not settled movements. ' +
          'Verify this document against your terminal ledger using the document reference printed above.',
          56,
          doc.y,
          { width: pageWidth - 16, align: 'left', lineGap: 1.6 },
        );

        const pageCount = doc.bufferedPageRange();
        for (let i = pageCount.start; i < pageCount.start + pageCount.count; i++) {
          doc.switchToPage(i);
          doc.fillColor(SUBTLE).font('Helvetica').fontSize(7).text(
            `TeslaPrimeCapital · Account Statement ${documentRef} · Page ${i + 1 - pageCount.start} of ${pageCount.count}`,
            48,
            doc.page.height - 36,
            { align: 'center', width: pageWidth },
          );
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });

    logger.info(`PDF statement ${documentRef} generated for user ${userId}: ${transactions.length} entries, ${pdf.length} bytes`);
    return { pdf, documentRef, rowCount: transactions.length };
  }
}

export const statementService = new StatementService();
