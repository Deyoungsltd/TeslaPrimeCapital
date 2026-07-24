import React from 'react';
import { EmailHeader } from './components/EmailHeader';
import { EmailFooter } from './components/EmailFooter';

export interface IDeskMessageEmailProps {
  firstName: string;
  deskLabel: string;
  subject: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Renders a governance-desk decision message as a personal 1:1 letter from the
 * responsible desk (Compliance Desk / Treasury Desk), quoting the officer's
 * exact wording inside a signed message panel.
 */
export const DeskMessageEmail: React.FC<IDeskMessageEmailProps> = ({
  firstName,
  deskLabel,
  subject,
  message,
  ctaLabel = 'Open Support Desk',
  ctaHref = 'https://teslaprimecapital.com/dashboard/support',
}) => (
  <div style={{ fontFamily: "'Inter', Arial, sans-serif", backgroundColor: '#0B0F19', color: '#F9FAFB', maxWidth: '600px', margin: '0 auto', border: '1px solid #1F2937' }}>
    <EmailHeader title={deskLabel} />
    <div style={{ padding: '32px' }}>
      <p style={{ color: '#9CA3AF', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 6px 0', fontWeight: 700 }}>
        {deskLabel} · Decision Correspondence
      </p>
      <h2 style={{ color: '#F9FAFB', fontSize: '20px', marginTop: 0 }}>{subject}</h2>
      <p style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: '1.6' }}>
        Hello {firstName},
      </p>

      <div style={{ backgroundColor: '#111827', border: '1px solid #1F2937', borderLeft: '4px solid #EF4444', borderRadius: '6px', padding: '18px 20px', margin: '18px 0' }}>
        <p style={{ color: '#E5E7EB', fontSize: '14px', lineHeight: '1.75', margin: 0, whiteSpace: 'pre-line' }}>
          {message}
        </p>
      </div>

      <a
        href={ctaHref}
        style={{ display: 'inline-block', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, textDecoration: 'none', padding: '12px 22px', borderRadius: '6px', marginTop: '4px' }}
      >
        {ctaLabel}
      </a>

      <p style={{ color: '#6B7280', fontSize: '12px', lineHeight: '1.7', marginTop: '24px' }}>
        This message was written by the {deskLabel} officer handling your account and is permanently
        recorded inside your Support Desk thread, where you may reply directly. For your protection,
        TeslaPrimeCapital will never ask for passwords or authenticator codes over email.
      </p>
    </div>
    <EmailFooter />
  </div>
);
