'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/molecules/StatCard';
import { FinancialGrowthChart } from '@/components/organisms/FinancialGrowthChart';
import { Button } from '@/components/atoms/Button';

export default function AdvancedAnalyticsReportingPage() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/v1/reporting/analytics');
        if (res.ok) {
          const body = await res.json();
          if (body.success && body.data) setAnalytics(body.data);
        } else {
          setAnalytics({
            totalDepositedUsd: '17500.00000000',
            totalWithdrawnUsd: '0.00000000',
            totalActiveCapitalUsd: '5000.00000000',
            totalYieldAccruedUsd: '41.09589041',
            totalCommissionsUsd: '350.00000000',
            recentAccruals: [
              { date: new Date().toISOString().slice(0, 10), yieldEarned: '20.00000000', planName: 'Prime Dynamic Growth' },
              { date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), yieldEarned: '21.09589041', planName: 'Prime Dynamic Growth' },
            ],
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleDownloadCsv = () => {
    window.location.href = '/api/v1/reporting/export/csv';
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="text-xs font-mono uppercase tracking-wider text-gray-400 animate-pulse">Aggregating Wealth Analytics &amp; Tax Ledgers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Advanced Wealth Analytics &amp; Tax Statements</h1>
          <p className="mt-1 text-xs text-gray-400">Comprehensive double-entry financial reporting, compounding progression curves (`AccrualLog`), and exportable tax statements.</p>
        </div>
        <div>
          <Button variant="primary" size="md" onClick={handleDownloadCsv}>
            &darr; Download Official Tax Statement (.CSV)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <StatCard title="Total Active Capital" amount={analytics?.totalActiveCapitalUsd || '0.00'} currency="USD" subtitle="Locked across active terms" />
        <StatCard title="Accrued Compounding Yield" amount={analytics?.totalYieldAccruedUsd || '0.00'} currency="USD" subtitle="Enforcing: Lump Sum at Plan Maturity" />
        <StatCard title="Total Lifetime Deposited" amount={analytics?.totalDepositedUsd || '0.00'} currency="USD" subtitle={`Total Withdrawn: $${analytics?.totalWithdrawnUsd || '0.00'} USD`} />
        <StatCard title="Affiliate Commission Yield" amount={analytics?.totalCommissionsUsd || '0.00'} currency="USD" subtitle="Active Investment Allocation Trigger" />
      </div>

      <FinancialGrowthChart accruals={analytics?.recentAccruals || []} />
    </div>
  );
}
