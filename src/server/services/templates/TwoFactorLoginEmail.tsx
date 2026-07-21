import React from 'react';
import { EmailHeader } from './components/EmailHeader';
import { EmailFooter } from './components/EmailFooter';
import { SecurityAlertBox } from './components/SecurityAlertBox';

export interface ITwoFactorLoginEmailProps {
  firstName: string;
  otpCode: string;
  ipAddress?: string;
  device?: string;
}

export const TwoFactorLoginEmail: React.FC<ITwoFactorLoginEmailProps> = ({
  firstName,
  otpCode,
  ipAddress = 'Unknown IP',
  device = 'Unrecognized Terminal',
}) => (
  <div style={{ fontFamily: "'Inter', Arial, sans-serif", backgroundColor: '#0B0F19', color: '#F9FAFB', maxWidth: '600px', margin: '0 auto', border: '1px solid #1F2937' }}>
    <EmailHeader title="Security Challenge Required" />
    <div style={{ padding: '32px' }}>
      <h2 style={{ color: '#FFFFFF', fontSize: '20px', marginTop: 0 }}>Security Alert, {firstName}</h2>
      <p style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: '1.6' }}>
        A login request to your **TeslaPrimeCapital** portfolio was intercepted from an unrecognized device or IP address. To authorize session token rotation and enter the terminal, enter the Two-Factor One-Time Password:
      </p>

      <div style={{ backgroundColor: '#111827', border: '2px solid #3B82F6', borderRadius: '8px', padding: '24px', textAlign: 'center', margin: '24px 0' }}>
        <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#60A5FA', letterSpacing: '8px', fontFamily: 'monospace' }}>
          {otpCode}
        </span>
      </div>

      <SecurityAlertBox ipAddress={ipAddress} device={device} />
    </div>
    <EmailFooter />
  </div>
);
