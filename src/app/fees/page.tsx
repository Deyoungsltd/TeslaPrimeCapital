import React from 'react';
import type { Metadata } from 'next';
import { buildMarketingMetadata } from '@/lib/seo';
import { APP_CONFIG } from '@/config/app.config';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';

export const metadata: Metadata = buildMarketingMetadata(
  'Fee Schedule',
  'The complete TeslaPrimeCapital fee schedule: zero deposit fees, zero platform withdrawal fees, transparent minimums per currency, and referral commission rates.',
  '/fees',
);

const ZERO_FEE_ROWS: { item: string; value: string; note: string }[] = [
  { item: 'Account creation & custody', value: '$0', note: 'No setup, maintenance, or inactivity charges — ever.' },
  { item: 'Platform deposit fee', value: '0%', note: 'Every confirmed deposit credits at face value. Nothing is skimmed.' },
  { item: 'Platform withdrawal fee', value: '0%', note: 'Treasury review is free; digital-asset network fees on-chain are borne by the requester.' },
  { item: 'Treasury compliance review', value: '$0', note: 'Mandatory human sign-off on every withdrawal at no charge.' },
  { item: 'Plan allocation & exit', value: '0%', note: 'Allocations and maturity settlements carry no commission or spread.' },
];

const REFERRAL_TIERS: { tier: string; rate: string; detail: string }[] = [
  { tier: 'Level 1 (direct)', rate: '5%', detail: 'Of the referred allocation, vested across the plan term' },
  { tier: 'Level 2', rate: '2%', detail: 'Same vesting schedule, released with maturity' },
  { tier: 'Level 3', rate: '1%', detail: 'Settled on the referee plan maturity date' },
];

export default function FeeSchedulePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080A0F] text-gray-200">
      <MarketingHeader activePath="/fees" />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16 sm:px-12 sm:py-20">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#EF4444]">Transparency</p>
        <h1 className="mt-3 font-display text-[34px] font-semibold tracking-tight text-white sm:text-[42px]">
          The Fee Schedule — in Full
        </h1>
        <p className="mt-4 max-w-2xl text-[14px] leading-[1.8] text-gray-400">
          A platform that manages structured allocations has no business hiding its pricing.
          This page is the complete schedule; where a number is not listed here, the charge does not exist.
        </p>

        {/* Platform charges */}
        <section className="mt-14">
          <h2 className="font-display text-[22px] font-semibold text-white">Platform Charges</h2>
          <div className="mt-5 overflow-hidden rounded-lg border border-[#1E2433] bg-[#111520]">
            {ZERO_FEE_ROWS.map((row) => (
              <div key={row.item} className="grid gap-2 border-b border-[#1E2433]/70 px-6 py-5 last:border-0 sm:grid-cols-[1fr_120px_2fr] sm:items-center">
                <span className="text-[13px] font-semibold text-gray-100">{row.item}</span>
                <span className="font-mono text-[15px] font-bold text-emerald-400">{row.value}</span>
                <span className="text-[12px] leading-relaxed text-gray-500">{row.note}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Currency minimums */}
        <section className="mt-14">
          <h2 className="font-display text-[22px] font-semibold text-white">Currency Rails & Minimums</h2>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-gray-500">
            Minimums exist to keep settlement rails economical, not to gate participation.
            Tier-0 accounts may deposit up to $1,000 USD cumulative before identity verification is required.
          </p>
          <div className="mt-5 overflow-hidden rounded-lg border border-[#1E2433] bg-[#111520]">
            <div className="grid grid-cols-4 gap-2 border-b border-[#1E2433] bg-[#0A0D14] px-6 py-3.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
              <span>Asset</span>
              <span className="hidden sm:block">Rail</span>
              <span className="text-right">Min Deposit</span>
              <span className="text-right">Min Withdrawal</span>
            </div>
            {APP_CONFIG.supportedCurrencies.map((c) => (
              <div key={c.code} className="grid grid-cols-4 gap-2 border-b border-[#1E2433]/70 px-6 py-4 last:border-0">
                <span className="text-[13px] font-semibold text-gray-100">
                  {c.code}
                  <span className="ml-2 hidden text-[11px] font-normal text-gray-500 sm:inline">{c.name}</span>
                </span>
                <span className="hidden font-mono text-[11px] text-gray-500 sm:block">{c.type === 'FIAT' ? 'Banking / Card' : 'On-Chain'}</span>
                <span className="text-right font-mono text-[13px] text-gray-200">{c.minDeposit}</span>
                <span className="text-right font-mono text-[13px] text-gray-200">{c.minWithdrawal}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Referral economics */}
        <section className="mt-14">
          <h2 className="font-display text-[22px] font-semibold text-white">Referral Economics</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {REFERRAL_TIERS.map((t) => (
              <div key={t.tier} className="rounded-lg border border-[#1E2433] bg-[#111520] p-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{t.tier}</p>
                <p className="mt-2 font-display text-[34px] font-semibold text-[#EF4444]">{t.rate}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-gray-500">{t.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Third-party costs */}
        <section className="mt-14 rounded-lg border border-[#2C354C] bg-[#111520] p-7">
          <h2 className="font-display text-[18px] font-semibold text-white">Costs We Do Not Control</h2>
          <ul className="mt-4 space-y-3 text-[12px] leading-relaxed text-gray-400">
            <li className="flex gap-3">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#EF4444]" />
              Digital-asset network fees (miner/validator costs) are set by the respective networks at broadcast time, never by the platform.
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#EF4444]" />
              Your bank or card issuer may treat deposits as cash advances or apply FX conversion — those charges live on their statement, not ours.
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-[#EF4444]" />
              Pending withdrawals lock funds instantly but disburse only after treasury sign-off — the review itself is and will remain free.
            </li>
          </ul>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
