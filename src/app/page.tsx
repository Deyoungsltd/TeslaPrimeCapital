import React from 'react';
import { ManagedImage } from '@/components/atoms/ManagedImage';
import { INVESTMENT_PLANS_CONFIG } from '@/config/plans.config';
import { INSIGHT_ARTICLES } from '@/content/insights/articles';
import { PlanCard } from '@/components/molecules/PlanCard';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';
import { LeadershipSection } from '@/components/organisms/marketing/LeadershipSection';
import { TradingViewSymbolOverview } from '@/components/organisms/tradingview/TradingViewSymbolOverview';
import { TradingViewMarketOverview } from '@/components/organisms/tradingview/TradingViewMarketOverview';

const EYEBROW = (text: string) => (
  <div className="flex items-center gap-3">
    <span className="h-px w-10 bg-[#EF4444]" />
    <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">{text}</span>
  </div>
);

const MICRO_STATS = [
  { value: '0.25–0.55%', label: 'Daily accrual bands, fixed at allocation' },
  { value: '00:00 UTC', label: 'Deterministic settlement, every day' },
  { value: '100%', label: 'Withdrawals under human review' },
];

const DOCTRINE_STEPS = [
  {
    numeral: 'I',
    title: 'Verify',
    body: 'Tiered identity clearance — Tier 0 carries a strict $1,000 ceiling, Tiers 1 and 2 unlock the full term sheets. Documents travel to an encrypted vault, never to email.',
  },
  {
    numeral: 'II',
    title: 'Allocate',
    body: 'Choose a term sheet and commit. The position locks for its stated term — 30, 90, or 180 days — and the daily rate is frozen into the contract from that instant.',
  },
  {
    numeral: 'III',
    title: 'Settle',
    body: 'At 00:00 UTC daily the accrual engine posts yield line-by-line to your ledger. At maturity, principal plus full accrued yield arrives in a single lump-sum credit.',
  },
];

const TERMINAL_FEATURES = [
  {
    title: 'Ledger you can interrogate',
    body: 'Wallet movements, accrual entries, commissions — every record double-entry to the eighth decimal, and every record visible.',
  },
  {
    title: 'TOTP + session governance',
    body: 'Two-factor attestation on withdrawals, rotating refresh sessions, and full device history inside your security panel.',
  },
  {
    title: 'Referral engine with vesting',
    body: '5% · 2% · 1% commissions across three generations, released against active allocations — not sign-up bounties.',
  },
  {
    title: 'Human custody over releases',
    body: 'No automated pipe disburses client funds. A finance manager signs every withdrawal, and the audit log remembers.',
  },
];

