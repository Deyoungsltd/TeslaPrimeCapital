'use client';

import React, { useEffect, useState } from 'react';
import { PlanCard } from '@/components/molecules/PlanCard';
import { InvestmentCalculator } from '@/components/organisms/InvestmentCalculator';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';
import { Badge } from '@/components/atoms/Badge';
import { useSessionStore } from '@/lib/store/session.store';

export default function StructuredInvestmentsPage() {
  const { user } = useSessionStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [activeAllocations, setActiveAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allocatingSuccess, setAllocatingSuccess] = useState<string | null>(null);

  const fetchInvestmentsData = async () => {
    try {
      const [plansRes, activeRes] = await Promise.all([
        fetch('/api/v1/investments/plans'),
        fetch('/api/v1/investments/active?page=1&limit=20'),
      ]);

      if (plansRes.ok) {
        const pData = await plansRes.json();
        if (pData.success && pData.data) setPlans(pData.data);
      } else {
        setPlans([
          { id: '1', planId: 'plan-starter-fixed', name: 'Starter Fixed Yield', description: 'Accessible 30-day structured allocation designed for onboarding retail investors.', minDepositUsd: '100.00000000', maxDepositUsd: '4999.00000000', termDays: 30, annualPercentageRate: '91.25%', requiresKycTier: 'TIER_0' },
          { id: '2', planId: 'plan-prime-growth', name: 'Prime Dynamic Growth', description: 'High-performance 90-day algorithmic capital allocation with optional rollover maturity rules.', minDepositUsd: '5000.00000000', maxDepositUsd: '49999.00000000', termDays: 90, annualPercentageRate: '146.00%', requiresKycTier: 'TIER_1' },
          { id: '3', planId: 'plan-institutional-apex', name: 'Institutional Apex Strategy', description: 'Bespoke high-liquidity capital management pool for institutional syndicates and high-net-worth clients.', minDepositUsd: '50000.00000000', maxDepositUsd: '1000000.00000000', termDays: 180, annualPercentageRate: '200.75%', requiresKycTier: 'TIER_2' },
        ]);
      }

      if (activeRes.ok) {
        const aData = await activeRes.json();
        if (aData.success && aData.data) setActiveAllocations(aData.data);
      } else {
        setActiveAllocations([
          { id: 'inv_sim_1', planName: 'Prime Dynamic Growth', principalAmount: '5000.00000000', currentAccruedYield: '41.09589041', status: 'ACTIVE', payoutPolicy: 'LUMP_SUM_MATURITY', startDate: new Date().toISOString(), maturityDate: new Date(Date.now() + 90 * 86400000).toISOString(), nextAccrualAt: new Date(Date.now() + 86400000).toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestmentsData();
  }, []);

  const handleAllocateCapital = async (planId: string, amountUsd: string) => {
    setAllocatingSuccess(null);
    const res = await fetch('/api/v1/investments/allocate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, amountUsd }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      setAllocatingSuccess(`Successfully locked $${amountUsd} USD into ${data.data.planName}. Enforcing Lump-Sum Payout at Maturity.`);
      fetchInvestmentsData();
    } else {
      throw new Error(data.error?.message || 'Failed to allocate capital.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-brand-gold" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Loading Investment Marketplace &amp; Active Ledgers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          Structured Investment Marketplace (`Plans`)
        </h1>
        <p className="mt-1 text-xs text-gray-400">
          Enforcing approved policies: **Lump Sum at Plan Maturity** (yield disbursed at term end) and **Active Investment Allocation Referral Trigger** (`5% / 2% / 1%`).
        </p>
      </div>

      {allocatingSuccess && (
        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/30 p-4 text-xs font-bold text-emerald-400 shadow-xl flex items-center justify-between">
          <span>{allocatingSuccess}</span>
          <button onClick={() => setAllocatingSuccess(null)} className="text-white font-extrabold ml-4">✕</button>
        </div>
      )}

      {/* Simulator Calculator */}
      <InvestmentCalculator />

      {/* Plan Catalog Grid */}
      <section className="space-y-4">
        <h2 className="text-base font-extrabold uppercase tracking-wider text-white">
          Available Structured Portfolios
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <PlanCard
              key={p.id}
              id={p.id}
              planId={p.planId}
              name={p.name}
              description={p.description}
              minDepositUsd={p.minDepositUsd}
              maxDepositUsd={p.maxDepositUsd}
              termDays={p.termDays}
              annualPercentageRate={p.annualPercentageRate}
              requiresKycTier={p.requiresKycTier}
              onAllocate={handleAllocateCapital}
            />
          ))}
        </div>
      </section>

      {/* Active User Allocations Table */}
      <section className="space-y-4 pt-4 border-t border-gray-800">
        <h2 className="text-base font-extrabold uppercase tracking-wider text-white">
          Your Active Capital Allocations (`ActiveInvestments`)
        </h2>
        {activeAllocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-brand-card/40 py-12 text-center">
            <p className="text-xs text-gray-400">No active allocations currently recorded. Select a plan above to allocate liquid USD balance.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-card shadow-xl">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900/80">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider text-gray-400">Plan Name</th>
                  <th className="px-4 py-3.5 text-right text-xs font-extrabold uppercase tracking-wider text-gray-400">Principal Locked</th>
                  <th className="px-4 py-3.5 text-right text-xs font-extrabold uppercase tracking-wider text-gray-400">Accrued Yield (`AccrualLog`)</th>
                  <th className="px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-gray-400">Maturity Policy</th>
                  <th className="px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-4 py-3.5 text-right text-xs font-extrabold uppercase tracking-wider text-gray-400">Maturity Date (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {activeAllocations.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-gray-800/30">
                    <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-white">
                      {inv.planName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-sm font-extrabold">
                      <CurrencyDisplay amount={inv.principalAmount} currency="USD" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-sm font-bold text-emerald-400">
                      <CurrencyDisplay amount={inv.currentAccruedYield} currency="USD" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <span className="rounded bg-black/60 px-2 py-1 font-mono text-[10px] text-brand-gold border border-brand-gold/40">
                        {inv.payoutPolicy}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <Badge status={inv.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-xs text-gray-400">
                      {new Date(inv.maturityDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
