/**
 * TeslaPrimeCapital — Authentication HTTP Controller (`auth.controller.ts`)
 * Intercepts NextRequest HTTP parameters, invokes AuthService, sets secure rotating refresh cookies,
 * and wraps responses inside our standardized IApiResponse<T> envelope.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../services/auth.service';
import { checkRateLimit } from '../middlewares/rate-limit.middleware';
import { validateInput } from '../middlewares/validate.middleware';
import { extractAuthenticatedUser } from '../middlewares/authenticate.middleware';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  OtpVerificationRequestSchema,
  TotpEnableRequestSchema,
} from '../validators/auth.validator';
import { AUTH_CONFIG } from '@/config/auth.config';
import { logger } from '@/utils/logger.util';
import { IApiResponse } from '@/contracts/api.envelope';

export class AuthController {
  private static makeEnvelope<T>(success: boolean, data?: T, error?: any, status = 200, headers?: HeadersInit): NextResponse<IApiResponse<T>> {
    const responseBody: IApiResponse<T> = {
      success,
      ...(data !== undefined && { data }),
      ...(error !== undefined && { error }),
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req_${Math.random().toString(36).substring(2, 11)}`,
      },
    };
    return NextResponse.json(responseBody, { status, headers });
  }

  /**
   * POST /api/v1/auth/register
   */
  public async register(req: NextRequest): Promise<NextResponse> {
    const rateCheck = await checkRateLimit(req, 'register', AUTH_CONFIG.rateLimits.register.maxRequests, AUTH_CONFIG.rateLimits.register.windowSec);
    if (!rateCheck.allowed) {
      return AuthController.makeEnvelope(false, undefined, {
        code: 'ERR_RATE_LIMIT_EXCEEDED',
        message: 'Too many account registration attempts. Please wait before retrying.',
      }, 429);
    }

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(RegisterRequestSchema, body);
      if (!validation.success || !validation.data) {
        return AuthController.makeEnvelope(false, undefined, validation.error, 400);
      }

      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';
      const result = await authService.register(validation.data, ip);

      return AuthController.makeEnvelope(true, result, undefined, 201);
    } catch (err: any) {
      logger.error(`Registration controller error: ${err.message}`);
      const isAccountExists = err.message.includes('ERR_ACCOUNT_EXISTS');
      return AuthController.makeEnvelope(false, undefined, {
        code: isAccountExists ? 'ERR_ACCOUNT_EXISTS' : 'ERR_REGISTRATION_FAILED',
        message: err.message || 'An error occurred while creating your account.',
      }, isAccountExists ? 409 : 500);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  public async login(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json().catch(() => ({}));
      const rateCheck = await checkRateLimit(req, 'login', AUTH_CONFIG.rateLimits.login.maxRequests, AUTH_CONFIG.rateLimits.login.windowSec, body?.email || undefined);
      if (!rateCheck.allowed) {
        return AuthController.makeEnvelope(false, undefined, {
          code: 'ERR_RATE_LIMIT_EXCEEDED',
          message: 'Account temporarily locked due to repeated failed login attempts. Please try again later.',
        }, 429);
      }

      const validation = validateInput(LoginRequestSchema, body);
      if (!validation.success || !validation.data) {
        return AuthController.makeEnvelope(false, undefined, validation.error, 400);
      }

      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'Unknown Terminal';
      const result = await authService.login(validation.data, ip, userAgent);

      if (result.requiresTotp) {
        return AuthController.makeEnvelope(true, {
          requiresTotp: true,
          email: result.user.email,
          message: 'Please provide the 6-digit verification code from your authenticator application.',
        }, undefined, 200);
      }

      // Issue cookie header for stateful rotating refresh token
      const headers = new Headers();
      if (result.refreshToken) {
        headers.set(
          'Set-Cookie',
          `${AUTH_CONFIG.jwt.cookieName}=${result.refreshToken}; Path=/; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Max-Age=${AUTH_CONFIG.jwt.refreshTokenTtlSec}`
        );
      }

      return AuthController.makeEnvelope(true, {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          status: result.user.status,
          kycTier: result.user.kycTier,
          twoFactorEnabled: result.user.twoFactorEnabled,
          referralCode: result.user.referralCode,
        },
        accessToken: result.accessToken,
        expiresInSec: AUTH_CONFIG.jwt.accessTokenTtlSec,
      }, undefined, 200, headers);
    } catch (err: any) {
      logger.error(`Login controller error: ${err.message}`);
      const isInvalidCreds = err.message.includes('ERR_INVALID_CREDENTIALS') || err.message.includes('ERR_INVALID_TOTP');
      return AuthController.makeEnvelope(false, undefined, {
        code: isInvalidCreds ? 'ERR_INVALID_CREDENTIALS' : 'ERR_LOGIN_FAILED',
        message: err.message || 'Authentication failed.',
      }, isInvalidCreds ? 401 : 403);
    }
  }

  /**
   * POST /api/v1/auth/verify-otp
   */
  public async verifyOtp(req: NextRequest): Promise<NextResponse> {
    const rateCheck = await checkRateLimit(req, 'verifyOtp', AUTH_CONFIG.rateLimits.verifyOtp.maxRequests, AUTH_CONFIG.rateLimits.verifyOtp.windowSec);
    if (!rateCheck.allowed) {
      return AuthController.makeEnvelope(false, undefined, {
        code: 'ERR_RATE_LIMIT_EXCEEDED',
        message: 'Too many verification attempts. Please request a new code.',
      }, 429);
    }

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(OtpVerificationRequestSchema, body);
      if (!validation.success || !validation.data) {
        return AuthController.makeEnvelope(false, undefined, validation.error, 400);
      }

      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'Unknown Terminal';
      const result = await authService.verifyOtp(validation.data, ip, userAgent);

      const headers = new Headers();
      headers.set(
        'Set-Cookie',
        `${AUTH_CONFIG.jwt.cookieName}=${result.refreshToken}; Path=/; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Max-Age=${AUTH_CONFIG.jwt.refreshTokenTtlSec}`
      );

      return AuthController.makeEnvelope(true, {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          status: result.user.status,
          kycTier: result.user.kycTier,
          twoFactorEnabled: result.user.twoFactorEnabled,
          referralCode: result.user.referralCode,
        },
        accessToken: result.accessToken,
        expiresInSec: AUTH_CONFIG.jwt.accessTokenTtlSec,
      }, undefined, 200, headers);
    } catch (err: any) {
      logger.error(`Verify OTP controller error: ${err.message}`);
      return AuthController.makeEnvelope(false, undefined, {
        code: 'ERR_OTP_VERIFICATION_FAILED',
        message: err.message || 'OTP verification failed.',
      }, 400);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  public async refresh(req: NextRequest): Promise<NextResponse> {
    try {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(new RegExp(`(?:^|; )${AUTH_CONFIG.jwt.cookieName}=([^;]*)`));
      const refreshToken = match ? match[1] : null;

      if (!refreshToken) {
        return AuthController.makeEnvelope(false, undefined, {
          code: 'ERR_REFRESH_TOKEN_MISSING',
          message: 'No active session refresh token found. Please log in.',
        }, 401);
      }

      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.ip || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'Unknown Terminal';
      const result = await authService.refreshAccessToken(refreshToken, ip, userAgent);

      const headers = new Headers();
      headers.set(
        'Set-Cookie',
        `${AUTH_CONFIG.jwt.cookieName}=${result.refreshToken}; Path=/; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Max-Age=${AUTH_CONFIG.jwt.refreshTokenTtlSec}`
      );

      return AuthController.makeEnvelope(true, {
        accessToken: result.accessToken,
        expiresInSec: AUTH_CONFIG.jwt.accessTokenTtlSec,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          status: result.user.status,
          kycTier: result.user.kycTier,
        },
      }, undefined, 200, headers);
    } catch (err: any) {
      logger.warn(`Token rotation failure intercepted: ${err.message}`);
      const headers = new Headers();
      headers.set('Set-Cookie', `${AUTH_CONFIG.jwt.cookieName}=; Path=/; HttpOnly; Max-Age=0`);
      return AuthController.makeEnvelope(false, undefined, {
        code: 'ERR_SESSION_EXPIRED',
        message: err.message || 'Session expired. Please log in again.',
      }, 401, headers);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  public async logout(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await req.json().catch(() => ({}));
      const user = await extractAuthenticatedUser(req);

      if (body.logoutAllDevices && user) {
        await authService.logoutAllDevices(user.id);
      } else {
        const cookieHeader = req.headers.get('cookie') || '';
        const match = cookieHeader.match(new RegExp(`(?:^|; )${AUTH_CONFIG.jwt.cookieName}=([^;]*)`));
        const refreshToken = match ? match[1] : null;
        if (refreshToken) {
          await authService.logout(refreshToken);
        }
      }

      const headers = new Headers();
      headers.set('Set-Cookie', `${AUTH_CONFIG.jwt.cookieName}=; Path=/; HttpOnly; Max-Age=0`);
      return AuthController.makeEnvelope(true, { message: 'Session logged out cleanly.' }, undefined, 200, headers);
    } catch (err: any) {
      logger.error(`Logout controller error: ${err.message}`);
      const headers = new Headers();
      headers.set('Set-Cookie', `${AUTH_CONFIG.jwt.cookieName}=; Path=/; HttpOnly; Max-Age=0`);
      return AuthController.makeEnvelope(true, { message: 'Logged out.' }, undefined, 200, headers);
    }
  }

  /**
   * POST /api/v1/auth/totp/generate
   */
  public async generateTotp(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) {
      return AuthController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Authentication required.' }, 401);
    }

    try {
      const fullUser = await import('../repositories/user.repository').then((m) => m.userRepository.findById(user.id));
      if (!fullUser) throw new Error('User not found');

      const result = await authService.generateTotpSecret(fullUser);
      return AuthController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      logger.error(`Generate TOTP error: ${err.message}`);
      return AuthController.makeEnvelope(false, undefined, { code: 'ERR_TOTP_SETUP_FAILED', message: err.message }, 500);
    }
  }

  /**
   * POST /api/v1/auth/totp/enable
   */
  public async enableTotp(req: NextRequest): Promise<NextResponse> {
    const user = await extractAuthenticatedUser(req);
    if (!user) {
      return AuthController.makeEnvelope(false, undefined, { code: 'ERR_UNAUTHORIZED', message: 'Authentication required.' }, 401);
    }

    try {
      const body = await req.json().catch(() => ({}));
      const validation = validateInput(TotpEnableRequestSchema, body);
      if (!validation.success || !validation.data) {
        return AuthController.makeEnvelope(false, undefined, validation.error, 400);
      }

      const result = await authService.enableTotp(user.id, validation.data);
      return AuthController.makeEnvelope(true, result, undefined, 200);
    } catch (err: any) {
      logger.error(`Enable TOTP error: ${err.message}`);
      return AuthController.makeEnvelope(false, undefined, { code: 'ERR_TOTP_ENABLE_FAILED', message: err.message }, 400);
    }
  }
}

export const authController = new AuthController();
