'use client';

import React from 'react';
import { CurrencyDisplay } from '../atoms/CurrencyDisplay';

export interface IAccrualChartItem {
  date: string;
  yieldEarned: string;
  planName: string;
}

export const FinancialGrowthChart: React.FC<{ accruals: IAccrualChartItem[] }> = ({ accruals }) => {
  if (accruals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-brand-card/40 py-16 text-center">
        <svg className="h-12 w-12 text-gray-400 mb-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h4 className="text-base font-bold text-gray-300 uppercase tracking-wider">No Yield Accruals Recorded Yet</h4>
        <p className="mt-1 max-w-sm text-xs text-gray-400">
          Compounding yield tracking records (`AccrualLog`) populate automatically at 00:00 UTC once your structured plans become active.
        </p>
      </div>
    );
  }

  // Calculate maximum yield value for relative bar sizing
  const maxYield = Math.max(...accruals.map((a) => parseFloat(a.yieldEarned) || 0), 10);

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-2xl space-y-6">
      <div className="flex flex-col justify-between gap-2 border-b border-gray-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider">Daily Compounding Accrual Trajectory</h3>
          <p className="text-xs text-gray-400 mt-0.5">Enforcing approved policy: **Lump Sum at Plan Maturity**. Bars represent internally tracked daily growth.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>BullMQ Worker Active (`00:00 UTC`)</span>
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-gray-800 px-2 overflow-x-auto">
        {accruals.slice(0, 14).reverse().map((item, idx) => {
          const val = parseFloat(item.yieldEarned) || 0;
          const heightPct = Math.max(12, Math.min(100, Math.round((val / maxYield) * 100)));
          return (
            <div key={idx} className="flex flex-col items-center flex-1 min-w-[36px] group relative">
              {/* Hover Tooltip */}
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-gray-900 border border-brand-gold/60 text-white rounded py-1 px-2 text-[10px] font-mono shadow-2xl z-20 whitespace-nowrap">
                <div>{item.date}</div>
                <div className="text-emerald-400 font-bold">+${val.toFixed(4)} USD</div>
              </div>

              {/* Bar */}
              <div
                style={{ height: `${heightPct}%` }}
                className="w-full max-w-[28px] rounded-t bg-gradient-to-t from-emerald-950 via-emerald-600 to-emerald-400 transition-all group-hover:brightness-125 shadow-md"
              />
              {/* X-Axis Date */}
              <span className="mt-2 text-[9px] font-mono text-gray-400 truncate max-w-[40px]">{item.date.slice(5)}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-2">
        <div className="rounded bg-gray-900/60 p-3 border border-gray-800">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Average Daily Yield</span>
          <span className="block mt-1 text-sm font-mono font-bold text-emerald-400">+${(accruals.reduce((acc, a) => acc + parseFloat(a.yieldEarned || '0'), 0) / accruals.length).toFixed(4)} USD</span>
        </div>
        <div className="rounded bg-gray-900/60 p-3 border border-gray-800">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Tracking Window</span>
          <span className="block mt-1 text-sm font-mono font-bold text-gray-200">{accruals.length} Active Days</span>
        </div>
        <div className="rounded bg-gray-900/60 p-3 border border-gray-800">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Primary Portfolio</span>
          <span className="block mt-1 text-xs font-bold text-brand-gold truncate">{accruals[0]?.planName || 'Dynamic Growth'}</span>
        </div>
        <div className="rounded bg-gray-900/60 p-3 border border-gray-800">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Maturity Disbursement</span>
          <span className="block mt-1 text-xs font-bold text-white uppercase">Lump Sum at Term End</span>
        </div>
      </div>
    </div>
  );
};
