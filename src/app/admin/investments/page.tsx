'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';

export default function AdminPlansAndCarPicturesPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/plans');
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) setPlans(body.data);
      } else {
        setPlans([
          { id: '1', planId: 'plan-bronze', name: 'Bronze (BASE)', description: 'Perfect for getting started with Tesla investment.', minDepositUsd: '1000.00000000', maxDepositUsd: '8000.00000000', termDays: 24, dailyRateNumeric: '0.01666667', annualPercentageRate: '608.33%', profitText: '40% Profit', imageUrl: '/branding/car-bronze.jpg', features: ['Portfolio Access', 'Investment Dashboard', 'Email Support', 'Daily Accrual Tracking'], isActive: true },
          { id: '2', planId: 'plan-silver', name: 'Silver', description: 'Enhanced returns for serious investors.', minDepositUsd: '5000.00000000', maxDepositUsd: '14999.00000000', termDays: 3, dailyRateNumeric: '0.21666667', annualPercentageRate: '7908.33%', profitText: '65% Profit', imageUrl: '/branding/car-silver.jpg', features: ['Portfolio Access', 'Investment Dashboard', 'Email Support', 'Priority Liquidity Release'], isActive: true },
          { id: '3', planId: 'plan-gold', name: 'Gold', description: 'Premium investment with exclusive benefits.', minDepositUsd: '10000.00000000', maxDepositUsd: '50000.00000000', termDays: 7, dailyRateNumeric: '0.11428571', annualPercentageRate: '4171.43%', profitText: '80% Profit', imageUrl: '/branding/car-gold.jpg', features: ['Portfolio Access', 'Investment Dashboard', 'Email Support', 'Dedicated Account Manager'], isActive: true },
          { id: '4', planId: 'plan-diamond', name: 'Diamond (Platinum)', description: 'Elite flagship capital management pool.', minDepositUsd: '50000.00000000', maxDepositUsd: '1000000.00000000', termDays: 14, dailyRateNumeric: '0.07071429', annualPercentageRate: '2581.07%', profitText: '99% Profit', imageUrl: '/branding/car-diamond.jpg', features: ['Portfolio Access', 'Investment Dashboard', '24/7 VIP Phone Support', 'Instant Multi-Sig Release'], isActive: true },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-gray-400 uppercase tracking-wider animate-pulse">
        <span>Loading Admin Plan &amp; Car Picture Governance Center...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-[#20283E] pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl font-sans tracking-tight">
            Plan &amp; Car Picture Governance (`Admin`)
          </h1>
          <p className="mt-1.5 text-xs text-gray-400 font-sans">
            Enforcing approved policy: **All Buttons Navigate to Dedicated Edit/Create Pages (`No Modals!`)**. Edit name, profit text, duration, features, and upload car pictures right from your device!
          </p>
        </div>
        <div>
          <a href="/admin/investments/create">
            <Button variant="electric" size="md">
              + Create New Package &amp; Car Picture &rarr;
            </Button>
          </a>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#20283E] bg-[#131824] shadow-tesla font-sans">
        <table className="min-w-full divide-y divide-[#20283E]">
          <thead className="bg-[#181D2D]">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Featured Car</th>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Package Name</th>
              <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Profit Badge</th>
              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Range (`USD`)</th>
              <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Duration</th>
              <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Action (`Dedicated Page`)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#20283E]/60">
            {plans.map((p) => (
              <tr key={p.id} className="hover:bg-[#181D2D]/60 transition">
                <td className="px-5 py-4">
                  <div className="h-16 w-28 rounded-xl overflow-hidden border border-[#20283E] bg-black shadow-sm">
                    <img src={p.imageUrl || '/branding/car-bronze.jpg'} alt={p.name} className="h-full w-full object-cover" />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-base font-extrabold text-white">{p.name}</div>
                  <div className="text-xs text-gray-400 font-mono truncate max-w-[200px]">{p.description}</div>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="rounded-lg border border-white/20 bg-black/60 px-3 py-1 font-mono text-xs font-bold text-gray-200 shadow">
                    {p.profitText || '40% Profit'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-mono text-xs text-white font-bold">
                  ${parseFloat(p.minDepositUsd).toLocaleString()} - ${parseFloat(p.maxDepositUsd).toLocaleString()}
                </td>
                <td className="px-5 py-4 text-center font-mono text-xs text-emerald-400 font-extrabold">
                  {p.termDays} Days
                </td>
                <td className="px-5 py-4 text-center">
                  <Badge status={p.isActive ? 'ACTIVE' : 'SUSPENDED'} />
                </td>
                <td className="px-5 py-4 text-right">
                  <a href={`/admin/investments/edit/${p.planId || p.id}`}>
                    <Button variant="outline" size="sm" className="font-bold border-brand-blue/60 text-brand-blue hover:bg-brand-blue hover:text-white">
                      ✏️ Edit Plan &amp; Car &rarr;
                    </Button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
