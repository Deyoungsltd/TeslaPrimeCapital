import React from 'react';
import { CurrencyDisplay } from '../atoms/CurrencyDisplay';

export interface IStatCardProps {
  title: string;
  amount: string;
  currency: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
}

export const StatCard: React.FC<IStatCardProps> = ({ title, amount, currency, subtitle, icon, trend }) => (
  <div className="relative overflow-hidden flex flex-col justify-between rounded-xl border border-brand-border bg-gradient-to-b from-[#18181f] to-[#111116] p-6 shadow-tesla transition-all duration-300 hover:border-white/40 hover:shadow-tesla-hover group">
    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-blue/10 blur-xl group-hover:bg-brand-blue/20 transition-all pointer-events-none" />
    <div className="flex items-center justify-between text-gray-400 z-10">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">{title}</span>
      {icon && <div className="text-white opacity-80 group-hover:scale-110 transition-transform">{icon}</div>}
    </div>
    <div className="mt-4 z-10">
      <CurrencyDisplay amount={amount} currency={currency} className="text-3xl text-white font-extrabold tracking-tight font-mono" />
      {trend && <span className="ml-2 inline-flex items-center text-xs font-mono font-bold text-emerald-400">▲ {trend}</span>}
    </div>
    {subtitle && <p className="mt-2 text-[11px] text-gray-400 font-medium font-mono z-10 border-t border-white/5 pt-2">{subtitle}</p>}
  </div>
);
