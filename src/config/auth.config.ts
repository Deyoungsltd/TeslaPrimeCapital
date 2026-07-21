/**
 * TeslaPrimeCapital — Authentication Security Configuration
 * Governs token rotation TTLs, Argon2id parameters, OTP constraints, and rate limits.
 */

export const AUTH_CONFIG = {
  jwt: {
    accessTokenTtlSec: 900,         // 15 minutes (stateless high-speed read authorization)
    refreshTokenTtlSec: 604800,     // 7 days (stateful rotating refresh session stored in Redis)
    cookieName: 'teslaprime_refresh_token',
  },
  argon2: {
    memoryCost: 65536,              // 64 MB memory hardness against custom ASIC/GPU attacks
    timeCost: 3,                    // 3 iterations
    parallelism: 4,                 // 4 parallel threads
  },
  otp: {
    length: 6,                      // 6-digit cryptographic verification code
    ttlSec: 600,                    // 10 minute expiration
    maxAttempts: 3,                 // Maximum failed guesses before immediate token invalidation
  },
  mfa: {
    issuerName: 'TeslaPrimeCapital',
    backupCodesCount: 10,
  },
  rateLimits: {
    login: { maxRequests: 5, windowSec: 900 },         // 5 attempts per 15 minutes
    register: { maxRequests: 3, windowSec: 3600 },     // 3 attempts per hour
    verifyOtp: { maxRequests: 3, windowSec: 600 },     // 3 verification attempts per 10 minutes
    walletMutations: { maxRequests: 20, windowSec: 60 } // 20 financial operations per minute
  }
} as const;
