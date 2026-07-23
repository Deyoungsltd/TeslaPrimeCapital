import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { investmentService } from '@/server/services/investment.service';
import { logger } from '@/utils/logger.util';
import { sanitizeErrorMessage } from '@/utils/error-sanitizer.util';

/**
 * Scheduled Daily Accrual Endpoint — POST|GET /api/v1/cron/daily-accrual
 *
 * Serverless-compatible driver for the 00:00 UTC compounding & lump-sum
 * maturity cycle. Invokes the exact same `processDailyAccrualsAndMaturities()`
 * settlement service entrypoint the admin manual trigger uses — one code path,
 * no duplicated business logic.
 *
 * Authorization model: positively-secret bearer token (`CRON_SECRET`). The
 * endpoint refuses to bootstrap when CRON_SECRET is unset, and compares with
 * crypto.timingSafeEqual so the secret cannot be probed byte-by-byte via
 * response timing.
 *
 * Wiring options (all speak the same contract):
 *   - Vercel Cron: `vercel.json` registers this path at `0 0 * * *`; Vercel
 *     automatically attaches `Authorization: Bearer $CRON_SECRET` when the
 *     CRON_SECRET environment variable is configured on the project.
 *   - Host-agnostic fallback: any free scheduler (cron-job.org, EasyCron,
 *     GitHub Actions cron) issues an HTTP request with the same header.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Vercel Hobby permits up to 60s; the settlement cycle is a single deterministic sweep. */
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected || expected.length < 16) {
    return false;
  }
  const header = req.headers.get('authorization') ?? '';
  const provided = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
  if (provided.length === 0 || provided.length !== expected.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(provided, 'utf8'), Buffer.from(expected, 'utf8'));
}

async function handleCronInvocation(req: NextRequest): Promise<NextResponse> {
  if (!process.env.CRON_SECRET || process.env.CRON_SECRET.length < 16) {
    return NextResponse.json(
      { success: false, error: { code: 'ERR_CRON_NOT_CONFIGURED', message: 'CRON_SECRET is not configured on this deployment.' } },
      { status: 503 },
    );
  }
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, error: { code: 'ERR_UNAUTHORIZED', message: 'Invalid cron credentials.' } },
      { status: 401 },
    );
  }

  try {
    const stats = await investmentService.processDailyAccrualsAndMaturities();
    logger.info('Scheduled daily accrual cycle executed cleanly via cron endpoint.', stats as object);
    return NextResponse.json({ success: true, data: { triggeredAt: new Date().toISOString(), ...stats } }, { status: 200 });
  } catch (err: any) {
    logger.error(`Scheduled daily accrual cycle failed: ${err.message}`, { stack: err.stack });
    return NextResponse.json(
      { success: false, error: { code: 'ERR_ACCRUAL_CYCLE_FAILED', message: sanitizeErrorMessage(err) } },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return handleCronInvocation(req);
}

export async function POST(req: NextRequest) {
  return handleCronInvocation(req);
}
