/**
 * TeslaPrimeCapital — User & Session Database Repository (`user.repository.ts`)
 * Encapsulates all Prisma database query operations for user identities and sessions.
 */

import { prisma } from '@/lib/prisma';
import { User, Session, Prisma, UserRole, AccountStatus, KycTier } from '@prisma/client';

export class UserRepository {
  public async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  public async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  public async findByReferralCode(referralCode: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { referralCode },
    });
  }

  public async create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    referralCode: string;
    referredById?: string;
    role?: UserRole;
    status?: AccountStatus;
  }): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        referralCode: data.referralCode,
        referredById: data.referredById,
        role: data.role ?? UserRole.INVESTOR,
        status: data.status ?? AccountStatus.PENDING_VERIFICATION,
        kycTier: KycTier.TIER_0, // Enforcing Tier 0 Starter $1k without KYC per approved policy
      },
    });
  }

  public async updateStatus(userId: string, status: AccountStatus): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  public async updateTotpSecret(userId: string, encryptedSecret: string | null, enabled: boolean, backupCodes?: any): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: encryptedSecret,
        twoFactorEnabled: enabled,
        backupCodes: backupCodes ?? undefined,
      },
    });
  }

  // Session Management
  public async createSession(data: {
    userId: string;
    refreshTokenHash: string;
    deviceFingerprint?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }): Promise<Session> {
    return await prisma.session.create({
      data,
    });
  }

  public async findSessionByRefreshTokenHash(refreshTokenHash: string): Promise<(Session & { user: User }) | null> {
    return await prisma.session.findUnique({
      where: { refreshTokenHash },
      include: { user: true },
    });
  }

  public async deleteSession(sessionId: string): Promise<void> {
    await prisma.session.delete({
      where: { id: sessionId },
    }).catch(() => {
      // Ignore if session already expired or removed
    });
  }

  public async deleteUserSessions(userId: string): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: { userId },
    });
    return result.count;
  }
}

export const userRepository = new UserRepository();
