import React from 'react';
import type { Metadata } from 'next';
import { APP_CONFIG } from '@/config/app.config';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: 'About the Firm — TeslaPrimeCapital',
  description: 'Engineering-first capital management: double-entry ledgers, human custody, deterministic settlement.',
};

const PILLARS = [
  {
    title: 'Deterministic ledgers',
    body: 'Every deposit, allocation, accrual, commission, and withdrawal posts paired double-entry records at NUMERIC(20,8) precision. If the books do not balance to the eighth decimal, the transaction does not commit.',
  },
  {
    title: 'Human custody over releases',
    body: 'No automated gateway disburses client funds. Every withdrawal locks instantly at request, then a finance manager authorizes the release with two-factor TOTP attestation — recorded immutably in the audit log.',
  },
  {
    title: 'No discretionary trading desk',
    body: 'The platform does not gamble client capital on directional bets. Yield is computed by a deterministic accrual engine on a fixed schedule — 00:00 UTC daily — with term rates locked at the moment of allocation.',
  },
  {
    title: 'Radical inspectability',
    body: 'Your terminal exposes everything: wallet ledgers, accrual logs, commission history, session security, and notifications. If it moves on the platform, you can trace it line-by-line.',
  },
];

const STANDARDS = [
  { value: '08', label: 'Settlement currencies on one account' },
  { value: '00:00 UTC', label: 'Daily deterministic accrual run' },
  { value: 'AES-256', label: 'GCM encryption for sessions & keys' },
  { value: '100%', label: 'Withdrawals under human review' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#EF4444] selection:text-white">
      <MarketingHeader activePath="/about" />

      <main>
        {/* Statement band */}
        <section className="mx-auto max-w-7xl px-6 sm:px-12 pt-20 pb-14 space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#EF4444]" />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
              The Firm
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-3xl">
            A capital engine, not a casino
          </h1>
          <p className="max-w-2xl text-sm text-gray-400 leading-relaxed">
            TeslaPrimeCapital was built by engineers, not marketers. The platform behaves like a clearing house: deterministic ledgers, human custody over every release, and settlement that arrives on the exact day it was promised.
          </p>
        </section>

        {/* Boardroom image + standards */}
        <section className="mx-auto max-w-7xl px-6 sm:px-12 pb-20">
          <div className="relative rounded-2xl overflow-hidden border border-[#1E2433] bg-black shadow-tesla">
            <img
              src="/branding/boardroom.jpg"
              alt="TeslaPrimeCapital operations floor"
              className="h-[320px] sm:h-[440px] w-full object-cover opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 rounded-xl border border-[#1E2433] bg-[#0A0D14]/95 px-6 py-5 backdrop-blur-md">
              <div className="font-mono text-2xl font-extrabold text-white">NUMERIC(20,8)</div>
              <div className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Fixed-Point Ledger Precision
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#1E2433] bg-[#080A0F]">
          <div className="mx-auto max-w-7xl px-6 sm:px-12 grid grid-cols-2 lg:grid-cols-4">
            {STANDARDS.map((stat, i) => (
              <div
                key={stat.label}
                className={`py-10 px-4 sm:px-6 text-center ${i !== 0 ? 'border-l border-[#1E2433]' : ''} ${i >= 2 ? 'border-t lg:border-t-0 border-[#1E2433]' : ''}`}
              >
                <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{stat.value}</div>
                <div className="mt-2 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 leading-relaxed">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pillars */}
        <section className="mx-auto max-w-7xl px-6 sm:px-12 py-20">
          <div className="mb-12 space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#EF4444]" />
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
                Operating Principles
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How the platform is run</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PILLARS.map((pillar, i) => (
              <div key={pillar.title} className="rounded-2xl border border-[#1E2433] bg-[#111520] p-8 hover:border-white/25 hover:bg-[#131826] transition-colors">
                <span className="font-mono text-xs font-extrabold tracking-[0.3em] text-[#EF4444]/70">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 text-lg font-extrabold tracking-tight text-white">{pillar.title}</h3>
                <p className="mt-3 text-xs text-gray-400 leading-relaxed">{pillar.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Legal + contact band */}
        <section className="border-t border-[#1E2433] bg-[#0A0D14]">
          <div className="mx-auto max-w-7xl px-6 sm:px-12 py-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="space-y-3 max-w-xl">
              <h2 className="text-2xl font-extrabold tracking-tight">Read the fine print. We insist.</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Our Terms of Service, Privacy Policy, and Risk Disclosure are written to be read. Questions reach a human compliance desk at {APP_CONFIG.supportEmail}.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="/terms">
                <button className="h-11 px-6 rounded-lg border border-white/15 bg-white/5 font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-white transition hover:bg-white/10 hover:border-white/40">Terms</button>
              </a>
              <a href="/privacy">
                <button className="h-11 px-6 rounded-lg border border-white/15 bg-white/5 font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-white transition hover:bg-white/10 hover:border-white/40">Privacy</button>
              </a>
              <a href="/risk">
                <button className="h-11 px-6 rounded-lg border border-white/15 bg-white/5 font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-white transition hover:bg-white/10 hover:border-white/40">Risk</button>
              </a>
              <a href="/register">
                <button className="h-11 px-7 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] hover:-translate-y-0.5">Open an Account</button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
