import React from 'react';
import type { Metadata } from 'next';
import { buildMarketingMetadata } from '@/lib/seo';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';
import { BreadcrumbJsonLd } from '@/components/atoms/BreadcrumbJsonLd';

export const metadata: Metadata = buildMarketingMetadata(
  'How to Invest',
  'The complete capital deployment guide: registration, verification tiers, funding rails, allocation, and maturity settlement.',
  '/how-to-invest',
);

const STEPS = [
  {
    step: '01',
    title: 'Register & verify your email',
    body: 'Create your account with your name and email. A 6-digit one-time passcode is delivered to your inbox — enter it to activate the account. Your login sessions are then protected with rotating tokens, and you may add a TOTP authenticator for a second factor at any time.',
  },
  {
    step: '02',
    title: 'Choose your clearance path',
    body: 'Every account begins at Tier-0 with no documents required — you may allocate up to $1,000 USD equivalent immediately. To withdraw, or to deposit beyond the ceiling, complete Tier-1 verification with a government-issued ID and selfie. Tier-2 unlocks the flagship Diamond pool for allocations from $50,000.',
  },
  {
    step: '03',
    title: 'Fund your wallet',
    body: 'Deposit in any of eight supported currencies — USD, EUR, GBP, JPY, BTC, ETH, USDT, or USDC. Deposits credit to your available wallet after confirmation on the relevant rail, and every movement posts a double-entry ledger record you can inspect at any time.',
  },
  {
    step: '04',
    title: 'Allocate to a plan',
    body: 'Select a structured pool from the plans page, review the term and rates at checkout, and confirm. Your capital locks immediately and the daily accrual engine begins compounding at 00:00 UTC the same day.',
  },
  {
    step: '05',
    title: 'Settle at maturity',
    body: 'There is no early exit and no drip-feed: on maturity day your principal plus the full compounded yield lands in your available wallet in one lump sum. Withdrawals then pass a short human compliance review before release.',
  },
];

const KYC_TIERS = [
  { tier: 'Tier 0', requirement: 'Email verification only', ceiling: 'Allocate up to $1,000', withdrawals: 'Locked until Tier 1' },
  { tier: 'Tier 1', requirement: 'Government ID + selfie', ceiling: 'Allocations up to $50,000', withdrawals: 'Permitted after review' },
  { tier: 'Tier 2', requirement: 'Enhanced due diligence', ceiling: 'Diamond pool · up to $1,000,000', withdrawals: 'Priority review lane' },
];

export default function HowToInvestPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#EF4444] selection:text-white">
      <MarketingHeader activePath="/how-to-invest" />
      <BreadcrumbJsonLd items={[{ name: 'Home', path: '/' }, { name: 'How to Invest', path: '/how-to-invest' }]} />

      <main>
        <section className="mx-auto max-w-7xl px-6 sm:px-12 pt-20 pb-14 space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#EF4444]" />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
              Deployment Guide
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-3xl">
            Capital in five movements
          </h1>
          <p className="max-w-2xl text-sm text-gray-400 leading-relaxed">
            From first registration to final settlement, this is the exact lifecycle of every dollar on the platform. No hidden mechanics, no surprise gates — each step below describes precisely what happens and when.
          </p>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-7xl px-6 sm:px-12 pb-20 space-y-px rounded-2xl overflow-hidden border border-[#1E2433]">
          {STEPS.map((item, i) => (
            <div
              key={item.step}
              className={`grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 bg-[#111520] p-8 sm:p-10 ${i !== STEPS.length - 1 ? 'border-b border-[#1E2433]' : ''} hover:bg-[#131826] transition-colors`}
            >
              <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#EF4444]/30">{item.step}</span>
              <div className="space-y-3">
                <h2 className="text-xl font-extrabold tracking-tight text-white">{item.title}</h2>
                <p className="max-w-3xl text-sm text-gray-400 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </section>

        {/* KYC tier table */}
        <section className="border-t border-[#1E2433] bg-[#0A0D14]">
          <div className="mx-auto max-w-7xl px-6 sm:px-12 py-20">
            <div className="mb-12 space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-[#EF4444]" />
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
                  Verification Tiers
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Clearance, graduated</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {KYC_TIERS.map((row) => (
                <div key={row.tier} className="rounded-2xl border border-[#1E2433] bg-[#111520] p-8 space-y-5 hover:border-white/25 transition-colors">
                  <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#EF4444]">{row.tier}</span>
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Requirement</div>
                      <div className="mt-1 font-semibold text-white">{row.requirement}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Ceiling</div>
                      <div className="mt-1 font-semibold text-white">{row.ceiling}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Withdrawals</div>
                      <div className="mt-1 font-semibold text-white">{row.withdrawals}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Rails + CTA */}
        <section className="mx-auto max-w-7xl px-6 sm:px-12 py-20">
          <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="space-y-3 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Eight rails. One account.</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Fund and settle in USD, EUR, GBP, JPY, BTC, ETH, USDT, or USDC — normalized under a single fixed-point ledger. Ready when you are.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
              <a href="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-[240px] h-12 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] hover:-translate-y-0.5">
                  Start at Step One
                </button>
              </a>
              <a href="/plans" className="w-full sm:w-auto">
                <button className="w-full sm:w-[220px] h-12 rounded-lg border border-white/15 bg-white/5 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5">
                  Compare Plans
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
