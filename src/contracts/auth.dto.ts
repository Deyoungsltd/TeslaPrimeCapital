/**
 * TeslaPrimeCapital — Authentication DTOs
 */

export interface IRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  referralCode?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
  totpCode?: string;
}

export interface IOtpVerificationRequest {
  otpCode: string;
}

export interface ITokenRefreshResponse {
  accessToken: string;
  expiresInSec: number;
}

export interface IAuthUserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'COMPLIANCE_OFFICER' | 'FINANCE_MANAGER' | 'SUPPORT_AGENT' | 'AFFILIATE_PARTNER' | 'INVESTOR';
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'LOCKED';
  kycTier: 'TIER_0' | 'TIER_1' | 'TIER_2';
  twoFactorEnabled: boolean;
  referralCode: string;
}
