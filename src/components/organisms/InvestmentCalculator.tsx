'use client';

import React, { useState } from 'react';
import { CurrencyDisplay } from '../atoms/CurrencyDisplay';
import { DecimalUtil } from '@/utils/decimal.util';

export const InvestmentCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState('10000.00');
  const [termDays, setTermDays] = useState(90);
  const [apr, setApr] = useState('146.00');

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
    <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-tesla space-y-6">
      <div className="border-b border-[#222226] pb-4">
        <h3 className="text-lg font-extrabold text-white uppercase tracking-wider font-sans">
          Compounding &amp; Lump-Sum Maturity Simulator
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Simulate capital growth across our structured allocation terms (`Lump Sum at Plan Maturity`).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 font-mono">Initial Allocation (USD)</label>
          <input
            type="range"
            min="100"
            max="100000"
            step="100"
            value={principal.split('.')[0]}
            onChange={(e) => setPrincipal(`${e.target.value}.00000000`)}
            className="mt-3 w-full accent-white bg-[#18181b] h-2 rounded-lg cursor-pointer"
          />
          <div className="mt-3 font-mono text-xl font-extrabold text-white">
            <CurrencyDisplay amount={principal} currency="USD" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 font-mono">Term Length (Days)</label>
          <div className="mt-3 flex gap-2">
            {[30, 90, 180].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => {
                  setTermDays(days);
                  setApr(days === 30 ? '91.25' : days === 90 ? '146.00' : '200.75');
                }}
                className={`flex-1 rounded-md border py-2 text-xs font-bold uppercase tracking-wide transition-all duration-150 font-mono ${
                  termDays === days
                    ? 'border-white bg-white text-black shadow-sm'
                    : 'border-[#27272a] bg-[#18181b] text-gray-400 hover:bg-[#222226] hover:text-white'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-400 font-mono">
            Target APR: <span className="font-bold text-white">{apr}%</span>
          </div>
        </div>

        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 block font-mono">Projected Maturity Outcome</span>
          <div className="flex justify-between items-baseline font-mono text-xs">
            <span className="text-gray-400">Net Accrued Yield:</span>
            <CurrencyDisplay amount={growth.totalYield} currency="USD" className="text-emerald-400 font-bold" />
          </div>
          <div className="flex justify-between items-baseline font-mono text-sm border-t border-emerald-800/40 pt-3">
            <span className="text-gray-200 font-bold">Total Lump-Sum Return:</span>
            <CurrencyDisplay amount={growth.totalReturn} currency="USD" className="text-2xl text-white font-extrabold tracking-tight" />
          </div>
        </div>
      </div>
    </div>
  );
};
