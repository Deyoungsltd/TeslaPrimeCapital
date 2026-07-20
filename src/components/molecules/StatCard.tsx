import React from 'react';
import { CurrencyDisplay } from '../atoms/CurrencyDisplay';

export interface IStatCardProps {
  title: string;
  amount: string;
  currency: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<IStatCardProps> = ({ title, amount, currency, subtitle, icon }) => (
  <div className="flex flex-col justify-between rounded-xl border border-brand-border bg-brand-card p-6 shadow-xl transition-all hover:border-brand-gold/40">
    <div className="flex items-center justify-between text-gray-400">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</span>
      {icon && <div className="text-brand-gold opacity-80">{icon}</div>}
    </div>
    <div className="mt-4">
      <CurrencyDisplay amount={amount} currency={currency} className="text-3xl text-white font-extrabold" />
    </div>
    {subtitle && <p className="mt-2 text-xs text-gray-400">{subtitle}</p>}
  </div>
);
