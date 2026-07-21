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
  <div className="relative overflow-hidden flex flex-col justify-between rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla transition-all duration-200 hover:border-gray-600 group">
    <div className="flex items-center justify-between text-gray-400 z-10">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-sans">{title}</span>
      {icon && <div className="text-white opacity-80 group-hover:scale-110 transition-transform">{icon}</div>}
    </div>
    <div className="mt-4 z-10">
      <CurrencyDisplay amount={amount} currency={currency} className="text-3xl text-white font-extrabold tracking-tight font-mono" />
      {trend && <span className="ml-2 inline-flex items-center text-xs font-mono font-bold text-emerald-400">▲ {trend}</span>}
    </div>
    {subtitle && <p className="mt-2 text-[11px] text-gray-400 font-medium font-sans z-10 border-t border-[#2A2338] pt-2">{subtitle}</p>}
  </div>
);
