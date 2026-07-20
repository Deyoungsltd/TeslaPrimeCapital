import React from 'react';
import { EmailHeader } from './components/EmailHeader';
import { EmailFooter } from './components/EmailFooter';
import { SecurityAlertBox } from './components/SecurityAlertBox';

export interface ISecurityAlertEmailProps {
  firstName: string;
  alertTitle: string;
  alertDescription: string;
  ipAddress?: string;
  device?: string;
}

export const SecurityAlertEmail: React.FC<ISecurityAlertEmailProps> = ({
  firstName,
  alertTitle,
  alertDescription,
  ipAddress = 'Unknown IP',
  device = 'Active Device',
}) => (
  <div style={{ fontFamily: "'Inter', Arial, sans-serif", backgroundColor: '#0B0F19', color: '#F9FAFB', maxWidth: '600px', margin: '0 auto', border: '1px solid #1F2937' }}>
    <EmailHeader title="System Security Notice" />
    <div style={{ padding: '32px' }}>
      <h2 style={{ color: '#F87171', fontSize: '20px', marginTop: 0 }}>{alertTitle}</h2>
      <p style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: '1.6' }}>
        Hello {firstName}, <br /><br />
        {alertDescription}
      </p>

      <SecurityAlertBox ipAddress={ipAddress} device={device} />

      <p style={{ color: '#E5E7EB', fontSize: '13px', backgroundColor: '#7F1D1D', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #EF4444' }}>
        If you did not authorize this action, immediately log into your terminal and click &quot;Log out of all devices&quot; to trigger instantaneous Redis session token revocation across all global sessions.
      </p>
    </div>
    <EmailFooter />
  </div>
);
