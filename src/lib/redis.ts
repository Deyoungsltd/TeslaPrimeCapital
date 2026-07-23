/**
 * TeslaPrimeCapital — Singleton Redis Client & Distributed Mutex Manager (`Redlock`)
 */

import Redis from 'ioredis';
import Redlock from 'redlock';
import { logger } from '@/utils/logger.util';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  redlock: Redlock | undefined;
};

/**
 * Connection contract — works against ANY Redis-protocol provider:
 *   - Upstash (TLS via public CA):          rediss:// URL, zero extra config
 *   - Redis Cloud free plan (no TLS):        redis://default:pass@host:port
 *   - Providers with a PRIVATE CA (Aiven etc.): rediss:// + REDIS_CA_CERT
 *     holding the base64-encoded PEM chain from that provider's console —
 *     the client validates against it instead of failing verification, so
 *     TLS stays enforced rather than being disabled.
 */
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';
const providerCaChain = process.env.REDIS_CA_CERT
  ? Buffer.from(process.env.REDIS_CA_CERT, 'base64').toString('utf8')
  : undefined;
const tlsConfig =
  redisUrl.startsWith('rediss://') && providerCaChain ? { tls: { ca: providerCaChain } } : {};

// Initialize singleton ioredis client
export const redis =
  globalForRedis.redis ??
  new Redis(redisUrl, {
    ...tlsConfig,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 2000);
      return delay;
    },
    lazyConnect: true,
  });

// Initialize singleton Redlock distributed lock manager
export const redlock =
  globalForRedis.redlock ??
  new Redlock([redis], {
    driftFactor: 0.01,
    retryCount: 3,
    retryDelay: 200,
    retryJitter: 200,
    automaticExtensionThreshold: 500,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
  globalForRedis.redlock = redlock;
}

redis.on('error', (err) => {
  if (process.env.NODE_ENV === 'production') {
    logger.error('Redis Cluster Connection Error Intercepted:', { message: err.message });
  }
});

redis.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Redis connection established cleanly.');
  }
});

/**
 * Architectural Mutex Helper (`withWalletLock`)
 * Acquires a distributed lock using Redlock before executing sensitive balance mutations.
 */
export async function withWalletLock<T>(userId: string, action: () => Promise<T>, ttlMs = 10000): Promise<T> {
  const lockKey = `lock:wallet:usr_${userId}`;
  try {
    const lock = await redlock.acquire([lockKey], ttlMs);
    try {
      return await action();
    } finally {
      await lock.release().catch((e: any) => logger.warn(`Failed to release wallet lock for ${userId}: ${e.message}`));
    }
  } catch (error: any) {
    logger.warn(`Mutex concurrency lock contention on ${lockKey}. Rejecting concurrent transaction attempt.`);
    throw new Error('CONCURRENCY_LOCK_BUSY: Another financial operation is currently modifying this wallet balance. Please retry in a few seconds.');
  }
}
