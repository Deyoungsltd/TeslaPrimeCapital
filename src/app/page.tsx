import React from 'react';
import { APP_CONFIG } from '@/config/app.config';
import { INVESTMENT_PLANS_CONFIG } from '@/config/plans.config';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Sleek Tesla-Style Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#222226] bg-black/90 px-6 sm:px-12 backdrop-blur-md">
        <a href="/" className="flex items-center gap-3">
          <span className="text-xl font-extrabold tracking-tight text-white uppercase font-sans">
            {APP_CONFIG.platformName}
          </span>
          <span className="rounded border border-white/20 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white font-mono">
            v1.0 Institutional
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <a href="#portfolios" className="hover:text-white transition">Structured Portfolios</a>
          <a href="#ledgers" className="hover:text-white transition">Double-Entry Ledgers</a>
          <a href="#governance" className="hover:text-white transition">Compliance Gate</a>
          <a href="#architecture" className="hover:text-white transition">Specifications</a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="rounded-md border border-[#27272a] bg-[#18181b] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-200 transition hover:border-white hover:bg-[#222226]"
          >
            Terminal Login
          </a>
          <a
            href="/register"
            className="rounded-md bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-gray-200 shadow-sm"
          >
            Open Account
          </a>
        </div>
      </header>

      {/* Hero Showcase Section */}
      <main className="flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center sm:pt-32 sm:pb-28">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-300">
            <span>Algorithmic Yield &bull; Exact NUMERIC(20,8) Ledgers</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl md:text-8xl leading-none">
            PRECISION DIGITAL WEALTH.
          </h1>
          <p className="mx-auto max-w-2xl text-base font-normal text-gray-400 sm:text-lg leading-relaxed">
            {APP_CONFIG.tagline}. Engineered for absolute transparency, instantaneous multi-currency settlement (`USD`, `EUR`, `BTC`, `ETH`), and verified double-entry compounding.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 pt-4">
            <a
              href="/register"
              className="w-full sm:w-auto rounded-md bg-white px-9 py-4 text-sm font-bold uppercase tracking-wider text-black shadow-lg transition hover:bg-gray-200"
            >
              Initiate Capital Allocation &rarr;
            </a>
            <a
              href="/dashboard"
              className="w-full sm:w-auto rounded-md border border-[#27272a] bg-[#141416] px-9 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition hover:border-white hover:bg-[#18181b]"
            >
              Enter Live Terminal
            </a>
          </div>
        </div>

        {/* Feature Highlights Bar */}
        <div id="ledgers" className="mt-28 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-6xl w-full text-left font-mono">
          <div className="rounded-xl border border-[#26262b] bg-[#111113] p-6 shadow-tesla">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">Double-Entry Accounting</span>
            <h3 className="mt-2 text-lg font-bold text-white tracking-tight">Exact NUMERIC(20,8) Precision</h3>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed font-sans">Zero floating-point rounding drift. Every deposit, yield accrual, and conversion is bound by exact fixed-point mathematics (`DecimalUtil`).</p>
          </div>

          <div className="rounded-xl border border-[#26262b] bg-[#111113] p-6 shadow-tesla">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Concurrency Defense</span>
            <h3 className="mt-2 text-lg font-bold text-white tracking-tight">Redis Redlock Mutex Engine</h3>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed font-sans">Strict distributed locking (`lock:wallet:usr_{'{ID}'}`) eliminates race conditions and double-spend attempts across simultaneous requests.</p>
          </div>

          <div className="rounded-xl border border-[#26262b] bg-[#111113] p-6 shadow-tesla">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Executive Governance</span>
            <h3 className="mt-2 text-lg font-bold text-white tracking-tight">100% Mandatory Admin Review</h3>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed font-sans">Every withdrawal enters our `PENDING_REVIEW` queue. Release strictly requires Two-Factor (`TOTP`) confirmation from treasury officers.</p>
          </div>
        </div>

        {/* Structured Portfolios Showcase Grid */}
        <section id="portfolios" className="mt-32 w-full max-w-6xl text-left">
          <div className="mb-12 border-b border-[#222226] pb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-blue font-mono">Portfolio Catalog</span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Structured Investment Portfolios
              </h2>
            </div>
            <p className="text-xs text-gray-400 font-mono max-w-md">
              Enforcing approved policy: **Lump Sum at Plan Maturity**. Zero daily liquid balance disruption, exact compound execution.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {INVESTMENT_PLANS_CONFIG.map((plan) => (
              <div
                key={plan.planId}
                className="flex flex-col justify-between rounded-xl border border-[#26262b] bg-[#111113] p-7 shadow-tesla transition-all duration-200 hover:border-white/30 hover:bg-[#18181b]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono">
                    <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                      {plan.requiresKycTier === 'TIER_0' ? 'No KYC Required (<$1k)' : `Verified ${plan.requiresKycTier}`}
                    </span>
                    <span className="rounded-md bg-[#18181b] border border-[#27272a] px-2.5 py-1 text-xs font-semibold text-gray-300">
                      {plan.termDays} Days Term
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight">{plan.name}</h3>
                    <p className="mt-2 text-xs text-gray-400 leading-relaxed">{plan.description}</p>
                  </div>
                </div>

                <div className="mt-8 border-t border-[#222226] pt-6 space-y-4 font-mono">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Target APR</span>
                    <span className="text-3xl font-extrabold tracking-tight text-white">{plan.annualPercentageRate}</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-400 pt-1">
                    <div className="flex justify-between">
                      <span>Min Capital:</span>
                      <span className="font-semibold text-gray-200">${plan.minDepositUsd} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Capital:</span>
                      <span className="font-semibold text-gray-200">${plan.maxDepositUsd} USD</span>
                    </div>
                    <div className="flex justify-between text-brand-blue pt-2 border-t border-[#222226] font-semibold">
                      <span>Maturity Payout:</span>
                      <span>Lump Sum at Term End</span>
                    </div>
                  </div>
                  <div className="pt-3 font-sans">
                    <a
                      href="/register"
                      className="block w-full text-center rounded-md bg-brand-blue py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-brand-blueHover shadow-md"
                    >
                      Allocate Capital &rarr;
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Specification & Compliance Notice */}
        <footer id="architecture" className="mt-32 border-t border-[#222226] pt-10 text-center text-xs text-gray-500 w-full max-w-5xl font-mono leading-relaxed space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-6 uppercase tracking-wider text-gray-400 font-sans font-semibold">
            <a href="/login">Terminal Access</a>
            <span>&bull;</span>
            <a href="/register">Institutional Registration</a>
            <span>&bull;</span>
            <a href="/dashboard/investments">Compounding Simulator</a>
            <span>&bull;</span>
            <a href="/dashboard/kyc">AML Verification Gate</a>
          </div>
          <p>
            &copy; {new Date().getFullYear()} {APP_CONFIG.platformName}. All rights reserved. Self-hosted on Coolify / Docker. Exact double-entry accounting (`NUMERIC(20,8)`) and hybrid rotating session security (`15m JWT + 7d Redis Cookie`).
          </p>
        </footer>
      </main>
    </div>
  );
}
