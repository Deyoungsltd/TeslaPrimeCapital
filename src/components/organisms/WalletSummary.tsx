'use client';

import React from 'react';
import { useSessionStore } from '@/lib/store/session.store';
import { CurrencyDisplay } from '../atoms/CurrencyDisplay';
import { Button } from '../atoms/Button';

export interface IWalletBalance {
  id: string;
  currency: string;
  availableBalance: string;
  lockedBalance: string;
  totalDeposited: string;
  totalWithdrawn: string;
}

export const WalletSummary: React.FC<{ balances: IWalletBalance[] }> = ({ balances }) => {
  const { selectedCurrency, setSelectedCurrency } = useSessionStore();
  const currentWallet = balances.find((b) => b.currency === selectedCurrency) || balances[0] || {
    id: 'default',
    currency: selectedCurrency,
    availableBalance: '0.00000000',
    lockedBalance: '0.00000000',
    totalDeposited: '0.00000000',
    totalWithdrawn: '0.00000000',
  };

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-tesla">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#222226] pb-5">
        <div className="flex flex-wrap gap-2">
          {balances.map((w) => (
            <button
              key={w.currency}
              onClick={() => setSelectedCurrency(w.currency)}
              className={`rounded-md px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-all duration-150 ${
                selectedCurrency === w.currency
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-[#18181b] border border-[#27272a] text-gray-400 hover:bg-[#222226] hover:text-white'
              }`}
            >
              {w.currency}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <a href="/dashboard/deposit">
            <Button variant="primary" size="sm">+ Deposit {currentWallet.currency}</Button>
          </a>
          <a href="/dashboard/withdraw">
            <Button variant="secondary" size="sm">Withdraw</Button>
          </a>
          <a href="/dashboard/exchange">
            <Button variant="outline" size="sm">Exchange</Button>
          </a>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg bg-[#18181b] p-5 border border-[#27272a]">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Available Liquid Balance</span>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            <CurrencyDisplay amount={currentWallet.availableBalance} currency={currentWallet.currency} />
          </div>
          <span className="mt-1 block text-[11px] text-emerald-400 font-medium font-mono">Ready for immediate allocation / withdrawal</span>
        </div>

        <div className="rounded-lg bg-[#18181b] p-5 border border-[#27272a]">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Encumbered / Locked Balance</span>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-amber-400">
            <CurrencyDisplay amount={currentWallet.lockedBalance} currency={currentWallet.currency} />
          </div>
          <span className="mt-1 block text-[11px] text-amber-400/80 font-medium font-mono">Locked in active allocations / pending review</span>
        </div>

        <div className="rounded-lg bg-[#18181b] p-5 border border-[#27272a]">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Lifetime Deposited</span>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-200">
            <CurrencyDisplay amount={currentWallet.totalDeposited} currency={currentWallet.currency} />
          </div>
          <span className="mt-1 block text-[11px] text-gray-400 font-medium font-mono">Total Withdrawn: <CurrencyDisplay amount={currentWallet.totalWithdrawn} currency={currentWallet.currency} /></span>
        </div>
      </div>
    </div>
  );
};
