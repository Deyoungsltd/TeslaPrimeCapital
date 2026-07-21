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
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-[#181822] to-[#0e0e14] p-7 shadow-tesla">
      {/* Background Decorative Glow */}
      <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-brand-blue/15 blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-6 z-10 relative">
        <div className="flex flex-wrap gap-2.5">
          {balances.map((w) => (
            <button
              key={w.currency}
              onClick={() => setSelectedCurrency(w.currency)}
              className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-150 font-mono ${
                selectedCurrency === w.currency
                  ? 'bg-brand-blue text-white shadow-blue-glow border border-white/30 scale-105'
                  : 'bg-[#181822] border border-white/10 text-gray-400 hover:bg-[#222230] hover:text-white'
              }`}
            >
              {w.currency}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <a href="/dashboard/deposit">
            <Button variant="electric" size="md">+ Deposit {currentWallet.currency}</Button>
          </a>
          <a href="/dashboard/withdraw">
            <Button variant="secondary" size="md">Withdraw</Button>
          </a>
          <a href="/dashboard/exchange">
            <Button variant="outline" size="md">Exchange</Button>
          </a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 z-10 relative font-mono">
        <div className="rounded-xl bg-black/60 p-6 border border-emerald-500/30 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Available Liquid Balance</span>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-white">
            <CurrencyDisplay amount={currentWallet.availableBalance} currency={currentWallet.currency} />
          </div>
          <span className="mt-2 block text-xs text-gray-400 font-sans font-medium">Ready for instant allocation / withdrawal</span>
        </div>

        <div className="rounded-xl bg-black/60 p-6 border border-amber-500/30 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Encumbered / Locked Balance</span>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-amber-400">
            <CurrencyDisplay amount={currentWallet.lockedBalance} currency={currentWallet.currency} />
          </div>
          <span className="mt-2 block text-xs text-gray-400 font-sans font-medium">Locked in active contracts / pending sign-off</span>
        </div>

        <div className="rounded-xl bg-black/60 p-6 border border-white/10 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Lifetime Deposited</span>
          <div className="mt-3 text-3xl font-extrabold tracking-tight text-gray-200">
            <CurrencyDisplay amount={currentWallet.totalDeposited} currency={currentWallet.currency} />
          </div>
          <span className="mt-2 block text-xs text-gray-400 font-sans font-medium">Total Withdrawn: <CurrencyDisplay amount={currentWallet.totalWithdrawn} currency={currentWallet.currency} /></span>
        </div>
      </div>
    </div>
  );
};
