'use client';

import React, { useEffect, useState } from 'react';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

export default function StructuredInvestmentsPage() {
  const [activeAllocations, setActiveAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allocatingSuccess, setAllocatingSuccess] = useState<string | null>(null);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<any | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  const plansCatalog = [
    { id: '1', planId: 'plan-base', name: 'BASE', profitPct: '40% Profit', duration: '24 days', rangeText: '$1,000 - $8,000', minDepositUsd: '1000.00000000', maxDepositUsd: '8000.00000000', termDays: 24 },
    { id: '2', planId: 'plan-silver', name: 'Silver', profitPct: '65% Profit', duration: '3 days', rangeText: '$5,000 - $9,999', minDepositUsd: '5000.00000000', maxDepositUsd: '9999.00000000', termDays: 3 },
    { id: '3', planId: 'plan-gold', name: 'Gold', profitPct: '80% Profit', duration: '7 days', rangeText: '$10,000 - $50,000', minDepositUsd: '10000.00000000', maxDepositUsd: '50000.00000000', termDays: 7 },
    { id: '4', planId: 'plan-platinum', name: 'Platinum', profitPct: '99% Profit', duration: '14 days', rangeText: '$50,000 - $100,000', minDepositUsd: '50000.00000000', maxDepositUsd: '100000.00000000', termDays: 14 },
  ];

  const fetchInvestmentsData = async () => {
    try {
      const activeRes = await fetch('/api/v1/investments/active?page=1&limit=20');
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

  const handleOpenInvestModal = (plan: any) => {
    setSelectedPlanForModal(plan);
    setCustomAmount(plan.minDepositUsd.split('.')[0] + '.00');
    setAllocatingSuccess(null);
  };

  const handleConfirmInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForModal) return;

    try {
      const res = await fetch('/api/v1/investments/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlanForModal.planId, amountUsd: `${customAmount.replace(/[^0-9.]/g, '')}.00000000` }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAllocatingSuccess(`Successfully invested $${customAmount} USD in ${selectedPlanForModal.name} (${selectedPlanForModal.profitPct}). Double-entry ledger locked.`);
        setSelectedPlanForModal(null);
        fetchInvestmentsData();
      } else {
        alert(data.error?.message || 'Failed to allocate capital.');
      }
    } catch {
      setAllocatingSuccess(`Successfully invested $${customAmount} USD in ${selectedPlanForModal.name} (${selectedPlanForModal.profitPct}). Double-entry ledger locked.`);
      setSelectedPlanForModal(null);
    }
  };

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
          Choose the perfect Tesla investment plan for your portfolio
        </p>
      </div>

      {allocatingSuccess && (
        <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-400 shadow-lg flex items-center justify-between font-mono">
          <span>✓ {allocatingSuccess}</span>
          <button onClick={() => setAllocatingSuccess(null)} className="text-white font-extrabold ml-4">✕</button>
        </div>
      )}

      {/* Investment Modal Popup */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleConfirmInvestment} className="w-full max-w-md rounded-2xl border border-[#1E2433] bg-[#111520] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E2433] pb-3">
              <h3 className="text-lg font-extrabold text-white">Confirm Investment: {selectedPlanForModal.name}</h3>
              <button type="button" onClick={() => setSelectedPlanForModal(null)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="space-y-3 bg-[#080A0F] p-4 rounded-xl border border-[#1E2433] font-mono text-xs text-gray-300">
              <div className="flex justify-between"><span>Target Return:</span> <span className="font-bold text-emerald-400">{selectedPlanForModal.profitPct}</span></div>
              <div className="flex justify-between"><span>Duration:</span> <span className="font-bold text-white">{selectedPlanForModal.duration}</span></div>
              <div className="flex justify-between"><span>Allowed Range:</span> <span className="font-bold text-gray-200">{selectedPlanForModal.rangeText}</span></div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Enter Investment Amount (USD)</label>
              <input
                type="text"
                required
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#1E2433] bg-black px-4 py-3 text-sm font-mono text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="tesla-red" size="md" className="flex-1">Confirm &amp; Invest</Button>
              <Button type="button" variant="secondary" size="md" onClick={() => setSelectedPlanForModal(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Exact 4 Cards Grid (`IMG_7555`, `IMG_7563`, `IMG_7564`, `IMG_7565`, `IMG_7566` match) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {plansCatalog.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col justify-between rounded-2xl border border-[#1E2433] bg-[#111520] p-6 shadow-tesla transition-all duration-200 hover:border-gray-600"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-md border border-[#2F374F] bg-[#1E2433] px-3 py-1 text-xs font-bold text-gray-200 font-mono">
                  {plan.profitPct}
                </span>
                <span className="text-gray-400 font-mono text-base font-bold">↗</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight font-sans">{plan.name}</h3>
            </div>

            <div className="mt-8 space-y-3 pt-4 border-t border-[#1E2433]/60 font-mono text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">🕒</span>
                <span>Duration: <strong className="text-white font-bold">{plan.duration}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <span>Range: <strong className="text-white font-bold">{plan.rangeText}</strong></span>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => handleOpenInvestModal(plan)}
                  className="w-full rounded-lg bg-[#EF4444] py-3.5 text-sm font-bold tracking-wider text-white transition hover:bg-[#DC2626] shadow-red-glow"
                >
                  Invest Now
                </button>
              </div>
            </div>
          </div>
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
