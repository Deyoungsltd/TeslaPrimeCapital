/**
 * TeslaPrimeCapital — Redis Leaky-Bucket Rate Limiting Middleware (`rate-limit.middleware.ts`)
 * Enforces sliding window request ceilings per IP address or User ID to prevent brute-force attacks.
 */

import { redis } from '@/lib/redis';
import { logger } from '@/utils/logger.util';
import { NextRequest, NextResponse } from 'next/server';

export async function checkRateLimit(req: NextRequest, scope: string, maxRequests: number, windowSec: number, identifier?: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetSec: number;
}> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';
  const key = `rate:${scope}:${identifier || ip}`;

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSec);
    }
    const ttl = await redis.ttl(key);
    const remaining = Math.max(0, maxRequests - current);

    if (current > maxRequests) {
      logger.warn(`Rate limit ceiling (${maxRequests}/${windowSec}s) breached on scope [${scope}] by identifier [${identifier || ip}].`);
      return { allowed: false, remaining: 0, resetSec: ttl > 0 ? ttl : windowSec };
    }

    return { allowed: true, remaining, resetSec: ttl > 0 ? ttl : windowSec };
  } catch (err: any) {
    // If Redis encounters a temporary failure, fail open to prevent blocking legitimate user requests while logging
    logger.error(`Redis rate-limit evaluation failure on key [${key}]: ${err.message}`);
    return { allowed: true, remaining: maxRequests, resetSec: windowSec };
  }
}