export default function LandingPage() {
  const previewArticles = [...INSIGHT_ARTICLES].slice(0, 3);

  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#EF4444] selection:text-white">
      <MarketingHeader activePath="/" />

      {/* ═══════════════ 1. CINEMATIC HERO — dusk boardroom ═══════════════ */}
      <section className="relative min-h-[88vh] w-full overflow-hidden">
        <ManagedImage
          slotKey="home.hero"
          alt="TeslaPrimeCapital executive boardroom at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080A0F] via-[#080A0F]/80 to-[#080A0F]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F] via-transparent to-[#080A0F]/40" />

        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-6 pb-24 pt-40 sm:px-12">
          {EYEBROW('Structured Capital Allocations')}
          <h1 className="mt-8 max-w-3xl font-display text-[50px] font-medium leading-[1.03] tracking-tight text-white sm:text-7xl lg:text-[86px]">
            Capital discipline, engineered for the digital era.
          </h1>
          <p className="mt-8 max-w-xl text-[15px] leading-[1.8] text-gray-300 sm:text-[17px]">
            Term-defined allocations with daily 00:00&nbsp;UTC accrual, lump-sum maturity
            settlement, and human-reviewed withdrawals — every entry auditable to the
            eighth decimal.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a href="/register" className="w-full sm:w-auto">
              <button
                type="button"
                className="h-12 w-full rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] px-10 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_35px_rgba(239,68,68,0.65)] active:translate-y-0 sm:w-auto"
              >
                Open Your Terminal
              </button>
            </a>
            <a
              href="/plans"
              className="flex h-12 w-full items-center justify-center rounded-lg border border-[#2C354C] bg-transparent px-10 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-gray-200 transition-all duration-300 hover:border-gray-400 hover:text-white sm:w-auto"
            >
              View Term Sheets
            </a>
          </div>

          {/* Micro-stat hairline strip */}
          <div className="mt-16 grid grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
            {MICRO_STATS.map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-4">
                <span className="font-display text-2xl tracking-tight text-white">{stat.value}</span>
                <span className="font-mono text-[9px] font-bold uppercase leading-relaxed tracking-[0.18em] text-gray-400">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 3. PLATFORM STANDARDS ═══════════════ */}
      <section className="border-b border-[#1E2433] bg-[#080A0F]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-6 sm:px-12 lg:grid-cols-4">
          {[
            { value: '08', label: 'Settlement currencies, one account' },
            { value: '20,8', label: 'Ledger precision — decimal places' },
            { value: '5 · 2 · 1%', label: 'Three-tier affiliate vesting' },
            { value: 'AES-256', label: 'GCM session & key encryption' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`px-4 py-14 text-center sm:px-8 ${i !== 0 ? 'border-l border-[#1E2433]' : ''} ${i >= 2 ? 'border-t border-[#1E2433] lg:border-t-0' : ''}`}
            >
              <div className="font-display text-3xl tracking-tight text-white sm:text-4xl">{stat.value}</div>
              <div className="mt-3 font-mono text-[9px] font-bold uppercase leading-relaxed tracking-[0.2em] text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 4. THE DOCTRINE — how capital moves ═══════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-28 sm:px-12 sm:py-36">
        {EYEBROW('The Doctrine')}
        <div className="mt-7 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-xl font-display text-4xl font-medium leading-[1.06] tracking-tight text-white sm:text-5xl">
            Three movements. No improvisation.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-gray-400">
            Every unit of capital on this platform travels the same disciplined path.
            No exceptions, no discretionary detours.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#1E2433] bg-[#1E2433] md:grid-cols-3">
          {DOCTRINE_STEPS.map((step) => (
            <div key={step.numeral} className="group bg-[#0C0F16] p-9 transition-colors duration-500 hover:bg-[#111520] sm:p-11">
              <div className="font-display text-4xl italic tracking-tight text-[#EF4444]/85">{step.numeral}</div>
              <h3 className="mt-6 font-display text-2xl font-medium tracking-tight text-white">{step.title}</h3>
              <p className="mt-4 text-[13px] leading-relaxed text-gray-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 4b. LIVE MARKET CANVAS ═══════════════ */}
      <section className="border-t border-[#1E2433] bg-[#080A0F]">
        <div className="mx-auto max-w-7xl px-6 py-28 sm:px-12 sm:py-36">
          {EYEBROW('Live Market Canvas')}
          <div className="mt-7 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-xl font-display text-4xl font-medium leading-[1.06] tracking-tight text-white sm:text-5xl">
              The market never blinks. Neither does your terminal.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-gray-400">
              Live instruments streamed directly into the page — the same feeds your
              allocation desk watches while settlement runs.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-7 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-[#1E2433] bg-[#0C0F16] shadow-tesla">
              <div className="flex items-center justify-between border-b border-[#1E2433] px-6 py-4">
                <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.22em] text-gray-400">Flagship Instrument</span>
                <span className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live
                </span>
              </div>
              <TradingViewSymbolOverview height={420} />
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#1E2433] bg-[#0C0F16] shadow-tesla">
              <div className="flex items-center justify-between border-b border-[#1E2433] px-6 py-4">
                <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.22em] text-gray-400">Sector Heatmap</span>
                <span className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live
                </span>
              </div>
              <TradingViewMarketOverview height={420} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 5. TERM SHEETS ═══════════════ */}
      <section id="portfolios" className="border-t border-[#1E2433] bg-[#0A0D14]">
        <div className="mx-auto max-w-7xl px-6 py-28 sm:px-12 sm:py-36">
          {EYEBROW('Structured Allocations')}
          <div className="mt-7 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-2xl font-display text-4xl font-medium leading-[1.06] tracking-tight text-white sm:text-5xl">
              Three term sheets. Rates locked at allocation.
            </h2>
            <a href="/plans" className="group inline-flex items-center gap-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-300 transition-colors hover:text-white">
              Full plan documentation
              <svg className="h-[14px] w-[14px] transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {INVESTMENT_PLANS_CONFIG.map((plan) => (
              <PlanCard
                key={plan.planId}
                id={plan.planId}
                planId={plan.planId}
                name={plan.name}
                description={plan.description}
                minDepositUsd={plan.minDepositUsd}
                maxDepositUsd={plan.maxDepositUsd}
                termDays={plan.termDays}
                annualPercentageRate={plan.annualPercentageRate}
                requiresKycTier={plan.requiresKycTier}
                dailyRateNumeric={plan.dailyRateNumeric}
                compoundingAllowed={plan.compoundingAllowed}
                payoutPolicy={plan.payoutPolicy}
                imageUrl={plan.imageUrl}
                features={plan.features}
              />
            ))}
          </div>

          <p className="mt-10 max-w-3xl font-mono text-[9px] font-bold uppercase leading-relaxed tracking-[0.18em] text-gray-600">
            Rates reflect plan term sheets, not guarantees of market outcomes. Allocations are
            term-locked; early exit is not available. Capital is at risk for the duration of the term.
          </p>
        </div>
      </section>

      {/* ═══════════════ 6. SKYLINE STATEMENT BAND ═══════════════ */}
      <section className="relative overflow-hidden border-y border-[#1E2433]">
        <div className="relative h-[420px] w-full sm:h-[480px]">
          <ManagedImage
            slotKey="home.band"
            alt="City skyline at night"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#080A0F]/72" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080A0F]/90 via-transparent to-[#080A0F]/90" />
        </div>
        <div className="absolute inset-0 z-10 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 text-center sm:px-12">
          <p className="font-display text-[26px] font-medium italic leading-snug tracking-tight text-white sm:text-4xl">
            “Wealth is not the speed of the trade.
            <br className="hidden sm:block" /> It is the certainty of the settlement.”
          </p>
          <span className="mt-8 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[#EF4444]">
            The TeslaPrime Doctrine
          </span>
        </div>
      </section>

      {/* ═══════════════ 7. INSIDE THE TERMINAL ═══════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-28 sm:px-12 sm:py-36">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="relative order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-2xl border border-[#1E2433] shadow-tesla">
              <div className="relative h-[340px] w-full sm:h-[420px]">
                <ManagedImage
                  slotKey="home.command"
                  alt="Analyst command desk with market monitors"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080A0F]/70 via-transparent to-transparent" />
              </div>
            </div>
            <div className="absolute -bottom-5 -right-3 hidden rounded-xl border border-[#1E2433] bg-[#0C0F16] px-6 py-5 shadow-tesla sm:block">
              <div className="font-display text-2xl tracking-tight text-white">00:00 UTC</div>
              <div className="mt-1 font-mono text-[8.5px] font-bold uppercase tracking-[0.2em] text-gray-500">
                The accrual engine never sleeps in
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            {EYEBROW('Inside the Terminal')}
            <h2 className="mt-7 font-display text-4xl font-medium leading-[1.06] tracking-tight text-white sm:text-5xl">
              Your capital, under glass — not behind a curtain.
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-gray-400">
              Most platforms show you a balance and a smile. The TeslaPrime terminal shows
              you the machinery: what moved, when it moved, who signed it, and why.
            </p>

            <div className="mt-10 space-y-7">
              {TERMINAL_FEATURES.map((feature, i) => (
                <div key={feature.title} className="flex gap-5">
                  <span className="font-display text-xl italic text-[#EF4444]/80">{String(i + 1).padStart(2, '0')}</span>
                  <div className="border-l border-[#1E2433] pl-5">
                    <h3 className="text-[14px] font-semibold tracking-tight text-white">{feature.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-gray-400">{feature.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 7b. LEADERSHIP — the chair ═══════════════ */}
      <LeadershipSection />

      {/* ═══════════════ 8. FROM THE DESK — insights preview ═══════════════ */}
      <section className="border-t border-[#1E2433] bg-[#0A0D14]">
        <div className="mx-auto max-w-7xl px-6 py-28 sm:px-12 sm:py-36">
          {EYEBROW('From the Desk')}
          <div className="mt-7 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-xl font-display text-4xl font-medium leading-[1.06] tracking-tight text-white sm:text-5xl">
              Engineering notes, not marketing noise.
            </h2>
            <a href="/insights" className="group inline-flex items-center gap-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-300 transition-colors hover:text-white">
              All briefings
              <svg className="h-[14px] w-[14px] transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-7 md:grid-cols-3">
            {previewArticles.map((article) => (
              <a
                key={article.slug}
                href={`/insights/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#1E2433] bg-[#111520] transition-all duration-500 hover:-translate-y-1 hover:border-[#EF4444]/40"
              >
                <div className="relative h-44 w-full overflow-hidden bg-black">
                  <ManagedImage
                    slotKey={`insights.${article.slug}`}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center opacity-90 transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center justify-between font-mono text-[8.5px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    <span className="text-[#EF4444]">{article.category}</span>
                    <span>{article.readingMinutes} min read</span>
                  </div>
                  <h3 className="mt-4 font-display text-[20px] font-medium leading-snug tracking-tight text-white transition-colors group-hover:text-[#EF4444]">
                    {article.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[12px] leading-relaxed text-gray-400">{article.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 9. FINAL CALL ═══════════════ */}
      <section className="relative overflow-hidden border-t border-[#1E2433]">
        <div className="absolute inset-0 opacity-[0.5]">
          <ManagedImage slotKey="brand.backdrop" alt="" fill sizes="100vw" className="object-cover object-center" />
        </div>
        <div className="absolute inset-0 bg-[#080A0F]/82" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center sm:px-12 sm:py-36">
          {EYEBROW('Terminal Access')}
          <h2 className="mt-7 font-display text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl">
            The ledger is open.
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-gray-300">
            Registration takes minutes. Tier 0 requires no documents. Your first
            allocation can be settling at 00:00&nbsp;UTC tonight.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="/register" className="w-full sm:w-auto">
              <button
                type="button"
                className="h-12 w-full rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] px-12 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_35px_rgba(239,68,68,0.65)] active:translate-y-0 sm:w-auto"
              >
                Open Your Terminal
              </button>
            </a>
            <a
              href="/how-to-invest"
              className="flex h-12 w-full items-center justify-center rounded-lg border border-[#2C354C] px-12 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-gray-200 transition-all duration-300 hover:border-gray-400 hover:text-white sm:w-auto"
            >
              Read the Process
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
