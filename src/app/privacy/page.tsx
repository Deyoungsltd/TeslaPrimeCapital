import React from 'react';
import type { Metadata } from 'next';
import { APP_CONFIG } from '@/config/app.config';
import { TeslaLogo } from '@/components/atoms/TeslaLogo';

export const metadata: Metadata = {
  title: 'Privacy Policy — TeslaPrimeCapital',
  description: 'How TeslaPrimeCapital collects, encrypts, retains, and protects personal and financial data.',
};

const SECTIONS: Array<{ title: string; body: string }> = [
  {
    title: '1. Scope of This Policy',
    body: 'This Privacy Policy describes what data TeslaPrimeCapital collects when you register, verify, deposit, allocate, withdraw, or communicate with the Platform, and the controls applied to that data at rest and in transit.',
  },
  {
    title: '2. Data We Collect',
    body: 'Account data: name, email address, and credentials (stored only as salted hashes). Verification data: government-issued identity documents and selfie imagery submitted for Tier-1/Tier-2 review. Financial data: wallet balances, ledger entries, plan allocations, and withdrawal destinations. Technical data: IP addresses, device fingerprints, and session metadata used for rate limiting and session security.',
  },
  {
    title: '3. How Data Is Protected',
    body: 'Sensitive credential material is encrypted with AES-256-GCM; two-factor secrets are stored encrypted, never in plaintext. Sessions issue short-lived access tokens with rotating refresh tokens stored as hashes. Database monetary values use fixed-point NUMERIC(20,8) precision so balances cannot silently drift. All administrative release actions are recorded in an immutable audit log.',
  },
  {
    title: '4. How Data Is Used',
    body: 'Data is used to operate wallets and plans, satisfy identity-verification obligations, prevent fraud and abuse, deliver service notifications, and compute referral commissions. We do not sell personal data, and we do not use verification imagery for any purpose other than compliance review.',
  },
  {
    title: '5. Sharing & Third Parties',
    body: 'Data is shared only with infrastructure providers required to run the Platform (database hosting, object storage for verification documents) and with market-data and communication widgets strictly to render platform features (TradingView charting; Smartsupp live chat). Each provider processes data under its own terms, identified by name here so you can review them.',
  },
  {
    title: '6. Retention',
    body: 'Ledger and audit records are retained for the life of the Platform as required for financial reconciliation. Verification documents are retained while an account remains active and for the period required by applicable record-keeping rules after closure, then purged from object storage.',
  },
  {
    title: '7. Your Rights',
    body: 'You may request a copy of your personal data, correction of inaccurate records, or deletion of data that we are not legally required to retain, by contacting compliance from your registered email address. Deletion of verification records requires account closure and settlement of all pending allocations.',
  },
  {
    title: '8. Contact',
    body: `Privacy inquiries and data requests: ${APP_CONFIG.supportEmail}. Include "Privacy Request" in the subject line for prioritized handling.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans">
      <header className="sticky top-0 z-40 border-b border-[#1E2433] bg-[#080A0F]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-6 sm:px-12 h-[72px] flex items-center justify-between">
          <a href="/"><TeslaLogo size="sm" /></a>
          <a href="/" className="font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400 hover:text-white transition">
            Back to Home
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 sm:px-12 py-16">
        <div className="space-y-4 border-b border-[#1E2433] pb-10">
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">Legal</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
            Effective 22 July 2026 · Version 1.0
          </p>
        </div>

        <div className="divide-y divide-[#1E2433]">
          {SECTIONS.map((section) => (
            <section key={section.title} className="py-8">
              <h2 className="text-base font-extrabold tracking-tight text-white">{section.title}</h2>
              <p className="mt-3 text-sm text-gray-400 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-[#1E2433] py-8 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
        TeslaPrimeCapital &copy; 2026 — Privacy Policy
      </footer>
    </div>
  );
}
