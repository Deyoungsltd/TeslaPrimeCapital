'use client';

import React, { useEffect, useState } from 'react';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';
import { Badge } from '@/components/atoms/Badge';
import { PlanCard } from '@/components/molecules/PlanCard';
import { INVESTMENT_PLANS_CONFIG } from '@/config/plans.config';

export default function StructuredInvestmentsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [activeAllocations, setActiveAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestmentsData = async () => {
    try {
      const [plansRes, activeRes] = await Promise.all([
        fetch('/api/v1/investments/plans'),
        fetch('/api/v1/investments/active?page=1&limit=20'),
      ]);

      if (plansRes.ok) {
        const pData = await plansRes.json();
        if (pData.success && pData.data && pData.data.length > 0) {
          setPlans(pData.data);
        } else {
          setPlans([...INVESTMENT_PLANS_CONFIG]);
        }
      } else {
        setPlans([...INVESTMENT_PLANS_CONFIG]);
      }

      if (activeRes.ok) {
        const aData = await activeRes.json();
        if (aData.success && aData.data) setActiveAllocations(aData.data);
      } else {
        setActiveAllocations([
          { id: 'inv_sim_1', planName: 'Gold', principalAmount: '10000.00000000', currentAccruedYield: '8000.00000000', status: 'ACTIVE', payoutPolicy: 'LUMP_SUM_MATURITY', startDate: new Date().toISOString(), maturityDate: new Date(Date.now() + 7 * 86400000).toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestmentsData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-gray-400 uppercase tracking-wider animate-pulse">
        <span>Loading Investment Packages &amp; Active Ledgers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Exact Heading (`IMG_7555` match) */}
      <div className="border-b border-[#1E2433] pb-6">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl font-sans tracking-tight">
          Investment Packages
        </h1>
        <p className="mt-1.5 text-xs text-gray-400 font-sans">
          Choose the perfect Tesla investment plan for your portfolio (`IMG_7582 Match with Car Pictures &amp; Checkmarks`)
        </p>
      </div>

      {/* Exact 4 Cards Grid (`IMG_7582 / IMG_7555` match with Car Pictures across top!) */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.planId || plan.id}
            id={plan.id}
            planId={plan.planId || plan.id}
            name={plan.name}
            description={plan.description}
            minDepositUsd={plan.minDepositUsd}
            maxDepositUsd={plan.maxDepositUsd}
            termDays={plan.termDays}
            annualPercentageRate={plan.annualPercentageRate}
            requiresKycTier={plan.requiresKycTier}
            imageUrl={plan.imageUrl}
            profitText={plan.profitText}
            features={plan.features}
            buttonColor="red"
          />
        ))}
      </div>

      {/* Your Active Capital Allocations Table */}
      <section className="space-y-4 pt-6 border-t border-[#1E2433]">
        <h2 className="text-base font-extrabold uppercase tracking-wider text-white font-sans">
          Your Active Capital Ledgers (`ActiveInvestments`)
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[#1E2433] bg-[#111520] shadow-tesla">
          <table className="min-w-full divide-y divide-[#1E2433]">
            <thead className="bg-[#181D2D]">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Package</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Principal Locked</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Accrued Profit</th>
                <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Maturity Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2433]/60">
              {activeAllocations.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#181D2D]/60 transition">
                  <td className="whitespace-nowrap px-5 py-4 text-xs font-bold text-white font-sans">{inv.planName}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-sm font-extrabold text-white">
                    <CurrencyDisplay amount={inv.principalAmount} currency="USD" />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-sm font-extrabold text-emerald-400">
                    <CurrencyDisplay amount={inv.currentAccruedYield} currency="USD" />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-center"><Badge status={inv.status} /></td>
                  <td className="whitespace-nowrap px-5 py-4 text-right text-xs text-gray-400 font-mono">
                    {new Date(inv.maturityDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
