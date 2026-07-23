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
 *
 * Escape hatch: REDIS_TLS_ALLOW_UNVERIFIED=true relaxes CA verification
 * (channel stays encrypted, server identity is not verified). Intended ONLY
 * as a temporary unblock when a provider console will not yield its CA —
 * every boot logs a loud warning until REDIS_CA_CERT replaces it.
 */
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';
const providerCaChain = process.env.REDIS_CA_CERT
  ? Buffer.from(process.env.REDIS_CA_CERT, 'base64').toString('utf8')
  : undefined;
const allowUnverifiedTls = process.env.REDIS_TLS_ALLOW_UNVERIFIED === 'true';

let tlsConfig = {};
if (redisUrl.startsWith('rediss://')) {
  if (providerCaChain) {
    tlsConfig = { tls: { ca: providerCaChain } };
  } else if (allowUnverifiedTls) {
    tlsConfig = { tls: { rejectUnauthorized: false } };
  }
}

if (redisUrl.startsWith('rediss://') && !providerCaChain && allowUnverifiedTls) {
  logger.warn(
    'REDIS_TLS_ALLOW_UNVERIFIED is active: the Redis channel is encrypted but the server certificate is NOT verified. Supply REDIS_CA_CERT to restore full TLS verification.',
  );
}

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
