/**
 * TeslaPrimeCapital — Reporting HTTP Controller (`reporting.controller.ts`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { reportingService } from '../services/reporting.service';
import { statementService } from '../services/statement.service';
import { extractAuthenticatedUser } from '../middlewares/authenticate.middleware';
import { logger } from '@/utils/logger.util';
import { IApiResponse } from '@/contracts/api.envelope';
import { sanitizeErrorMessage } from '@/utils/error-sanitizer.util';

export class ReportingController {
  private static makeEnvelope<T>(success: boolean, data?: T, error?: any, status = 200): NextResponse<IApiResponse<T>> {
    return NextResponse.json({
      success,
      ...(data !== undefined && { data }),
      ...(error !== undefined && { error }),
      meta: { timestamp: new Date().toISOString(), requestId: `req_${Math.random().toString(36).substring(2, 11)}` },
    }, { status });
  }

  public async getAnalytics(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return ReportingController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Auth required.' }, 401);

    try {
      const result = await reportingService.getUserAnalytics(user.id);
      return ReportingController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      return ReportingController.makeEnvelope(false, undefined, { code: 'ERR_GET_ANALYTICS_FAILED', message: sanitizeErrorMessage(err) }, 500);
    }
  }

  public async exportCsv(req: NextRequest): Promise<Response> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return new Response('Unauthorized', { status: 401 });

    try {
      const csv = await reportingService.generateUserTaxStatementCsv(user.id);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="teslaprime_tax_statement_${user.id.slice(0, 8)}_${new Date().toISOString().slice(0, 10)}.csv"`,
          'Cache-Control': 'no-cache, no-store',
        },
      });
    } catch (err: any) {
      logger.error(`CSV export failure: ${err.message}`);
      return new Response('Error generating CSV statement', { status: 500 });
    }
  }

  /**
   * GET /api/v1/reporting/export/statement.pdf?from=YYYY-MM-DD&to=YYYY-MM-DD
   * Streams a signed PDF account statement built from the live double-entry ledger.
   */
  public async exportStatementPdf(req: NextRequest): Promise<Response> {
    const user = await extractAuthenticatedUser(req);
    if (!user) return new Response('Unauthorized', { status: 401 });

    try {
      const url = new URL(req.url);
      // Reject obviously malformed window params with a 400 instead of silent coercion.
      for (const key of ['from', 'to']) {
        const raw = url.searchParams.get(key);
        if (raw !== null && Number.isNaN(new Date(raw).getTime())) {
          return new Response(`Invalid [${key}] window parameter — use ISO dates (YYYY-MM-DD).`, { status: 400 });
        }
      }

      const { pdf, documentRef } = await statementService.generateAccountStatement(
        user.id,
        url.searchParams.get('from') ?? undefined,
        url.searchParams.get('to') ?? undefined
      );

      return new Response(new Uint8Array(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="teslaprime_statement_${documentRef}.pdf"`,
          'Cache-Control': 'no-cache, no-store',
        },
      });
    } catch (err: any) {
      logger.error(`PDF statement export failure: ${err.message}`);
      return new Response('Error generating PDF statement', { status: 500 });
    }
  }
}

export const reportingController = new ReportingController();
