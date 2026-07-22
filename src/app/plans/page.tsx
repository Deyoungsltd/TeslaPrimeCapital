import React from 'react';
import type { Metadata } from 'next';
import { INVESTMENT_PLANS_CONFIG } from '@/config/plans.config';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: 'Investment Plans — TeslaPrimeCapital',
  description: 'Four term-defined structured allocation pools with daily compounding and lump-sum maturity settlement.',
};

const MATURITY_STEPS = [
  { phase: 'Day 0', title: 'Capital locks', body: 'Your allocation moves from the available wallet into the plan. From this moment the position is term-locked — no early exit.' },
  { phase: 'Daily', title: 'Yield accrues', body: 'At 00:00 UTC every day the accrual engine compounds your position and records the precise yield line-by-line in the accrual log.' },
  { phase: 'Maturity', title: 'Lump-sum settlement', body: 'On the final day, principal plus the full compounded yield credits your available wallet in a single settlement.' },
];

export default function InvestmentPlansPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#EF4444] selection:text-white">
      <MarketingHeader activePath="/plans" />

      <main>
        {/* Header band */}
        <section className="mx-auto max-w-7xl px-6 sm:px-12 pt-20 pb-14 space-y-4 max-w-none">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#EF4444]" />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
              Structured Allocations
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-3xl">
            Four pools. Fixed terms. Settled to the decimal.
          </h1>
          <p className="max-w-2xl text-sm text-gray-400 leading-relaxed">
            Every plan below states its minimum and maximum allocation, its exact term in days, the verification tier required, and whether compounding applies. All settlements follow the Lump-Sum Maturity Policy — yield never dribbles out early, it compounds until maturity day.
          </p>
        </section>

        {/* Plan detail cards */}
        <section className="mx-auto max-w-7xl px-6 sm:px-12 pb-24 grid grid-cols-1 md:grid-cols-2 gap-8">
          {INVESTMENT_PLANS_CONFIG.map((plan) => (
            <article
              key={plan.planId}
              className="rounded-2xl border border-[#1E2433] bg-[#111520] shadow-tesla overflow-hidden flex flex-col group"
            >
              <div className="relative h-56 w-full overflow-hidden bg-black">
                <img
                  src={plan.imageUrl || '/branding/car-bronze.jpg'}
                  alt={plan.name}
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-transparent to-transparent" />
                <div className="absolute top-4 left-4 rounded-md border border-white/15 bg-black/80 px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-red-400 backdrop-blur-md">
                  {plan.profitText}
                </div>
                <div className="absolute top-4 right-4 rounded-md border border-white/15 bg-black/80 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-gray-300 backdrop-blur-md">
                  {plan.requiresKycTier.replace('TIER_', 'Tier ')}
                </div>
              </div>

              <div className="p-7 sm:p-8 flex-1 flex flex-col gap-7">
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">{plan.name}</h2>
                  <p className="text-xs text-gray-400 leading-relaxed">{plan.description}</p>
                </div>

                {/* Mechanics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl overflow-hidden border border-[#1E2433] bg-[#1E2433]">
                  {[
                    { label: 'Min Allocation', value: `$${parseFloat(plan.minDepositUsd).toLocaleString()}` },
                    { label: 'Max Allocation', value: `$${parseFloat(plan.maxDepositUsd).toLocaleString()}` },
                    { label: 'Term', value: `${plan.termDays} Days` },
                    { label: 'Daily Rate', value: `${(parseFloat(plan.dailyRateNumeric) * 100).toFixed(2)}%` },
                  ].map((cell) => (
                    <div key={cell.label} className="bg-[#0A0D14] px-4 py-4">
                      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">{cell.label}</div>
                      <div className="mt-1.5 font-mono text-sm font-extrabold text-white">{cell.value}</div>
                    </div>
                  ))}
                </div>

                {/* Policy chips */}
                <div className="flex flex-wrap gap-2.5">
                  <span className="rounded-md border border-[#2C354C] bg-[#0A0D14] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gray-300">
                    Lump-Sum Maturity
                  </span>
                  <span className={`rounded-md border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider ${plan.compoundingAllowed ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-[#2C354C] bg-[#0A0D14] text-gray-400'}`}>
                    {plan.compoundingAllowed ? 'Compounding Enabled' : 'Simple Accrual'}
                  </span>
                  <span className="rounded-md border border-[#2C354C] bg-[#0A0D14] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {plan.requiresKycTier.replace('TIER_', 'Tier ')} Required
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-3 text-xs text-gray-300">
                  {(plan.features ?? []).map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="font-semibold">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 mt-auto">
                  <a href={`/register?planId=${plan.planId}`} className="block">
                    <button className="w-full h-12 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] hover:-translate-y-0.5 active:translate-y-0">
                      Allocate to {plan.name.split(' ')[0]}
                    </button>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Maturity mechanics timeline */}
        <section className="border-t border-[#1E2433] bg-[#0A0D14]">
          <div className="mx-auto max-w-7xl px-6 sm:px-12 py-20">
            <div className="mb-12 space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-[#EF4444]" />
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
                  Settlement Mechanics
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How every allocation settles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {MATURITY_STEPS.map((step) => (
                <div key={step.phase} className="border-t-2 border-[#1E2433] pt-8 hover:border-[#EF4444] transition-colors duration-300">
                  <span className="font-mono text-xs font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">{step.phase}</span>
                  <h3 className="mt-4 text-lg font-extrabold tracking-tight text-white">{step.title}</h3>
                  <p className="mt-3 text-xs text-gray-400 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-14 flex flex-col sm:flex-row items-center gap-4">
              <a href="/how-to-invest">
                <button className="w-full sm:w-[240px] h-12 rounded-lg border border-white/15 bg-white/5 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5">
                  Read the Full Guide
                </button>
              </a>
              <a href="/register">
                <button className="w-full sm:w-[240px] h-12 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] hover:-translate-y-0.5">
                  Open an Account
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
