import React from 'react';
import type { Metadata } from 'next';
import { buildMarketingMetadata } from '@/lib/seo';
import { APP_CONFIG } from '@/config/app.config';
import { TeslaLogo } from '@/components/atoms/TeslaLogo';

export const metadata: Metadata = buildMarketingMetadata(
  'Terms of Service',
  'The contractual terms governing use of the TeslaPrimeCapital platform, structured allocation plans, wallets, and referral program.',
  '/terms',
);

const SECTIONS: Array<{ title: string; body: string }> = [
  {
    title: '1. Agreement to Terms',
    body: 'By creating an account on TeslaPrimeCapital ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not register, deposit, or allocate capital. These terms form a binding agreement between you and the Platform operator and govern all wallets, structured allocation plans, referral commissions, and related services.',
  },
  {
    title: '2. Eligibility & Verification Tiers',
    body: 'You must be of legal age in your jurisdiction and not a resident of any sanctioned territory. New accounts receive Tier-0 clearance automatically, permitting cumulative allocations up to $1,000 USD equivalent. Tier-1 verification (government-issued ID and selfie match) is mandatory before any withdrawal and before deposits beyond the Tier-0 ceiling. The Platform may suspend accounts that fail or circumvent verification.',
  },
  {
    title: '3. Structured Allocation Plans',
    body: 'Capital allocated to a plan is locked for its full term and accrues yield daily under the Lump-Sum Maturity Policy. Accrued yield is tracked off-ledger in the accrual log and settles — principal plus compounded yield — to your available wallet at 00:00 UTC on the maturity date. Early exit from a plan is not supported. Plan rates shown at allocation are fixed for that allocation; future allocations may be offered at different terms.',
  },
  {
    title: '4. Deposits & Withdrawal Custody',
    body: 'Deposits credit to your wallet after confirmation on the relevant rail. All withdrawals enter a manual compliance review queue: funds are locked instantly at request time and released only after authorization by a finance manager with two-factor attestation. The Platform charges no hidden disbursement fees; network fees on digital-asset rails are borne by the requester.',
  },
  {
    title: '5. Referral Program',
    body: 'Commissions pay 5% on first-tier partners, 2% on second-tier, and 1% on third-tier, measured on the qualifying allocated amount. Commissions vest only when referred capital allocates into a structured plan — never on registration alone. Self-referral, circular referral chains, and incentive abuse void commission eligibility and may result in account suspension.',
  },
  {
    title: '6. Acceptable Use',
    body: 'You may not use the Platform for money laundering, fraud, market manipulation, or any unlawful purpose; attempt to breach rate limits, session protections, or administrative interfaces; or misrepresent your identity. Violations result in account restriction, freezing of pending releases pending investigation, and reporting where legally required.',
  },
  {
    title: '7. Risk Acknowledgment',
    body: 'Structured allocations involve term and market risk as described in the Risk Disclosure. Figures presented in plan materials are targets established by the plan configuration, not guarantees of external market performance. You should allocate only capital whose time-lock you can sustain for the full term.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'To the maximum extent permitted by law, the Platform is not liable for indirect, incidental, or consequential losses, for interruptions caused by third-party market-data or infrastructure providers, or for losses arising from compromised account credentials where session protections were available but not enabled.',
  },
  {
    title: '9. Amendments & Contact',
    body: `These terms may be updated; material changes are announced through the notification center before taking effect. Continued use after the effective date constitutes acceptance. Questions regarding these terms may be directed to ${APP_CONFIG.supportEmail}.`,
  },
];

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Terms of Service</h1>
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
        TeslaPrimeCapital &copy; 2026 — Terms of Service
      </footer>
    </div>
  );
}
