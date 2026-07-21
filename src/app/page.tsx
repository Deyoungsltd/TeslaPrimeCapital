import React from 'react';
import { APP_CONFIG } from '@/config/app.config';
import { INVESTMENT_PLANS_CONFIG } from '@/config/plans.config';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#EF4444] selection:text-white">
      {/* Exact Header (`IMG_7550` match) */}
      <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#1E2433] bg-[#080A0F]/95 px-6 sm:px-12 backdrop-blur-md">
        <a href="/" className="flex items-center gap-3">
          <span className="text-xl font-extrabold tracking-[0.35em] text-white uppercase font-sans">
            T E S L A
          </span>
          <span className="rounded border border-[#252D3F] bg-[#111520] px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
            Equity Pro
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-300">
          <a href="#portfolios" className="hover:text-white transition">Investment Plans (`IMG_7582 Match`)</a>
          <a href="#ledgers" className="hover:text-white transition">Double-Entry Ledgers</a>
          <a href="#governance" className="hover:text-white transition">Compliance Gate</a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="rounded-lg border border-[#2C354C] bg-[#111520] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-200 transition hover:border-white hover:text-white shadow-sm"
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

      {/* Hero Showcase Section */}
      <main className="flex flex-col items-center justify-center px-6 pt-24 pb-20 text-center sm:pt-32 sm:pb-28">
        <div className="max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400 font-mono shadow-sm">
            <span>Algorithmic Compounding &bull; Exact NUMERIC(20,8) Ledgers</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl md:text-8xl leading-none">
            TESLA EQUITY PRO.
          </h1>
          <p className="mx-auto max-w-2xl text-base font-normal text-gray-300 sm:text-lg leading-relaxed">
            {APP_CONFIG.tagline}. Engineered for absolute transparency, instantaneous multi-currency settlement (`USD`, `EUR`, `BTC`, `ETH`), and verified double-entry compounding.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 pt-4">
            <a
              href="/register"
              className="w-full sm:w-auto rounded-lg bg-[#EF4444] px-9 py-4 text-sm font-extrabold uppercase tracking-wider text-white shadow-red-glow transition hover:bg-[#DC2626]"
            >
              Get Started &rarr;
            </a>
            <a
              href="/dashboard"
              className="w-full sm:w-auto rounded-lg border border-[#2C354C] bg-[#111520] px-9 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition hover:border-white hover:bg-[#181D2D]"
            >
              Enter Live Terminal
            </a>
          </div>
        </div>

        {/* Feature Highlights Bar */}
        <div id="ledgers" className="mt-28 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-6xl w-full text-left font-mono">
          <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-6 shadow-tesla">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue font-sans">Double-Entry Accounting</span>
            <h3 className="mt-2 text-lg font-extrabold text-white tracking-tight font-sans">Exact NUMERIC(20,8) Precision</h3>
            <p className="mt-2 text-xs text-gray-300 leading-relaxed font-sans">Zero floating-point rounding drift. Every deposit, yield accrual, and conversion is bound by exact fixed-point mathematics (`DecimalUtil`).</p>
          </div>

          <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-6 shadow-tesla">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-sans">Concurrency Defense</span>
            <h3 className="mt-2 text-lg font-extrabold text-white tracking-tight font-sans">Redis Redlock Mutex Engine</h3>
            <p className="mt-2 text-xs text-gray-300 leading-relaxed font-sans">Strict distributed locking (`lock:wallet:usr_{'{ID}'}`) eliminates race conditions and double-spend attempts across simultaneous requests.</p>
          </div>

          <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-6 shadow-tesla">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans">Executive Governance</span>
            <h3 className="mt-2 text-lg font-extrabold text-white tracking-tight font-sans">100% Mandatory Admin Review</h3>
            <p className="mt-2 text-xs text-gray-300 leading-relaxed font-sans">Every withdrawal enters our `PENDING_REVIEW` queue. Release strictly requires Two-Factor (`TOTP`) confirmation from treasury officers.</p>
          </div>
        </div>

        {/* Investment Plans Showcase Section (`IMG_7582.jpeg` exact match!) */}
        <section id="portfolios" className="mt-32 w-full max-w-6xl text-left">
          <div className="mb-12 border-b border-[#1E2433] pb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-blue font-mono">Portfolio Catalog</span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-sans">
                Investment Plans (`IMG_7582 Match`)
              </h2>
              <p className="text-xs text-gray-400 font-sans mt-1">
                Choose the plan that fits your investment goals. Featured vehicles: Model 3, Model Y, Model S Plaid, Cybertruck.
              </p>
            </div>
            <div className="text-right">
              <a href="/register">
                <button className="rounded-lg bg-brand-blue px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blueHover transition shadow-md">
                  Explore Live Terminal &rarr;
                </button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {INVESTMENT_PLANS_CONFIG.map((plan) => (
              <div
                key={plan.planId}
                className="flex flex-col justify-between rounded-2xl border border-[#1E2433] bg-[#111520] shadow-tesla transition-all duration-300 hover:border-gray-500 group overflow-hidden"
              >
                {/* 1. Horizontal Car Image Header (`IMG_7582.jpeg` match!) */}
                <div className="relative h-44 w-full overflow-hidden bg-black/60">
                  <img
                    src={plan.imageUrl || '/branding/car-bronze.jpg'}
                    alt={plan.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110 opacity-95 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-[#111520]/20 to-transparent" />
                  
                  {/* Top Pills */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-xs">
                    <span className="rounded-md border border-[#2F374F] bg-[#1E2433] px-2.5 py-1 font-bold text-gray-200 backdrop-blur-md">
                      {plan.profitText || '40% Profit'}
                    </span>
                    <span className="rounded-md bg-brand-blue/80 px-2.5 py-1 font-bold text-white backdrop-blur-md shadow-sm">
                      {plan.termDays} Days
                    </span>
                  </div>
                </div>

                {/* 2. Card Content & Checkmark Features (`IMG_7582.jpeg` match!) */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold tracking-tight text-white font-sans group-hover:text-brand-blue transition-colors">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="font-mono text-xs text-white pt-2 border-t border-[#1E2433]/80">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-400">Min Investment:</span>
                      <span className="text-brand-gold font-extrabold">${parseFloat(plan.minDepositUsd).toLocaleString()} USD</span>
                    </div>
                  </div>

                  {/* Checkmark Features List (`IMG_7582.jpeg` checkmarks match!) */}
                  <div className="space-y-2 pt-3 border-t border-[#1E2433]/80 font-sans text-xs text-gray-300">
                    {(plan.features && plan.features.length > 0 ? plan.features : ['Portfolio Access', 'Investment Dashboard', 'Email Support']).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          ✔
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action CTA Button (`IMG_7582.jpeg` Get Started match!) */}
                  <div className="pt-4">
                    <a href="/register" className="block w-full">
                      <button className="w-full rounded-xl bg-brand-blue py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-brand-blueHover shadow-md group-hover:scale-[1.02]">
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
        <footer className="mt-32 border-t border-[#1E2433] pt-10 text-center text-xs text-gray-500 w-full max-w-5xl font-mono leading-relaxed space-y-4">
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
