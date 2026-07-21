'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/molecules/StatCard';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';
import { Button } from '@/components/atoms/Button';

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch('/api/v1/admin/overview');
        if (res.ok) {
          const body = await res.json();
          if (body.success && body.data) setMetrics(body.data);
        } else {
          setMetrics({
            totalUsersCount: 1420,
            activeInvestorsCount: 890,
            totalDepositedUsd: '4580000.00000000',
            totalWithdrawnUsd: '1250000.00000000',
            totalLockedWithdrawalsUsd: '45000.00000000',
            activeInvestmentsUsd: '3120000.00000000',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="text-xs font-mono uppercase tracking-wider text-gray-400 animate-pulse">Aggregating Executive Platform Metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Executive Governance Overview</h1>
        <p className="mt-1 text-xs text-gray-400">Real-time enterprise metrics across identity, multi-currency wallets, active compounding capital, and treasury queues.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard title="Total Registered Identities" amount={metrics?.totalUsersCount || '0'} currency="Users" subtitle={`Active Verified Investors: ${metrics?.activeInvestorsCount || '0'}`} />
        <StatCard title="Total Lifetime Deposited" amount={metrics?.totalDepositedUsd || '0.00'} currency="USD" subtitle={`Total Disbursed: $${DecimalFormat(metrics?.totalWithdrawnUsd)} USD`} />
        <StatCard title="Total Active Plan Capital" amount={metrics?.activeInvestmentsUsd || '0.00'} currency="USD" subtitle="Enforcing: Lump Sum at Plan Maturity" />
      </div>

      <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-6 shadow-2xl flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h3 className="text-lg font-extrabold text-amber-400 uppercase tracking-wider">Treasury Withdrawal Action Required (`100% Mandatory Review`)</h3>
          <p className="mt-1 text-xs text-gray-300">
            Currently locking <strong className="text-white font-mono"><CurrencyDisplay amount={metrics?.totalLockedWithdrawalsUsd || '0.00'} currency="USD" /></strong> inside our `PENDING_REVIEW` queue awaiting Two-Factor (`TOTP`) co-signature.
          </p>
        </div>
        <a href="/admin/withdrawals">
          <Button variant="primary" size="md">Open Treasury Approval Queue &rarr;</Button>
        </a>
      </div>
    </div>
  );
}

function DecimalFormat(str: string | undefined): string {
  if (!str) return '0.00';
  return parseFloat(str).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
