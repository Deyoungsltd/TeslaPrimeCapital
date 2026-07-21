import React from 'react';
import { APP_CONFIG } from '@/config/app.config';

export const EmailFooter: React.FC = () => (
  <div style={{ backgroundColor: '#111827', padding: '20px', textAlign: 'center', borderTop: '1px solid #1F2937', color: '#6B7280', fontSize: '12px' }}>
    <p style={{ margin: '0 0 8px 0' }}>
      This is an automated system notification dispatched from {APP_CONFIG.platformName}. Please do not reply directly to this email address.
    </p>
    <p style={{ margin: 0 }}>
      &copy; {new Date().getFullYear()} {APP_CONFIG.platformName} — All Rights Reserved. Exact double-entry ledger accuracy verified.
    </p>
  </div>
);
