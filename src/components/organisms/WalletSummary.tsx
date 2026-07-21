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
    <div className="rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla">
      <div className="flex flex-wrap items-center justify-between gap-5 border-b border-[#2A2338] pb-5 z-10 relative">
        <div className="flex flex-wrap gap-2.5 font-mono">
          {balances.map((w) => (
            <button
              key={w.currency}
              onClick={() => setSelectedCurrency(w.currency)}
              className={`rounded-lg px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-150 ${
                selectedCurrency === w.currency
                  ? 'bg-[#EF4444] text-white shadow-red-glow font-extrabold'
                  : 'bg-[#0D0A12] border border-[#2A2338] text-gray-400 hover:bg-[#201A2C] hover:text-white'
              }`}
            >
              {w.currency}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <a href="/dashboard/deposit">
            <Button variant="tesla-red" size="sm">+ Deposit {currentWallet.currency}</Button>
          </a>
          <a href="/dashboard/withdraw">
            <Button variant="secondary" size="sm">Withdraw</Button>
          </a>
          <a href="/dashboard/exchange">
            <Button variant="outline" size="sm">Exchange</Button>
          </a>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 font-mono">
        <div className="rounded-xl bg-[#0D0A12] p-5 border border-[#2A2338] shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-sans">Available Liquid Balance</span>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            <CurrencyDisplay amount={currentWallet.availableBalance} currency={currentWallet.currency} />
          </div>
          <span className="mt-1 block text-[11px] text-gray-400 font-sans">Ready for instant allocation / withdrawal</span>
        </div>

        <div className="rounded-xl bg-[#0D0A12] p-5 border border-[#2A2338] shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans">Encumbered / Locked Balance</span>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-amber-400">
            <CurrencyDisplay amount={currentWallet.lockedBalance} currency={currentWallet.currency} />
          </div>
          <span className="mt-1 block text-[11px] text-gray-400 font-sans">Locked in active contracts / review</span>
        </div>

        <div className="rounded-xl bg-[#0D0A12] p-5 border border-[#2A2338] shadow-md">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-sans">Total Lifetime Deposited</span>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            <CurrencyDisplay amount={currentWallet.totalDeposited} currency={currentWallet.currency} />
          </div>
          <span className="mt-1 block text-[11px] text-gray-400 font-sans">Total Withdrawn: <CurrencyDisplay amount={currentWallet.totalWithdrawn} currency={currentWallet.currency} /></span>
        </div>
      </div>
    </div>
  );
};
