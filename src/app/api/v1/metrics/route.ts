/**
 * TeslaPrimeCapital — Performance Benchmarking Endpoint (`GET /api/v1/metrics`)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractAuthenticatedUser } from '@/server/middlewares/authenticate.middleware';
import { checkPermission } from '@/server/middlewares/authorize.middleware';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await extractAuthenticatedUser(req);
  if (!user || !checkPermission(user, 'audit_logs:read')) {
    return NextResponse.json({ success: false, error: { code: 'ERR_FORBIDDEN', message: 'Admin permissions required.' } }, { status: 403 });
  }

  const startDb = Date.now();
  await prisma.user.findFirst({ select: { id: true } });
  const dbLatencyMs = Date.now() - startDb;

  const memoryUsage = process.memoryUsage();

  return NextResponse.json({
    success: true,
    data: {
      singleEntityQueryExecutionMs: dbLatencyMs,
      targetCeilingMs: 10,
      benchmarkPassed: dbLatencyMs <= 10,
      memoryUsage: {
        rssMb: (memoryUsage.rss / 1024 / 1024).toFixed(2),
        heapTotalMb: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
        heapUsedMb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      },
      uptimeSeconds: process.uptime().toFixed(0),
    },
    meta: { timestamp: new Date().toISOString(), requestId: 'req_metrics' },
  });
}
