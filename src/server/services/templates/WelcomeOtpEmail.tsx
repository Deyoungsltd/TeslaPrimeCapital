import React from 'react';
import { EmailHeader } from './components/EmailHeader';
import { EmailFooter } from './components/EmailFooter';
import { SecurityAlertBox } from './components/SecurityAlertBox';

export interface IWelcomeOtpEmailProps {
  firstName: string;
  otpCode: string;
  expiresInMinutes?: number;
  ipAddress?: string;
}

export const WelcomeOtpEmail: React.FC<IWelcomeOtpEmailProps> = ({
  firstName,
  otpCode,
  expiresInMinutes = 10,
  ipAddress = 'Unknown IP',
}) => (
  <div style={{ fontFamily: "'Inter', Arial, sans-serif", backgroundColor: '#0B0F19', color: '#F9FAFB', maxWidth: '600px', margin: '0 auto', border: '1px solid #1F2937' }}>
    <EmailHeader title="Account Identity Verification" />
    <div style={{ padding: '32px' }}>
      <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginTop: 0 }}>Greetings, {firstName}</h2>
      <p style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: '1.6' }}>
        You have initiated registration on the **TeslaPrimeCapital** wealth management terminal. To confirm your email identity and activate your account (`Tier 0 Starter`), please enter the cryptographic One-Time Password below:
      </p>

      <div style={{ backgroundColor: '#111827', border: '2px dashed #D4AF37', borderRadius: '8px', padding: '24px', textAlign: 'center', margin: '24px 0' }}>
        <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#D4AF37', letterSpacing: '8px', fontFamily: 'monospace' }}>
          {otpCode}
        </span>
      </div>

      <p style={{ color: '#9CA3AF', fontSize: '13px' }}>
        This authorization token is strictly valid for **{expiresInMinutes} minutes**. If you did not request this verification, your account credentials remain secure and no further action is required.
      </p>

      <SecurityAlertBox ipAddress={ipAddress} device="New Registration Session" />
    </div>
    <EmailFooter />
  </div>
);
