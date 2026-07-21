'use client';

import React, { useState, useEffect } from 'react';
import { CurrencyDisplay } from '../atoms/CurrencyDisplay';
import { DecimalUtil } from '@/utils/decimal.util';

export const InvestmentCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState('10000.00');
  const [termDays, setTermDays] = useState(90);
  const [apr, setApr] = useState('146.00');
  const [liveTicks, setLiveTicks] = useState(0.00000000);

  // Simulate real-time compounding live accrual ticking up right before the investor's eyes (`teslapremiumfinance.com` feature!)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTicks((prev) => prev + 0.00001524);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateGrowth = () => {
    try {
      const dailyRate = DecimalUtil.div(apr.replace('%', ''), '36500');
      const totalYield = DecimalUtil.mul(principal, DecimalUtil.mul(dailyRate, termDays.toString()));
      const totalReturn = DecimalUtil.add(principal, totalYield);
      return { totalYield, totalReturn };
    } catch {
      return { totalYield: '0.00', totalReturn: principal };
    }
  };

  const growth = calculateGrowth();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#181824] via-[#111116] to-[#0a0a0e] p-8 shadow-tesla space-y-8">
      {/* Background Decorative Glow */}
      <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center z-10 relative">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue font-mono">Algorithmic Projection Engine</span>
          <h3 className="mt-1 text-2xl font-extrabold text-white tracking-tight font-sans">
            Real-Time Compounding &amp; Lump-Sum Simulator
          </h3>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Simulate exact fixed-point capital growth (`DecimalUtil`). Enforcing policy: **Lump Sum at Term End**.
          </p>
        </div>

        {/* Live Accrual Ticker Box (`teslapremiumfinance` feature) */}
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-2.5 shadow-emerald-glow font-mono text-xs flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Live Pool Accrual Rate</span>
            <span className="text-emerald-400 font-extrabold text-sm">+${(liveTicks).toFixed(8)} USD / sec</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 z-10 relative font-mono">
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">1. Initial Allocation (USD)</label>
          <input
            type="range"
            min="100"
            max="100000"
            step="100"
            value={principal.split('.')[0]}
            onChange={(e) => setPrincipal(`${e.target.value}.00000000`)}
            className="w-full accent-brand-blue bg-black h-2.5 rounded-lg cursor-pointer border border-white/20"
          />
          <div className="rounded-xl bg-black p-4 border border-white/15 text-center">
            <CurrencyDisplay amount={principal} currency="USD" className="text-2xl text-white font-extrabold" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">2. Select Term Duration</label>
          <div className="flex gap-2">
            {[30, 90, 180].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => {
                  setTermDays(days);
                  setApr(days === 30 ? '91.25' : days === 90 ? '146.00' : '200.75');
                }}
                className={`flex-1 rounded-xl border py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 font-mono ${
                  termDays === days
                    ? 'border-brand-blue bg-brand-blue text-white shadow-blue-glow scale-105'
                    : 'border-white/10 bg-black text-gray-400 hover:bg-[#181824] hover:text-white'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
          <div className="rounded-xl bg-black p-4 border border-white/15 text-center text-xs text-gray-400">
            Target APR: <span className="font-extrabold text-white text-base ml-1">{apr}%</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/50 bg-black/80 p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block font-mono">Projected Maturity Outcome</span>
            <div className="mt-4 flex justify-between items-baseline text-xs font-mono">
              <span className="text-gray-400">Net Accrued Yield:</span>
              <CurrencyDisplay amount={growth.totalYield} currency="USD" className="text-emerald-400 font-bold" />
            </div>
            <div className="mt-2 flex justify-between items-baseline text-sm font-mono border-t border-white/10 pt-3">
              <span className="text-gray-200 font-bold">Total Return (`Principal + Yield`):</span>
            </div>
            <div className="mt-1 text-right">
              <CurrencyDisplay amount={growth.totalReturn} currency="USD" className="text-3xl text-white font-extrabold tracking-tight" />
            </div>
          </div>
          <div className="pt-2 font-sans">
            <a href="/dashboard/investments">
              <button className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-extrabold uppercase tracking-wider text-black transition hover:bg-emerald-400 shadow-emerald-glow">
                Lock Capital in Pool &rarr;
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
