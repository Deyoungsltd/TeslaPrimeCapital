import { SafeImage } from '@/components/atoms/SafeImage';
import React from 'react';
import { APP_CONFIG } from '@/config/app.config';
import { INVESTMENT_PLANS_CONFIG } from '@/config/plans.config';
import { HeroSwiper } from '@/components/organisms/HeroSwiper';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';
import { TradingViewTickerTape } from '@/components/organisms/tradingview/TradingViewTickerTape';
import { TradingViewSymbolOverview } from '@/components/organisms/tradingview/TradingViewSymbolOverview';
import { TradingViewMarketOverview } from '@/components/organisms/tradingview/TradingViewMarketOverview';

const SVG_CHECK = (
  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#EF4444] selection:text-white">

      {/* ================= 1. Institutional Header ================= */}
      <MarketingHeader activePath="/" />

      {/* ================= 2. Allocation Showcase Carousel ================= */}
      <HeroSwiper />

      {/* ================= 3. Live Quote Rail ================= */}
      <div className="border-b border-[#1E2433] bg-[#0A0D14]">
        <TradingViewTickerTape />
      </div>

      {/* ================= 4. Platform Standards Band ================= */}
      <section className="border-b border-[#1E2433] bg-[#080A0F]">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 grid grid-cols-2 lg:grid-cols-4">
          {[
            { value: '08', label: 'Supported Settlement Currencies' },
            { value: '5 · 2 · 1%', label: 'Three-Tier Affiliate Commissions' },
            { value: 'AES-256', label: 'GCM Session & Key Encryption' },
            { value: '00:00 UTC', label: 'Daily Accrual Engine Execution' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`py-10 px-2 sm:px-6 text-center ${i !== 0 ? 'border-l border-[#1E2433]' : ''} ${i >= 2 ? 'border-t lg:border-t-0 border-[#1E2433]' : ''}`}
            >
              <div className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {stat.value}
              </div>
              <div className="mt-2 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 leading-relaxed">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 5. Structured Allocation Plans ================= */}
      <section id="portfolios" className="mx-auto max-w-7xl px-6 sm:px-12 py-24">
        <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#EF4444]" />
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
                01 — Structured Allocations
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Investment Plans
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
              Four term-defined capital pools. Daily compounding accrues off-ledger and settles — principal plus yield — in a single lump sum at maturity.
            </p>
          </div>
          <span className="hidden md:block font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600">
            Lump-Sum Maturity Policy
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {INVESTMENT_PLANS_CONFIG.map((plan) => {
            const minStr = parseFloat(plan.minDepositUsd).toLocaleString();
            const profitLabel = plan.profitText || `${plan.termDays} Days Term`;
            const featList = plan.features && plan.features.length > 0 ? plan.features : ['Portfolio Access', 'Investment Dashboard', 'Email Support'];

            return (
              <div
                key={plan.planId}
                className="flex flex-col justify-between rounded-2xl border border-[#1E2433] bg-[#111520] shadow-tesla transition-all duration-300 hover:border-red-500/50 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] group overflow-hidden"
              >
                {/* Vehicle Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-black">
                  <SafeImage
                    src={plan.imageUrl || '/branding/car-bronze.jpg'}
                    alt={plan.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 288px"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-[#111520]/30 to-transparent" />
                  <span className="absolute top-3 right-3 rounded-md border border-white/15 bg-black/80 px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-red-400 backdrop-blur-md">
                    {profitLabel}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-extrabold tracking-tight text-white font-sans group-hover:text-[#EF4444] transition-colors">
                        {plan.name}
                      </h3>
                      <span className="flex-shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 pt-1.5">
                        {plan.termDays}D Term
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#1E2433]/80">
                    <div className="text-2xl font-extrabold text-white tracking-tight font-sans">
                      ${minStr}
                    </div>
                    <span className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mt-1">
                      Minimum Allocation
                    </span>
                  </div>

                  <div className="space-y-3 pt-1 text-xs text-gray-300">
                    {featList.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                          {SVG_CHECK}
                        </span>
                        <span className="font-semibold">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <a href={`/register?planId=${plan.planId}`} className="block w-full">
                      <button className="w-full h-11 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] hover:-translate-y-0.5 active:translate-y-0">
                        Allocate Capital
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 5b. Settlement Rails Band ================= */}
      <section className="border-t border-[#1E2433] bg-[#080A0F]">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-2 max-w-md">
            <h3 className="text-lg font-extrabold tracking-tight text-white">Settlement rails</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Fund and settle in any of eight supported currencies — four fiat, four digital — under one normalized fixed-point account structure.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {APP_CONFIG.supportedCurrencies.map((currency) => (
              <span
                key={currency.code}
                className="flex items-center gap-2.5 rounded-lg border border-[#1E2433] bg-[#111520] px-4 py-2.5 font-mono text-[11px] font-extrabold tracking-[0.15em] text-gray-200 transition hover:border-white/30 hover:text-white"
              >
                <span className="text-[#EF4444]">{currency.symbol}</span>
                {currency.code}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 6. Live Market Context ================= */}
      <section id="markets" className="border-t border-[#1E2433] bg-[#0A0D14]">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 py-24">
          <div className="mb-14 space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#EF4444]" />
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
                02 — Live Market Context
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Execution context, in real time
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Institutional-grade market telemetry streamed directly into the platform. Track the reference asset behind every allocation pool before you commit capital.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-5 sm:p-6 shadow-tesla space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2433] pb-4">
                <h3 className="font-mono text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-300">Stock — Tesla, Inc.</h3>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <TradingViewSymbolOverview height={380} />
            </div>
            <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-5 sm:p-6 shadow-tesla space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2433] pb-4">
                <h3 className="font-mono text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-300">Market Overview — 12M Range</h3>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <TradingViewMarketOverview height={380} />
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6b. The Firm — About ================= */}
      <section className="mx-auto max-w-7xl px-6 sm:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#EF4444]" />
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
                03 — The Firm
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.05]">
              A capital engine, not a casino
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              TeslaPrimeCapital was built by engineers, not marketers. The platform behaves like a clearing house: every wallet posts double-entry ledgers at eight-decimal precision, every release passes human compliance review, and every plan settles on a fixed maturity date — never a moment early, never a moment late.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              There is no discretionary trading desk gambling with client funds. Yield is computed by a deterministic accrual engine that runs at 00:00 UTC daily, recorded line-by-line in an immutable audit trail you can inspect from your terminal at any time.
            </p>
            <div className="space-y-3 pt-2">
              {[
                'Double-entry books on every capital movement',
                'Human approval on every withdrawal release',
                'Maturity-dated settlement on every structured plan',
              ].map((fact) => (
                <div key={fact} className="flex items-center gap-3 text-xs font-semibold text-gray-300">
                  <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {fact}
                </div>
              ))}
            </div>
            <div className="pt-4">
              <a href="/plans" className="inline-block">
                <button
                  type="button"
                  className="h-11 px-8 rounded-lg border border-white/15 bg-white/5 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5"
                >
                  Inspect the Plans
                </button>
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[3/2] rounded-2xl border border-[#1E2433] bg-black overflow-hidden shadow-tesla">
              <SafeImage
                src="/branding/boardroom.jpg"
                alt="TeslaPrimeCapital operations floor"
                fill
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-cover opacity-95"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 sm:-left-8 rounded-xl border border-[#1E2433] bg-[#0A0D14] px-6 py-5 shadow-tesla">
              <div className="font-mono text-2xl font-extrabold text-white">20.8</div>
              <div className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                Decimal Ledger Precision
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 7. Platform Integrity Pillars ================= */}
      <section className="mx-auto max-w-7xl px-6 sm:px-12 py-24">
        <div className="mb-14 space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#EF4444]" />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
                04 — Platform Integrity
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Engineered like a clearing house
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Every subsystem is built to an audit standard — deterministic ledgers, human custody over releases, and settlement logic that cannot drift.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Double-Entry Ledgers',
              copy: 'Every capital movement posts paired NUMERIC(20,8) entries. Wallet balances reconcile to the eighth decimal — always.',
              icon: (
                <path d="M4 5h16M4 5v14h16V5M4 5l4-2m8 2l4 2M9 9h6M9 13h6" strokeLinecap="round" strokeLinejoin="round" />
              ),
            },
            {
              title: 'Manual Withdrawal Custody',
              copy: 'Withdrawals lock funds instantly and enter compliance review. Release requires finance-manager approval with TOTP attestation.',
              icon: (
                <path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4zm-2 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              ),
            },
            {
              title: 'Lump-Sum Maturity Engine',
              copy: 'Yield compounds daily off-ledger inside AccrualLog, then settles principal plus yield to your available wallet at term end.',
              icon: (
                <path d="M4 19h16M6 16l4-5 3 3 5-7M15 7h3v3" strokeLinecap="round" strokeLinejoin="round" />
              ),
            },
            {
              title: 'Global Currency Rails',
              copy: 'Eight fiat and digital currencies operate under one normalized account structure with fixed-point precision.',
              icon: (
                <path d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5-2.2 3.5-5.3 3.5-9S14.5 5.2 12 3m0 18c-2.5-2.2-3.5-5.3-3.5-9S9.5 5.2 12 3M3.5 9h17M3.5 15h17" strokeLinecap="round" strokeLinejoin="round" />
              ),
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-[#1E2433] bg-[#111520] p-7 transition-all duration-300 hover:border-white/25 hover:bg-[#131826] group"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#2C354C] bg-[#0A0D14] text-gray-300 transition-colors group-hover:border-red-500/50 group-hover:text-[#EF4444]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {pillar.icon}
                </svg>
              </div>
              <h3 className="mt-6 text-base font-extrabold tracking-tight text-white">{pillar.title}</h3>
              <p className="mt-3 text-xs text-gray-400 leading-relaxed">{pillar.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 8. Deployment Sequence ================= */}
      <section id="process" className="border-t border-[#1E2433] bg-[#0A0D14]">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 py-24">
          <div className="mb-14 space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#EF4444]" />
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
                05 — Deployment Sequence
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Capital in three movements
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                step: '01',
                title: 'Open your account',
                copy: 'Register in minutes and verify by one-time passcode. Tier-0 clearance permits allocations up to $1,000 before identity review.',
              },
              {
                step: '02',
                title: 'Allocate to a plan',
                copy: 'Choose a term pool and fund your wallet in any of eight supported currencies. Capital locks into the accrual engine at allocation.',
              },
              {
                step: '03',
                title: 'Settle at maturity',
                copy: 'At 00:00 UTC on maturity day, principal plus compounded yield credits your available wallet in a single lump-sum settlement.',
              },
            ].map((item) => (
              <div key={item.step} className="border-t-2 border-[#1E2433] pt-8 group hover:border-[#EF4444] transition-colors duration-300">
                <span className="font-mono text-5xl font-extrabold text-[#1E2433] group-hover:text-[#EF4444]/40 transition-colors duration-300">
                  {item.step}
                </span>
                <h3 className="mt-5 text-lg font-extrabold tracking-tight text-white">{item.title}</h3>
                <p className="mt-3 text-xs text-gray-400 leading-relaxed">{item.copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col sm:flex-row items-center gap-4">
            <a href="/register" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-[240px] h-12 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Open an Account
              </button>
            </a>
            <a href="/plans" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-[200px] h-12 rounded-lg border border-white/15 bg-white/5 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Review Plans
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ================= 9. Current Offers & Inventory ================= */}
      <section className="mx-auto max-w-7xl px-6 sm:px-12 py-24 space-y-6">
        <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-8 sm:p-12 shadow-tesla flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-xl">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-gray-500">Limited Windows</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Current Offers</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Explore limited-time offers on Tesla vehicles paired with structured high-yield capital allocations.
            </p>
            <div className="pt-2">
              <a href="/register?offer=limited">
                <button className="h-11 px-8 rounded-lg bg-white font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-black transition hover:bg-gray-200">
                  Learn More
                </button>
              </a>
            </div>
          </div>
          <div className="relative w-full md:w-1/2 h-56 rounded-xl overflow-hidden border border-[#1E2433] bg-black">
            <SafeImage src="/branding/car-silver.jpg" alt="Current Offers" fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-8 sm:p-12 shadow-tesla flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-xl">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-gray-500">Delivery Ready</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Inventory</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Find vehicles available for immediate delivery and instant portfolio settlement.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="/register?inventory=new">
                <button className="h-11 px-8 rounded-lg bg-white font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-black transition hover:bg-gray-200">
                  New
                </button>
              </a>
              <a href="/register?inventory=preowned">
                <button className="h-11 px-8 rounded-lg border border-white/20 bg-white/5 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition hover:bg-white/10 hover:border-white/40">
                  Pre-Owned
                </button>
              </a>
            </div>
          </div>
          <div className="relative w-full md:w-1/2 h-56 rounded-xl overflow-hidden border border-[#1E2433] bg-black">
            <SafeImage src="/branding/car-gold.jpg" alt="Inventory" fill sizes="(max-width: 768px) 100vw, 560px" className="object-cover" />
          </div>
        </div>
      </section>

      {/* ================= 9b. Affiliate Program Band ================= */}
      <section className="mx-auto max-w-7xl px-6 sm:px-12 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-[#1E2433] bg-[#111520] p-8 sm:p-14 shadow-tesla">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A0A0C]/80 via-transparent to-transparent" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="space-y-4 max-w-2xl">
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
                Affiliate Program
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Capital compounds faster with conviction behind it
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Earn 5% on direct partners, 2% on their network, and 1% on the third tier. Commissions vest the moment referred capital allocates into a structured plan — credited to your wallet automatically.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 flex-shrink-0">
              <a href="/register" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-[220px] h-12 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  Start Earning
                </button>
              </a>
              <a href="/dashboard/referrals" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-[220px] h-12 rounded-lg border border-white/15 bg-white/5 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Program Details
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 10. Intelligence / FAQ ================= */}
      <section id="faq" className="border-t border-[#1E2433] bg-[#0A0D14]">
        <div className="mx-auto max-w-4xl px-6 sm:px-12 py-24">
          <div className="mb-14 space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#EF4444]" />
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
                06 — Intelligence
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Answers, before you ask
            </h2>
          </div>

          <div className="divide-y divide-[#1E2433] border-y border-[#1E2433]">
            {[
              {
                q: 'When is my capital settled?',
                a: 'Under the Lump-Sum Maturity Policy, daily compounding yield accrues off-ledger for the life of the plan. At 00:00 UTC on maturity day, your principal plus the full compounded yield is credited to your available wallet in one settlement.',
              },
              {
                q: 'Can I allocate before completing identity verification?',
                a: 'Yes. Tier-0 clearance is granted automatically at registration and permits cumulative allocations up to $1,000 USD equivalent. Tier-1 verification — government ID and selfie — is required before any withdrawal and before deposits beyond the ceiling.',
              },
              {
                q: 'How are withdrawals processed?',
                a: 'Every withdrawal locks your funds instantly and enters a pending-review queue. A finance manager then authorizes release with two-factor TOTP attestation. There is no automated gateway disbursement — custody stays human.',
              },
              {
                q: 'How does the referral program pay?',
                a: 'Three tiers: 5% on direct partners, 2% on their partners, and 1% on the third level. Commissions vest only when referred capital allocates into a structured plan — never on sign-ups alone.',
              },
            ].map((item) => (
              <details key={item.q} className="group py-6 px-1 cursor-pointer">
                <summary className="flex items-center justify-between gap-6 list-none">
                  <span className="text-sm sm:text-base font-bold text-white group-hover:text-[#EF4444] transition-colors">
                    {item.q}
                  </span>
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[#2C354C] text-gray-400 transition-transform duration-300 group-open:rotate-45">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 pr-10 text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 11. Conviction CTA Band ================= */}
      <section className="relative overflow-hidden border-t border-[#1E2433]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A0A0C] via-[#080A0F] to-[#080A0F]" />
        <div className="relative mx-auto max-w-7xl px-6 sm:px-12 py-24 text-center space-y-8">
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.35em] text-[#EF4444]">
            TeslaPrimeCapital
          </span>
          <h2 className="mx-auto max-w-3xl text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
            Capital deserves conviction.
          </h2>
          <p className="mx-auto max-w-xl text-sm text-gray-400 leading-relaxed">
            Open your account, fund any of eight currencies, and let the accrual engine do the arithmetic.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a href="/register" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-[240px] h-12 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.45)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(239,68,68,0.75)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Create Account
              </button>
            </a>
            <a href="/login" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-[200px] h-12 rounded-lg border border-white/20 bg-white/5 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign In
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ================= 12. Institutional Footer ================= */}
      <MarketingFooter />

    </div>
  );
}
