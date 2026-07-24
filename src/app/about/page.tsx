import React from 'react';
import type { Metadata } from 'next';
import { ManagedImage } from '@/components/atoms/ManagedImage';
import { buildMarketingMetadata } from '@/lib/seo';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';
import { BreadcrumbJsonLd } from '@/components/atoms/BreadcrumbJsonLd';

export const metadata: Metadata = buildMarketingMetadata(
  'About the Firm',
  'Engineering-first capital management: double-entry ledgers, human custody, deterministic settlement.',
  '/about',
);

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
      <BreadcrumbJsonLd items={[{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]} />

      <main>
        {/* Statement band */}
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-24 sm:px-12">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#EF4444]" />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
              The Firm
            </span>
          </div>
          <h1 className="mt-7 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl">
            A capital engine, not a casino.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-gray-400">
            TeslaPrimeCapital was built by engineers, not marketers. The platform behaves like a
            clearing house: deterministic ledgers, human custody over every release, and
            settlement that arrives on the exact day it was promised.
          </p>
        </section>

        {/* Tower statement */}
        <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-12">
          <div className="relative h-[320px] overflow-hidden rounded-2xl border border-[#1E2433] bg-black shadow-tesla sm:h-[460px]">
            <ManagedImage
              slotKey="about.story"
              alt="TeslaPrimeCapital headquarters tower at dusk"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/85 via-transparent to-transparent" />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#1E2433] bg-[#1E2433] lg:grid-cols-4">
            {STANDARDS.map((stat) => (
              <div key={stat.label} className="bg-[#0C0F16] px-6 py-8 text-center">
                <div className="font-display text-2xl tracking-tight text-white sm:text-3xl">{stat.value}</div>
                <div className="mt-2 font-mono text-[8.5px] font-bold uppercase leading-relaxed tracking-[0.18em] text-gray-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Governance band — human custody */}
        <section className="border-y border-[#1E2433] bg-[#0A0D14]">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-24 sm:px-12 lg:grid-cols-2 lg:gap-20">
            <div className="relative overflow-hidden rounded-2xl border border-[#1E2433] shadow-tesla">
              <div className="relative h-[300px] w-full sm:h-[380px]">
                <ManagedImage
                  slotKey="about.leadership"
                  alt="Governance boardroom — executives reviewing settlement ledgers"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/75 via-transparent to-transparent" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-[#EF4444]" />
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
                  The Governance Standard
                </span>
              </div>
              <h2 className="mt-7 font-display text-3xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl">
                Machines keep the books. Humans sign the releases.
              </h2>
              <p className="mt-6 text-sm leading-relaxed text-gray-400">
                Automation is trusted with arithmetic and nothing more. Accrual math, ledger
                integrity, settlement cadence — deterministic and machine-perfect. But the
                moment capital leaves the platform, a person answers for it: a finance manager,
                a TOTP attestation, an immutable signature in the audit log.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                That is the entire philosophy. Software earns your efficiency; governance earns
                your trust. We deliberately built both.
              </p>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="mx-auto max-w-7xl px-6 py-24 sm:px-12 sm:py-32">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#EF4444]" />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
              Operating Pillars
            </span>
          </div>
          <h2 className="mt-7 max-w-2xl font-display text-3xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl">
            Four rules the platform will not break.
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#1E2433] bg-[#1E2433] md:grid-cols-2">
            {PILLARS.map((pillar, i) => (
              <div key={pillar.title} className="group bg-[#0C0F16] p-9 transition-colors duration-500 hover:bg-[#111520] sm:p-12">
                <span className="font-display text-3xl italic tracking-tight text-[#EF4444]/85">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 font-display text-2xl font-medium tracking-tight text-white">{pillar.title}</h3>
                <p className="mt-4 text-[13px] leading-relaxed text-gray-400">{pillar.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <a href="/register">
              <button
                type="button"
                className="h-12 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] px-10 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_35px_rgba(239,68,68,0.65)] active:translate-y-0"
              >
                Open Your Terminal
              </button>
            </a>
            <a href="/insights" className="font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-white">
              Read the engineering briefings
            </a>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
