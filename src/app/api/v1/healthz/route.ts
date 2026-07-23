/**
 * TeslaPrimeCapital — Production Health Check & Liveness Endpoint (`GET /api/v1/healthz`)
 * Monitored by Coolify and Docker Engine every 10 seconds (`HEALTHCHECK --interval=10s`).
 * Verifies PostgreSQL 16 connection pool (`PgBouncer port 6432`) and Redis 7 cluster status (< 10ms execution).
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { logger } from '@/utils/logger.util';

export async function GET(): Promise<NextResponse> {
  const startTime = Date.now();
  let dbStatus = false;
  let redisStatus = false;

  try {
    // 1. Verify PostgreSQL connection (`PgBouncer port 6432`)
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = true;

    // 2. Verify Redis cluster connection
    const pong = await redis.ping();
    if (pong === 'PONG') {
      redisStatus = true;
    }
  } catch (err: any) {
    // Component booleans are the public contract; raw internals stay in logs.
    logger.error(`Production health check failure intercepted: ${err.message}`);
  }

  const durationMs = Date.now() - startTime;
  const isHealthy = dbStatus && redisStatus;

  return NextResponse.json(
    {
      status: isHealthy ? 'ok' : 'degraded',
      db: dbStatus,
      redis: redisStatus,
      durationMs,
      meta: {
        timestamp: new Date().toISOString(),
        version: '0.3.9-alpha',
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
