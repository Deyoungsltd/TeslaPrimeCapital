/**
 * TeslaPrimeCapital — Authentication Domain Service (`auth.service.ts`)
 * Enforces Argon2id hashing, cryptographic OTP, and our Hybrid Rotating Token architecture.
 */

import { userRepository } from '../repositories/user.repository';
import { emailService } from './email.service';
import { CryptoUtil } from '@/utils/crypto.util';
import { redis } from '@/lib/redis';
import { logger } from '@/utils/logger.util';
import { AUTH_CONFIG } from '@/config/auth.config';
import { AccountStatus, UserRole, User } from '@prisma/client';
import {
  RegisterRequestInput,
  LoginRequestInput,
  OtpVerificationRequestInput,
  TotpEnableRequestInput,
} from '../validators/auth.validator';
import { authenticator } from 'otplib';

// Configure otplib authenticator
authenticator.options = { window: 1 };

export class AuthService {
  private readonly JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_dev_access_secret_64_chars_length_1234567890';
  private readonly MASTER_KEY = process.env.SESSION_MASTER_KEY || '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';

  /**
   * Registers a new user account, hashes credentials via Argon2id, generates OTP, and dispatches email.
   */
  public async register(input: RegisterRequestInput, ipAddress?: string): Promise<{ userId: string; email: string; status: AccountStatus }> {
    logger.info(`Attempting account registration for ${input.email}`);

    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      logger.warn(`Registration rejected: email ${input.email} is already registered.`);
      throw new Error('ERR_ACCOUNT_EXISTS: An account with this email address already exists in the system.');
    }

    let referredById: string | undefined = undefined;
    if (input.referralCode) {
      const referrer = await userRepository.findByReferralCode(input.referralCode);
      if (referrer) {
        referredById = referrer.id;
        logger.info(`Valid referral code bound: ${input.referralCode} (${referrer.id})`);
      } else {
        logger.warn(`Invalid referral code provided during registration: ${input.referralCode}`);
      }
    }

    const passwordHash = await CryptoUtil.hashPassword(input.password);
    const uniqueReferralCode = `REF_${CryptoUtil.generateSixDigitOtp()}_${input.firstName.toUpperCase().slice(0, 3)}`;

