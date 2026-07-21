'use client';

import React from 'react';

export interface IAccrualChartItem {
  date: string;
  yieldEarned: string;
  planName: string;
}

export const FinancialGrowthChart: React.FC<{ accruals: IAccrualChartItem[] }> = ({ accruals }) => {
  if (accruals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#111116]/60 py-20 text-center">
        <svg className="h-14 w-14 text-gray-500 mb-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h4 className="text-lg font-extrabold text-white uppercase tracking-wider font-sans">No Yield Accruals Recorded Yet</h4>
        <p className="mt-1.5 max-w-md text-xs text-gray-400 font-sans">
          Compounding yield tracking records (`AccrualLog`) populate automatically at 00:00 UTC once your structured plans become active.
        </p>
      </div>
    );
  }

  const maxYield = Math.max(...accruals.map((a) => parseFloat(a.yieldEarned) || 0), 10);

  return (
    <div className="rounded-2xl border border-white/15 bg-[#111116] p-7 shadow-tesla space-y-8 font-mono">
      <div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue">Algorithmic Growth Trajectory</span>
          <h3 className="text-xl font-extrabold text-white tracking-tight font-sans mt-1">Daily Compounding Progression Curve</h3>
          <p className="text-xs text-gray-400 mt-1 font-mono">Enforcing policy: **Lump Sum at Term End**. Bars represent internally tracked daily compounding.</p>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3.5 py-1.5 rounded-full border border-emerald-500/40 shadow-emerald-glow">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">BullMQ Worker Active (`00:00 UTC`)</span>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-2.5 pt-8 pb-3 border-b border-white/10 px-3 overflow-x-auto">
        {accruals.slice(0, 14).reverse().map((item, idx) => {
          const val = parseFloat(item.yieldEarned) || 0;
          const heightPct = Math.max(12, Math.min(100, Math.round((val / maxYield) * 100)));
          return (
            <div key={idx} className="flex flex-col items-center flex-1 min-w-[38px] group relative">
              <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none bg-black border border-brand-blue text-white rounded-lg py-1.5 px-3 text-[11px] font-mono shadow-blue-glow z-30 whitespace-nowrap">
                <div className="text-gray-400">{item.date}</div>
                <div className="text-emerald-400 font-extrabold">+${val.toFixed(4)} USD</div>
              </div>

              <div
                style={{ height: `${heightPct}%` }}
                className="w-full max-w-[30px] rounded-t-lg bg-gradient-to-t from-brand-blue via-emerald-600 to-emerald-400 transition-all duration-200 group-hover:brightness-125 group-hover:shadow-emerald-glow shadow-md"
              />
              <span className="mt-3 text-[10px] font-mono text-gray-400 truncate max-w-[44px]">{item.date.slice(5)}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 pt-2">
        <div className="rounded-xl bg-[#181824] p-5 border border-[#27272a] shadow-inner">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Average Daily Yield</span>
          <span className="block mt-2 text-base font-mono font-extrabold text-emerald-400">+${(accruals.reduce((acc, a) => acc + parseFloat(a.yieldEarned || '0'), 0) / accruals.length).toFixed(4)} USD</span>
        </div>
        <div className="rounded-xl bg-[#181824] p-5 border border-[#27272a] shadow-inner">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Tracking Window</span>
          <span className="block mt-2 text-base font-mono font-extrabold text-gray-200">{accruals.length} Active Days</span>
        </div>
        <div className="rounded-xl bg-[#181824] p-5 border border-[#27272a] shadow-inner">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Primary Portfolio</span>
          <span className="block mt-2 text-sm font-bold text-white truncate">{accruals[0]?.planName || 'Dynamic Growth'}</span>
        </div>
        <div className="rounded-xl bg-[#181824] p-5 border border-[#27272a] shadow-inner">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Disbursement Schedule</span>
          <span className="block mt-2 text-xs font-extrabold text-brand-blue uppercase">Lump Sum at Term End</span>
        </div>
      </div>
    </div>
  );
};
