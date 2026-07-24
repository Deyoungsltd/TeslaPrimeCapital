import React from 'react';
import type { Metadata } from 'next';
import { buildMarketingMetadata } from '@/lib/seo';
import { INVESTMENT_PLANS_CONFIG } from '@/config/plans.config';
import { PlanCard } from '@/components/molecules/PlanCard';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';
import { BreadcrumbJsonLd } from '@/components/atoms/BreadcrumbJsonLd';

export const metadata: Metadata = buildMarketingMetadata(
  'Investment Plans',
  'Three term-defined structured allocation pools with daily 00:00 UTC accrual and lump-sum maturity settlement.',
  '/plans',
);

const MATURITY_STEPS = [
  { phase: 'Day 0', title: 'Capital locks', body: 'Your allocation moves from the available wallet into the plan position. From this moment it is term-locked — no early exit, by design.' },
  { phase: 'Daily · 00:00 UTC', title: 'Yield accrues', body: 'The settlement engine posts the daily rate line-by-line to your accrual log. On compounding plans, each day’s yield joins the principal base.' },
  { phase: 'Maturity', title: 'Lump-sum settlement', body: 'On the final day, principal plus the full accrued yield credits your available wallet in a single settlement event — nothing dribbles out early.' },
];

export default function InvestmentPlansPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#EF4444] selection:text-white">
      <MarketingHeader activePath="/plans" />
      <BreadcrumbJsonLd items={[{ name: 'Home', path: '/' }, { name: 'Investment Plans', path: '/plans' }]} />

      <main>
        {/* Statement band */}
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-24 sm:px-12">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#EF4444]" />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
              Structured Allocations
            </span>
          </div>
          <h1 className="mt-7 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl">
            Three pools. Fixed terms. Settled to the decimal.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-gray-400">
            Every plan below states its exact allocation window, its term in days, the daily
            rate frozen at allocation, and the verification tier required. All settlements
            follow the Lump-Sum Maturity Policy — yield compounds inside the position until
            maturity day, never before.
          </p>
        </section>

        {/* Term sheets */}
        <section className="mx-auto max-w-7xl px-6 pb-10 sm:px-12">
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
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
        </section>

        {/* Settlement cadence */}
        <section className="border-t border-[#1E2433] bg-[#0A0D14]">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:px-12">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#EF4444]" />
              <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
                The Settlement Cadence
              </span>
            </div>
            <h2 className="mt-6 max-w-2xl font-display text-3xl font-medium leading-[1.08] tracking-tight text-white sm:text-4xl">
              One position. One schedule. One settlement.
            </h2>

            <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#1E2433] bg-[#1E2433] md:grid-cols-3">
              {MATURITY_STEPS.map((step) => (
                <div key={step.phase} className="bg-[#0C0F16] p-9 transition-colors duration-500 hover:bg-[#111520]">
                  <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#EF4444]">{step.phase}</span>
                  <h3 className="mt-4 font-display text-xl font-medium tracking-tight text-white">{step.title}</h3>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-gray-400">{step.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a href="/register">
                <button
                  type="button"
                  className="h-12 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] px-10 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_35px_rgba(239,68,68,0.65)] active:translate-y-0"
                >
                  Open Your Terminal
                </button>
              </a>
              <a href="/faq" className="font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-white">
                Questions? Read the FAQ
              </a>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