    const newUser = await userRepository.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      referralCode: uniqueReferralCode,
      referredById,
    });

    // Generate cryptographic 6-digit OTP code and store SHA-256 hash inside Redis
    const otpCode = CryptoUtil.generateSixDigitOtp();
    const otphash = CryptoUtil.hashOtp(otpCode, newUser.id);
    try {
      await redis.setex(`otp:user:${newUser.id}`, AUTH_CONFIG.otp.ttlSec, otphash);
    } catch (err: any) {
      logger.warn(`Redis unavailable during register OTP storage: ${err.message}`);
    }

    // Dispatch verification email
    await emailService.sendOtpEmail(newUser.email, newUser.firstName, otpCode, ipAddress);

    logger.info(`Successfully created user account ${newUser.id} (${newUser.email}). OTP dispatched.`);
    return {
      userId: newUser.id,
      email: newUser.email,
      status: newUser.status,
    };
  }

  /**
   * Verifies an email OTP code and elevates account status to ACTIVE (`TIER_0 Starter`).
   */
  public async verifyOtp(input: OtpVerificationRequestInput, ipAddress?: string, userAgent?: string): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('ERR_USER_NOT_FOUND: No account corresponds to the provided email address.');
    }

    let redisOtpHash: string | null = null;
    try {
      redisOtpHash = await redis.get(`otp:user:${user.id}`);
    } catch (err: any) {
      logger.warn(`Redis unavailable during OTP verify: ${err.message}`);
    }

    const computedHash = CryptoUtil.hashOtp(input.otpCode, user.id);
    // Allow '123456' as fallback dev OTP if Redis is unreachable or for local dev verification
    const isDevFallback = process.env.NODE_ENV !== 'production' && input.otpCode === '123456';
    if (!redisOtpHash && !isDevFallback) {
      throw new Error('ERR_OTP_EXPIRED: The One-Time Password verification code has expired. Please request a new code.');
    }

    if (redisOtpHash && redisOtpHash !== computedHash && !isDevFallback) {
      // Increment failed OTP counter
      let failedAttempts = 1;
      try {
        failedAttempts = await redis.incr(`rate:otp:${user.id}`);
        if (failedAttempts >= AUTH_CONFIG.otp.maxAttempts) {
          await redis.del(`otp:user:${user.id}`);
          logger.warn(`User ${user.id} exceeded maximum OTP guesses (${failedAttempts}). Code invalidated.`);
          throw new Error('ERR_OTP_INVALID_LOCKED: Maximum failed verification guesses exceeded. The OTP has been invalidated for security.');
        }
      } catch {}
      throw new Error(`ERR_OTP_MISMATCH: Invalid verification code. You have ${AUTH_CONFIG.otp.maxAttempts - failedAttempts} attempts remaining.`);
    }

    // OTP verified! Clean up Redis OTP key and activate user
    try {
      await redis.del(`otp:user:${user.id}`);
      await redis.del(`rate:otp:${user.id}`);
    } catch {}

    const activeUser = await userRepository.updateStatus(user.id, AccountStatus.ACTIVE);
    logger.info(`User ${activeUser.id} (${activeUser.email}) OTP verified cleanly. Account status elevated to ACTIVE (TIER_0).`);

    // Issue Hybrid Rotating Tokens (15m JWT + 7d rotating refresh token)
    const tokens = await this.issueTokens(activeUser, ipAddress, userAgent);
    return {
      user: activeUser,
      ...tokens,
    };
  }

  /**
   * Authenticates user credentials via Argon2id and handles Two-Factor (TOTP) challenges.
   */
  public async login(input: LoginRequestInput, ipAddress?: string, userAgent?: string): Promise<{
    user: User;
    accessToken?: string;
    refreshToken?: string;
    requiresTotp?: boolean;
  }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      logger.warn(`Failed login attempt for non-existent email: ${input.email}`);
      throw new Error('ERR_INVALID_CREDENTIALS: Incorrect email address or password.');
    }

    if (user.status === AccountStatus.LOCKED || user.status === AccountStatus.SUSPENDED) {
      logger.warn(`Login blocked for account ${user.id} (${user.email}) due to status: ${user.status}`);
      throw new Error(`ERR_ACCOUNT_LOCKED: Your account is currently ${user.status}. Please contact compliance support.`);
    }

    const passwordValid = await CryptoUtil.verifyPassword(user.passwordHash, input.password);
    if (!passwordValid) {
      logger.warn(`Incorrect password verification attempt for user ${user.id} (${user.email})`);
      throw new Error('ERR_INVALID_CREDENTIALS: Incorrect email address or password.');
    }

    // If Two-Factor Authentication (TOTP) is enabled, require code verification
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!input.totpCode) {
        return {
          user,
          requiresTotp: true,
        };
      }

      const decryptedSecret = CryptoUtil.decryptSecret(user.twoFactorSecret, this.MASTER_KEY);
      const totpValid = authenticator.verify({ token: input.totpCode, secret: decryptedSecret });
      if (!totpValid) {
        logger.warn(`Invalid TOTP authenticator code provided during login for user ${user.id}`);
        throw new Error('ERR_INVALID_TOTP: The authenticator verification code is incorrect or expired.');
      }
    }

    // Check if account still PENDING_VERIFICATION
    if (user.status === AccountStatus.PENDING_VERIFICATION) {
      // Re-issue verification OTP automatically
      const otpCode = CryptoUtil.generateSixDigitOtp();
      const otphash = CryptoUtil.hashOtp(otpCode, user.id);
      try {
        await redis.setex(`otp:user:${user.id}`, AUTH_CONFIG.otp.ttlSec, otphash);
      } catch (err: any) {
        logger.warn(`Redis unavailable during re-issue OTP: ${err.message}`);
      }
      await emailService.sendOtpEmail(user.email, user.firstName, otpCode, ipAddress);
      throw new Error('ERR_ACCOUNT_PENDING_VERIFICATION: Your account email is not yet verified. A fresh verification code has just been sent to your email.');
    }

    logger.info(`User ${user.id} (${user.email}) authenticated successfully via Argon2id.`);
    const tokens = await this.issueTokens(user, ipAddress, userAgent);
    return {
      user,
      ...tokens,
      requiresTotp: false,
    };
  }

  /**
   * Issues Hybrid Rotating Tokens: 15m stateless access token + 7d rotating refresh token stored in Redis & database.
   */
  public async issueTokens(user: User, ipAddress?: string, userAgent?: string): Promise<{ accessToken: string; refreshToken: string }> {
    const rawRefreshToken = CryptoUtil.generateSecureToken();
    const refreshTokenHash = CryptoUtil.hashRefreshToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + AUTH_CONFIG.jwt.refreshTokenTtlSec * 1000);

    // Persist session metadata into PostgreSQL
    const dbSession = await userRepository.createSession({
      userId: user.id,
      refreshTokenHash,
      ipAddress,
      userAgent,
      expiresAt,
    });

    // Store stateful session lookup inside Redis for ultra-fast validation during token rotation
    try {
      const redisSessionPayload = JSON.stringify({
        sessionId: dbSession.id,
        userId: user.id,
        role: user.role,
        kycTier: user.kycTier,
        ipAddress,
      });
      await redis.setex(`session:${dbSession.id}`, AUTH_CONFIG.jwt.refreshTokenTtlSec, redisSessionPayload);
      await redis.setex(`token_lookup:${refreshTokenHash}`, AUTH_CONFIG.jwt.refreshTokenTtlSec, dbSession.id);
    } catch (err: any) {
      logger.warn(`Redis unavailable during issueTokens, session saved directly to PostgreSQL: ${err.message}`);
    }

    // Sign 15-minute stateless JWT access token (`HS256`)
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      kycTier: user.kycTier,
      status: user.status,
      sessionId: dbSession.id,
    };
    const accessToken = CryptoUtil.signJwt(jwtPayload, this.JWT_ACCESS_SECRET, AUTH_CONFIG.jwt.accessTokenTtlSec);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  /**
   * Rotates a refresh token: invalidates old refresh token and issues a fresh pair of tokens.
   */
  public async refreshAccessToken(rawRefreshToken: string, ipAddress?: string, userAgent?: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const refreshTokenHash = CryptoUtil.hashRefreshToken(rawRefreshToken);
    let sessionId: string | null = null;
    try {
      sessionId = await redis.get(`token_lookup:${refreshTokenHash}`);
    } catch (err: any) {
      logger.warn(`Redis unavailable during token_lookup, querying PostgreSQL: ${err.message}`);
    }

    let sessionRecord = null;
    if (sessionId) {
      sessionRecord = await userRepository.findSessionByRefreshTokenHash(refreshTokenHash);
    } else {
      sessionRecord = await userRepository.findSessionByRefreshTokenHash(refreshTokenHash);
    }

    if (!sessionRecord || sessionRecord.expiresAt < new Date()) {
      if (sessionRecord) {
        await userRepository.deleteSession(sessionRecord.id).catch(() => {});
        try {
          await redis.del(`session:${sessionRecord.id}`);
          await redis.del(`token_lookup:${refreshTokenHash}`);
        } catch {}
      }
      throw new Error('ERR_SESSION_EXPIRED: Your session refresh token is invalid or expired. Please log in again.');
    }

    // Check account status
    if (sessionRecord.user.status !== AccountStatus.ACTIVE) {
      throw new Error(`ERR_ACCOUNT_INACTIVE: Your account status is ${sessionRecord.user.status}. Token rotation denied.`);
    }

    // Invalidate/Delete the old refresh token immediately (Silent Rotation Guarantee)
    await userRepository.deleteSession(sessionRecord.id).catch(() => {});
    try {
      await redis.del(`session:${sessionRecord.id}`);
      await redis.del(`token_lookup:${refreshTokenHash}`);
    } catch {}

    // Issue brand new rotating token pair
    const tokens = await this.issueTokens(sessionRecord.user, ipAddress, userAgent);
    logger.info(`Session token rotated cleanly for user ${sessionRecord.user.id} (${sessionRecord.user.email}).`);

    return {
      ...tokens,
      user: sessionRecord.user,
    };
  }

  /**
   * Logs out user from current device by invalidating active refresh session.
   */
  public async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) return;
    const refreshTokenHash = CryptoUtil.hashRefreshToken(rawRefreshToken);
    try {
      const sessionId = await redis.get(`token_lookup:${refreshTokenHash}`);
      if (sessionId) {
        await redis.del(`session:${sessionId}`);
        await userRepository.deleteSession(sessionId).catch(() => {});
      }
      await redis.del(`token_lookup:${refreshTokenHash}`);
    } catch (err: any) {
      logger.warn(`Redis error during logout: ${err.message}`);
    }
    logger.info('User session revoked and deleted cleanly during logout.');
  }

  /**
   * Logs out user across ALL devices permanently (`Log out of all devices`).
   */
  public async logoutAllDevices(userId: string): Promise<number> {
    const count = await userRepository.deleteUserSessions(userId);
    // Flush user permission caches
    await redis.del(`cache:user:perms:${userId}`);
    logger.info(`Global logout executed for user ${userId}. Terminated ${count} active sessions across all devices.`);
    return count;
  }

  /**
   * Generates a new TOTP MFA secret seed and QR code URI for authenticator setup.
   */
  public async generateTotpSecret(user: User): Promise<{ secret: string; otpauthUrl: string }> {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, AUTH_CONFIG.mfa.issuerName, secret);
    return { secret, otpauthUrl };
  }

  /**
   * Confirms authenticator setup code and enables Two-Factor Authentication (`twoFactorEnabled = true`).
   */
  public async enableTotp(userId: string, input: TotpEnableRequestInput): Promise<{ backupCodes: string[] }> {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('ERR_USER_NOT_FOUND: User identity not found.');

    const isValid = authenticator.verify({ token: input.totpCode, secret: input.secret });
    if (!isValid) {
      throw new Error('ERR_TOTP_VERIFICATION_FAILED: The 6-digit code entered does not match the authenticator seed. Please try again.');
    }

    // Encrypt TOTP seed via AES-256-GCM before database storage
    const encryptedSecret = CryptoUtil.encryptSecret(input.secret, this.MASTER_KEY);

    // Generate 10 emergency backup recovery codes
    const backupCodesPlain: string[] = [];
    const backupCodesHashed: string[] = [];
    for (let i = 0; i < AUTH_CONFIG.mfa.backupCodesCount; i++) {
      const code = `${CryptoUtil.generateSixDigitOtp()}-${CryptoUtil.generateSixDigitOtp()}`;
      backupCodesPlain.push(code);
      const hashed = await CryptoUtil.hashPassword(code);
      backupCodesHashed.push(hashed);
    }

    await userRepository.updateTotpSecret(user.id, encryptedSecret, true, backupCodesHashed);
    logger.info(`MFA/TOTP authenticator successfully enabled and locked for user ${user.id} (${user.email}).`);

    return { backupCodes: backupCodesPlain };
  }
}

export const authService = new AuthService();
