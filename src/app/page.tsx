import React from 'react';
import { APP_CONFIG } from '@/config/app.config';
import { INVESTMENT_PLANS_CONFIG } from '@/config/plans.config';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D0A12] text-white font-sans selection:bg-[#EF4444] selection:text-white">
      {/* Top Header (`preview-tesla` / `IMG_7550` match) */}
      <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#2A2338] bg-[#0D0A12]/95 px-6 sm:px-12 backdrop-blur-md">
        <a href="/" className="flex items-center gap-3">
          <span className="rounded-lg bg-[#F59E0B] px-3 py-1 text-xs font-mono font-extrabold text-black shadow-amber-glow uppercase tracking-wider">
            LOGO
          </span>
          <span className="text-xl font-extrabold tracking-[0.25em] text-white uppercase font-sans">
            TeslaStock
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
          <a href="#portfolios" className="hover:text-white transition">Investment Plans</a>
          <a href="#ledgers" className="hover:text-white transition">Double-Entry Ledgers</a>
          <a href="#governance" className="hover:text-white transition">Compliance Gate</a>
        </nav>

        <div className="flex items-center gap-4 font-sans">
          <a
            href="/login"
            className="rounded-lg border border-[#2A2338] bg-[#16131F] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-200 transition hover:border-white hover:text-white shadow-sm"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="rounded-lg bg-[#EF4444] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#DC2626] shadow-red-glow"
          >
            Open Account
          </a>
        </div>
      </header>

      {/* Hero Section with Switch Platform bar (`preview-tesla` photo match!) */}
      <main className="flex flex-col items-center justify-center px-6 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
        
        {/* Banner Bar right below header (`preview-tesla` photo match!) */}
        <div className="w-full max-w-4xl mb-12 rounded-2xl border border-[#2A2338] bg-gradient-to-r from-[#1C1628] via-[#16131F] to-[#120E1A] p-4 sm:p-5 shadow-tesla flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <span className="text-xl">⚡</span>
            <p className="text-xs sm:text-sm font-semibold text-gray-200">
              You&apos;re in <strong className="text-white font-extrabold">TeslaStock</strong> — Tesla / EV Intelligence, a standalone Apex platform.
            </p>
          </div>
          <a href="/register">
            <button className="whitespace-nowrap rounded-lg bg-[#EF4444] px-5 py-2 text-xs font-extrabold tracking-wide text-white transition hover:bg-[#DC2626] shadow-red-glow">
              Switch platform &rarr;
            </button>
          </a>
        </div>

        {/* Hero Showcase Card (`Best Investment Plans for worldwide investors` Exact Photo Match!) */}
        <div className="w-full max-w-4xl rounded-3xl border border-[#2A2338] bg-gradient-to-br from-[#20162A] via-[#16131F] to-[#0E0B14] p-8 sm:p-12 shadow-tesla text-left space-y-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-tight font-sans">
              Best <span className="text-[#EF4444]">Investment Plans</span> <br />
              for worldwide investors
            </h1>
            <p className="max-w-2xl text-sm sm:text-base font-normal text-gray-300 leading-relaxed font-sans">
              A dedicated desk focused on Tesla Inc. and the electric-vehicle economy. We give members structured research and managed strategies built to help <strong className="text-white font-bold">reduce risk</strong> — not to promise returns.
            </p>
          </div>

          <div className="space-y-3.5 pt-2 font-sans text-sm text-gray-200 relative z-10">
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✔</span>
              <span className="font-semibold">Secure &amp; transparent investment system</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✔</span>
              <span className="font-semibold">Research-led, risk-aware strategies (no guaranteed profit)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✔</span>
              <span className="font-semibold">Ledger accounting — every balance change recorded (`NUMERIC(20,8)`)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">✔</span>
              <span className="font-semibold">Serving investors globally</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#2A2338] relative z-10">
            <div className="flex flex-wrap gap-4 font-sans">
              <a href="/register">
                <button className="rounded-xl bg-[#7F1D1D] border border-red-500/50 px-8 py-3.5 text-sm font-extrabold tracking-wide text-white transition hover:bg-[#EF4444] shadow-red-glow">
                  Get started
                </button>
              </a>
              <a href="#portfolios">
                <button className="rounded-xl border border-[#2A2338] bg-[#16131F] px-8 py-3.5 text-sm font-bold tracking-wide text-gray-200 transition hover:border-white hover:text-white shadow-sm">
                  Learn about us
                </button>
              </a>
            </div>

            <a href="/register" className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/50 bg-[#7F1D1D] text-white transition hover:scale-110 shadow-red-glow" title="Quick Register">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </a>
          </div>
        </div>

        {/* Feature Highlights Bar */}
        <div id="ledgers" className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-6xl w-full text-left font-mono">
          <div className="rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla transition hover:border-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue font-sans">Double-Entry Accounting</span>
            <h3 className="mt-2 text-lg font-extrabold text-white tracking-tight font-sans">Exact NUMERIC(20,8) Precision</h3>
            <p className="mt-2 text-xs text-gray-300 leading-relaxed font-sans">Zero floating-point rounding drift. Every deposit, yield accrual, and conversion is bound by exact fixed-point mathematics (`DecimalUtil`).</p>
          </div>

          <div className="rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla transition hover:border-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-sans">Concurrency Defense</span>
            <h3 className="mt-2 text-lg font-extrabold text-white tracking-tight font-sans">Redis Redlock Mutex Engine</h3>
            <p className="mt-2 text-xs text-gray-300 leading-relaxed font-sans">Strict distributed locking (`lock:wallet:usr_{'{ID}'}`) eliminates race conditions and double-spend attempts across simultaneous requests.</p>
          </div>

          <div className="rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla transition hover:border-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans">Executive Governance</span>
            <h3 className="mt-2 text-lg font-extrabold text-white tracking-tight font-sans">100% Mandatory Admin Review</h3>
            <p className="mt-2 text-xs text-gray-300 leading-relaxed font-sans">Every withdrawal enters our `PENDING_REVIEW` queue. Release strictly requires Two-Factor (`TOTP`) confirmation from treasury officers.</p>
          </div>
        </div>

        {/* Investment Plans Showcase Section (`IMG_7582.jpeg` exact match!) */}
        <section id="portfolios" className="mt-32 w-full max-w-6xl text-left">
          <div className="mb-12 border-b border-[#2A2338] pb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-blue font-mono">Portfolio Catalog</span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-sans">
                Investment Plans (`IMG_7582 Match`)
              </h2>
              <p className="text-xs text-gray-400 font-sans mt-1">
                Choose the plan that fits your investment goals. Featured vehicles: Model 3, Model Y, Model S Plaid, Cybertruck.
              </p>
            </div>
            <div className="text-right font-sans">
              <a href="/register">
                <button className="rounded-xl bg-[#EF4444] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#DC2626] transition shadow-red-glow">
                  Explore Live Terminal &rarr;
                </button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {INVESTMENT_PLANS_CONFIG.map((plan) => (
              <div
                key={plan.planId}
                className="flex flex-col justify-between rounded-2xl border border-[#2A2338] bg-[#16131F] shadow-tesla transition-all duration-300 hover:border-red-500/60 group overflow-hidden"
              >
                {/* 1. Horizontal Car Image Header (`IMG_7582.jpeg` match!) */}
                <div className="relative h-48 w-full overflow-hidden bg-black">
                  <img
                    src={plan.imageUrl || '/branding/car-bronze.jpg'}
                    alt={plan.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110 opacity-95 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16131F] via-[#16131F]/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-xs">
                    <span className="rounded-md border border-white/20 bg-black/80 px-2.5 py-1 font-extrabold text-white backdrop-blur-md shadow">
                      {plan.profitText || '40% Profit'}
                    </span>
                    <span className="rounded-md bg-brand-blue px-2.5 py-1 font-bold text-white backdrop-blur-md shadow-blue-glow">
                      {plan.termDays} Days Term
                    </span>
                  </div>
                </div>

                {/* 2. Card Content & Checkmark Features (`IMG_7582.jpeg` match!) */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between bg-[#16131F]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-extrabold tracking-tight text-white font-sans group-hover:text-[#EF4444] transition-colors">
                        {plan.name}
                      </h3>
                      <span className="text-xs font-mono font-bold text-gray-400">
                        {plan.annualPercentageRate} APR
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#0D0A12] p-3.5 border border-[#2A2338] space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-400">Min Capital:</span>
                      <span className="text-emerald-400 font-extrabold">${parseFloat(plan.minDepositUsd).toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-400">Max Capital:</span>
                      <span className="text-white font-extrabold">${parseFloat(plan.maxDepositUsd).toLocaleString()} USD</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2 font-sans text-xs text-gray-200">
                    {(plan.features && plan.features.length > 0 ? plan.features : ['Portfolio Access', 'Investment Dashboard', 'Email Support']).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[11px] border border-emerald-500/40">
                          ✔
                        </span>
                        <span className="font-semibold">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dedicated CTA Navigation Button */}
                  <div className="pt-4 font-sans">
                    <a href={`/dashboard/investments/checkout?planId=${plan.planId}`} className="block w-full">
                      <button className="w-full rounded-xl bg-[#EF4444] py-4 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#DC2626] shadow-red-glow group-hover:scale-[1.02]">
                        Get Started &rarr;
                      </button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer id="architecture" className="mt-32 border-t border-[#2A2338] pt-10 text-center text-xs text-gray-500 w-full max-w-5xl font-mono leading-relaxed space-y-4">
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
