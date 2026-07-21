/**
 * TeslaPrimeCapital — Authentication Verification Middleware (`authenticate.middleware.ts`)
 * Verifies Bearer JWT access token headers or parses active session states from NextRequest.
 */

import { NextRequest } from 'next/server';
import { CryptoUtil } from '@/utils/crypto.util';
import { UserRole, KycTier, AccountStatus } from '@prisma/client';
import { logger } from '@/utils/logger.util';

export interface IAuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  kycTier: KycTier;
  status: AccountStatus;
  sessionId?: string;
}

export async function extractAuthenticatedUser(req: NextRequest): Promise<IAuthenticatedUser | null> {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const secret = process.env.JWT_ACCESS_SECRET || 'fallback_dev_access_secret_64_chars_length_1234567890';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  if (!token) return null;

  const payload = CryptoUtil.verifyJwt(token, secret);
  if (!payload || !payload.sub) {
    logger.debug('JWT access token verification failed or token expired.');
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role as UserRole,
    kycTier: payload.kycTier as KycTier,
    status: payload.status as AccountStatus,
    sessionId: payload.sessionId,
  };
}
