import React from 'react';
import type { Metadata } from 'next';
import { TeslaLogo } from '@/components/atoms/TeslaLogo';

export const metadata: Metadata = {
  title: 'Risk Disclosure — TeslaPrimeCapital',
  description: 'Material risks of structured capital allocations, digital-asset settlement rails, and term liquidity locks.',
};

const SECTIONS: Array<{ title: string; body: string }> = [
  {
    title: '1. Term Liquidity Risk',
    body: 'Capital allocated to a structured plan is locked for the full maturity term — 3, 7, 14, or 24 days depending on the plan. There is no early-exit facility. Do not allocate funds you may need before the maturity date displayed at checkout.',
  },
  {
    title: '2. No Market Performance Guarantee',
    body: 'Plan rates are configuration targets fixed at the moment of allocation under the Lump-Sum Maturity Policy. They are not representations of external market performance, and nothing on this Platform constitutes investment advice, a securities offering, or a solicitation in any jurisdiction where one is not permitted.',
  },
  {
    title: '3. Digital-Asset Rail Risk',
    body: 'Deposits and withdrawals on digital-asset rails are subject to network congestion, confirmation delays, and address irreversibility. A withdrawal released to an incorrectly supplied destination cannot be recovered. Fiat settlement may be affected by banking cut-off times beyond the Platform’s control.',
  },
  {
    title: '4. Settlement & Custody Process Risk',
    body: 'Withdrawals settle only after manual compliance review. Review can introduce delay, particularly for first-time destinations or accounts under enhanced verification. The Platform mitigates human-process risk with two-factor attestation and immutable audit logging, but no process eliminates delay risk entirely.',
  },
  {
    title: '5. Platform & Counterparty Risk',
    body: 'Structured allocations are obligations of the Platform operator. They are not bank deposits and are not covered by deposit-insurance schemes. You should evaluate the operator’s disclosures, this Platform’s Terms of Service, and your own risk tolerance before allocating capital.',
  },
  {
    title: '6. Referral Income Variability',
    body: 'Referral commissions depend on the allocation behavior of referred partners and vest only on qualifying allocations. Projected referral income is inherently uncertain and must not be relied upon as fixed earnings.',
  },
  {
    title: '7. Contact',
    body: 'If any risk described here is unclear, do not allocate capital until you have received clarification from support or an independent professional adviser.',
  },
];

export default function RiskDisclosurePage() {
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
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Risk Disclosure</h1>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
            Effective 22 July 2026 · Version 1.0
          </p>
          <p className="max-w-2xl text-sm text-gray-400 leading-relaxed pt-2">
            Read this document in full before allocating capital. It sets out the material risks specific to term-locked structured plans, digital-asset settlement, and manual release custody.
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
        TeslaPrimeCapital &copy; 2026 — Risk Disclosure
      </footer>
    </div>
  );
}
