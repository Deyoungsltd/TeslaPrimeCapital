import React from 'react';
import { APP_CONFIG } from '@/config/app.config';
import { INVESTMENT_PLANS_CONFIG } from '@/config/plans.config';

export default function LandingPage() {
  return (
    <main className="flex flex-col flex-grow items-center justify-center px-4 py-16 text-center lg:py-24">
      {/* Brand Header & Tagline */}
      <div className="max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-gold shadow-sm">
          <span>Institutional Architecture (`v0.3.0-alpha`)</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
          {APP_CONFIG.platformName}
        </h1>
        <p className="mx-auto max-w-2xl text-lg font-normal text-gray-400 sm:text-xl">
          {APP_CONFIG.tagline}. Precision multi-currency ledgers (`USD`, `EUR`, `BTC`, `ETH`), verified compliance, and algorithmic structured allocations.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <a
            href="/register"
            className="w-full sm:w-auto rounded-md bg-brand-gold px-8 py-3.5 text-sm font-bold tracking-wide text-black shadow-lg transition-all hover:bg-brand-goldHover focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 focus:ring-offset-brand-dark"
          >
            Create Institutional Account
          </a>
          <a
            href="/login"
            className="w-full sm:w-auto rounded-md border border-gray-700 bg-brand-card px-8 py-3.5 text-sm font-semibold tracking-wide text-gray-200 shadow-sm transition-all hover:border-gray-500 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-brand-dark"
          >
            Access Terminal Login
          </a>
        </div>
      </div>

      {/* Plan Showcase Grid */}
      <section className="mt-20 w-full max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-200 sm:text-3xl">
            Structured Investment Portfolios
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            All plans enforce our approved policy: **Lump Sum at Plan Maturity**. Zero daily wallet disruption, exact compound maturity execution.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {INVESTMENT_PLANS_CONFIG.map((plan) => (
            <div
              key={plan.planId}
              className="flex flex-col justify-between rounded-xl border border-brand-border bg-brand-card p-6 shadow-xl transition-transform hover:-translate-y-1 hover:border-brand-gold/50"
            >
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                    {plan.requiresKycTier === 'TIER_0' ? 'No KYC Required (<$1k)' : `Verified ${plan.requiresKycTier}`}
                  </span>
                  <span className="rounded-md bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-300">
                    {plan.termDays} Days Term
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{plan.description}</p>
              </div>

              <div className="mt-8 border-t border-gray-800 pt-6 text-left space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-medium text-gray-400">Projected APR</span>
                  <span className="text-2xl font-extrabold text-brand-gold">{plan.annualPercentageRate}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Min Allocation:</span>
                  <span className="font-semibold text-gray-200">${plan.minDepositUsd} USD</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Max Allocation:</span>
                  <span className="font-semibold text-gray-200">${plan.maxDepositUsd} USD</span>
                </div>
                <div className="pt-3">
                  <a
                    href="/register"
                    className="block w-full text-center rounded-md border border-brand-gold/40 bg-brand-gold/10 py-2 text-xs font-bold uppercase tracking-wider text-brand-gold transition hover:bg-brand-gold hover:text-black"
                  >
                    Allocate Capital
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="mt-24 border-t border-gray-800 pt-8 text-center text-xs text-gray-500 w-full max-w-4xl">
        <p>
          &copy; {new Date().getFullYear()} {APP_CONFIG.platformName}. All rights reserved. Enterprise multi-currency ledgers strictly utilize exact fixed-point mathematical verification (`NUMERIC(20,8)`).
        </p>
      </footer>
    </main>
  );
}
