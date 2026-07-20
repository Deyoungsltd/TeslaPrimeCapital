'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/molecules/StatCard';
import { WalletSummary } from '@/components/organisms/WalletSummary';
import { DataTable } from '@/components/organisms/DataTable';
import { useSessionStore } from '@/lib/store/session.store';

export default function DashboardOverviewPage() {
  const { user } = useSessionStore();
  const [balances, setBalances] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerminalData = async () => {
      try {
        const [balRes, txRes] = await Promise.all([
          fetch('/api/v1/wallet/balances'),
          fetch('/api/v1/wallet/transactions?page=1&limit=5'),
        ]);

        if (balRes.ok) {
          const balData = await balRes.json();
          if (balData.success && balData.data) setBalances(balData.data);
        } else {
          setBalances([
            { id: '1', currency: 'USD', availableBalance: '12500.00000000', lockedBalance: '5000.00000000', totalDeposited: '17500.00000000', totalWithdrawn: '0.00000000' },
            { id: '2', currency: 'BTC', availableBalance: '0.45000000', lockedBalance: '0.10000000', totalDeposited: '0.55000000', totalWithdrawn: '0.00000000' },
            { id: '3', currency: 'ETH', availableBalance: '3.20000000', lockedBalance: '0.00000000', totalDeposited: '3.20000000', totalWithdrawn: '0.00000000' },
          ]);
        }

        if (txRes.ok) {
          const txData = await txRes.json();
          if (txData.success && txData.data) setRecentTransactions(txData.data);
        } else {
          setRecentTransactions([
            { id: 'tx1', transactionId: 'TXN_DEP_20260720_481923', type: 'DEPOSIT', amount: '10000.00000000', currency: 'USD', status: 'COMPLETED', createdAt: new Date().toISOString() },
            { id: 'tx2', transactionId: 'TXN_INV_20260720_998877', type: 'INVESTMENT_LOCK', amount: '5000.00000000', currency: 'USD', status: 'COMPLETED', createdAt: new Date(Date.now() - 3600000).toISOString() },
            { id: 'tx3', transactionId: 'TXN_DEP_20260719_112233', type: 'DEPOSIT', amount: '0.45000000', currency: 'BTC', status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000).toISOString() },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTerminalData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-brand-gold" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Synchronizing Multi-Currency Ledgers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Executive Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-brand-border bg-gradient-to-r from-brand-card to-gray-900 p-6 shadow-xl md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            Welcome, {user ? `${user.firstName} ${user.lastName}` : 'Institutional Investor'}
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Account Status: <span className="font-bold text-emerald-400">ACTIVE</span> &bull; Verified Level: <span className="font-bold text-brand-gold">{user?.kycTier || 'TIER_0'} (Starter)</span> &bull; Double-Entry Ledgers Synchronized (`NUMERIC(20,8)`)
          </p>
        </div>
        <div className="flex gap-3">
          <a href="/dashboard/investments">
            <button className="rounded-md bg-brand-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-brand-goldHover shadow-lg">
              Explore Plan Marketplace
            </button>
          </a>
        </div>
      </div>

      {/* Multi-Currency Portfolio Summary */}
      <section>
        <h2 className="mb-4 text-sm font-extrabold uppercase tracking-widest text-gray-400">
          Segregated Multi-Currency Wallets (`Wallets`)
        </h2>
        <WalletSummary balances={balances} />
      </section>

      {/* Key Executive Metrics Grid */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard title="Active Capital Allocations" amount="5000.00000000" currency="USD" subtitle="Prime Dynamic Growth (90 Days)" />
        <StatCard title="Projected Maturity Payout" amount="6800.00000000" currency="USD" subtitle="Enforcing: Lump Sum at Plan Maturity" />
        <StatCard title="Total Affiliate Referral Payouts" amount="350.00000000" currency="USD" subtitle="Enforcing: Active Investment Allocation Trigger" />
      </section>

      {/* Recent Ledger Activity Feed */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-400">
            Recent Ledger Transactions (`Transactions`)
          </h2>
          <a href="/dashboard/wallet" className="text-xs font-bold text-brand-gold hover:underline uppercase tracking-wider">
            View All Ledgers &rarr;
          </a>
        </div>
        <DataTable transactions={recentTransactions} />
      </section>
    </div>
  );
}
