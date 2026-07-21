/**
 * TeslaPrimeCapital — Cryptographic Utility Service
 * Provides Argon2id password hashing, SHA-256 OTP hashing, AES-256-GCM encryption, and secure RNG.
 */

import argon2 from 'argon2';
import crypto from 'crypto';
import { AUTH_CONFIG } from '@/config/auth.config';

export class CryptoUtil {
  /**
   * Hashes a user password using Argon2id with strict enterprise memory parameters.
   */
  public static async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: AUTH_CONFIG.argon2.memoryCost,
      timeCost: AUTH_CONFIG.argon2.timeCost,
      parallelism: AUTH_CONFIG.argon2.parallelism,
    });
  }

  /**
   * Verifies a plain text password against an stored Argon2id hash.
   */
  public static async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  /**
   * Generates a secure 6-digit One-Time Password (OTP).
   */
  public static generateSixDigitOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generates a salted SHA-256 hash of an OTP code combined with the user ID for Redis storage.
   */
  public static hashOtp(otp: string, userId: string): string {
    return crypto.createHash('sha256').update(`${otp}:${userId}`).digest('hex');
  }

  /**
   * Generates a cryptographic random 64-character hexadecimal session or refresh token string.
   */
  public static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generates an SHA-256 hash of a refresh token for lookup inside Redis and PostgreSQL.
   */
  public static hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Encrypts sensitive secrets (e.g., TOTP MFA seeds) via AES-256-GCM.
   */
  public static encryptSecret(plainText: string, masterKeyHex: string): string {
    if (masterKeyHex.length !== 64) {
      throw new Error('Master key must be exactly 64 hex characters (32 bytes) for AES-256-GCM.');
    }
    const key = Buffer.from(masterKeyHex, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * Decrypts an AES-256-GCM ciphertext payload back to plaintext.
   */
  public static decryptSecret(cipherPayload: string, masterKeyHex: string): string {
    const parts = cipherPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid cipher payload format for AES-256-GCM decryption.');
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = Buffer.from(masterKeyHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
  }

  /**
   * Signs a stateless JSON Web Token (JWT) using pure Node.js crypto HMAC-SHA256 (HS256).
   */
  public static signJwt(payload: Record<string, any>, secretHexOrAscii: string, expiresInSec: number): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSec,
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto.createHmac('sha256', secretHexOrAscii).update(dataToSign).digest('base64url');
    return `${dataToSign}.${signature}`;
  }

  /**
   * Verifies and decodes a signed HMAC-SHA256 (HS256) JWT. Returns payload if valid, or null if expired/forged.
   */
  public static verifyJwt(token: string, secretHexOrAscii: string): Record<string, any> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const [encodedHeader, encodedPayload, signature] = parts;
      const dataToVerify = `${encodedHeader}.${encodedPayload}`;
      const expectedSignature = crypto.createHmac('sha256', secretHexOrAscii).update(dataToVerify).digest('base64url');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return null; // Token expired
      }

      return payload;
    } catch {
      return null;
    }
  }
}

