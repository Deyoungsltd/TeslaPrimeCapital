'use client';
import { SafeImage } from '@/components/atoms/SafeImage';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';
import { DecimalUtil } from '@/utils/decimal.util';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get('planId') || 'plan-bronze';

  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [amountUsd, setAmountUsd] = useState('1000.00');
  const [allocating, setAllocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any | null>(null);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const res = await fetch('/api/v1/investments/plans');
        if (res.ok) {
          const body = await res.json();
          if (body.success && body.data) {
            const found = body.data.find((p: any) => p.planId === planIdParam || p.id === planIdParam) || body.data[0];
            setPlan(found);
            if (found) setAmountUsd(parseFloat(found.minDepositUsd).toFixed(2));
          }
        } else {
          setPlan({
            planId: 'plan-bronze',
            name: 'Bronze (BASE)',
            description: 'Perfect for getting started with Tesla investment. Featured vehicle: Model 3.',
            minDepositUsd: '1000.00000000',
            maxDepositUsd: '8000.00000000',
            termDays: 24,
            annualPercentageRate: '608.33%',
            profitText: '40% Profit',
            imageUrl: '/branding/car-bronze.jpg',
            features: ['Portfolio Access', 'Investment Dashboard', 'Email Support', 'Daily Accrual Tracking'],
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPlanDetails();
  }, [planIdParam]);

  const projectedReturn = () => {
    if (!plan) return amountUsd;
    try {
      const dailyRate = DecimalUtil.div(plan.annualPercentageRate.replace('%', ''), '36500');
      const totalYield = DecimalUtil.mul(amountUsd, DecimalUtil.mul(dailyRate, plan.termDays.toString()));
      return DecimalUtil.add(amountUsd, totalYield);
    } catch {
      return amountUsd;
    }
  };

  const handleConfirmAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) return;
    setAllocating(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/investments/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.planId, amountUsd: `${parseFloat(amountUsd).toFixed(8)}` }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(data.data);
      } else {
        setError(data.error?.message || 'Failed to allocate capital.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error intercepted.');
    } finally {
      setAllocating(false);
    }
  };

  if (loading || !plan) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-gray-400 uppercase tracking-wider animate-pulse">
        <span>Loading Dedicated Plan Checkout &amp; Specifications...</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-500/50 bg-[#131824] p-8 shadow-tesla space-y-6">
        <div className="flex items-center gap-3 text-emerald-400 border-b border-emerald-800/40 pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-xl font-bold">✓</span>
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-white font-sans">Capital Allocation Locked</h2>
            <span className="text-xs font-mono text-emerald-400">Reference ID: {success.investmentId}</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#0B0E14] p-5 border border-[#20283E] space-y-3 font-mono text-xs text-gray-300">
          <div className="flex justify-between"><span>Package Name:</span> <span className="font-bold text-white">{success.planName}</span></div>
          <div className="flex justify-between"><span>Principal Locked:</span> <CurrencyDisplay amount={success.principalAmount} currency="USD" className="text-white font-bold" /></div>
          <div className="flex justify-between"><span>Disbursement Policy:</span> <span className="font-bold text-brand-blue">{success.payoutPolicy}</span></div>
          <div className="flex justify-between"><span>Start Date (UTC):</span> <span>{new Date(success.startDate).toLocaleString()}</span></div>
          <div className="flex justify-between text-emerald-400 pt-2 border-t border-[#20283E] font-extrabold text-sm">
            <span>Scheduled Maturity Date:</span>
            <span>{new Date(success.maturityDate).toLocaleDateString()}</span>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed font-sans bg-brand-blue/10 p-4 rounded-xl border border-brand-blue/30">
          Your double-entry accounting ledger has been debited and your capital is now compounding. Because we enforced the **Active Investment Allocation Referral Trigger**, any eligible affiliate commission has just vested automatically!
        </p>

        <div className="flex gap-4 pt-2 font-sans">
          <a href="/dashboard/investments" className="flex-1">
            <Button variant="primary" size="lg" className="w-full">View Active Ledgers &rarr;</Button>
          </a>
          <a href="/dashboard" className="flex-1">
            <Button variant="secondary" size="lg" className="w-full">Return to Dashboard</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between border-b border-[#20283E] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue font-mono">Dedicated Checkout Portal</span>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl font-sans tracking-tight mt-1">Confirm Plan Allocation</h1>
        </div>
        <a href="/dashboard/investments">
          <Button variant="secondary" size="sm">&larr; Back to Packages</Button>
        </a>
      </div>

      {error && <div className="rounded-xl border border-red-500/50 bg-red-950/60 p-4 text-xs font-bold text-red-400 font-mono">{error}</div>}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-start">
        <div className="rounded-2xl border border-[#20283E] bg-[#131824] overflow-hidden shadow-tesla">
          <div className="relative h-48 w-full bg-black">
            <SafeImage src={plan.imageUrl || '/branding/car-bronze.jpg'} alt={plan.name} fill sizes="(max-width: 768px) 100vw, 480px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131824] via-[#131824]/20 to-transparent" />
            <span className="absolute top-3 left-3 rounded-lg border border-white/20 bg-black/80 px-3 py-1 text-xs font-extrabold text-white font-mono shadow">
              {plan.profitText || '40% Profit'}
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-extrabold text-white font-sans">{plan.name}</h2>
              <span className="text-sm font-mono font-bold text-emerald-400">{plan.annualPercentageRate} APR</span>
            </div>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">{plan.description}</p>

            <div className="rounded-xl bg-[#0B0E14] p-4 border border-[#20283E] space-y-2 font-mono text-xs text-gray-300">
              <div className="flex justify-between"><span>Duration:</span> <strong className="text-white">{plan.termDays} Days</strong></div>
              <div className="flex justify-between"><span>Min Deposit:</span> <strong className="text-emerald-400">${parseFloat(plan.minDepositUsd).toLocaleString()} USD</strong></div>
              <div className="flex justify-between"><span>Max Deposit:</span> <strong className="text-white">${parseFloat(plan.maxDepositUsd).toLocaleString()} USD</strong></div>
              <div className="flex justify-between text-brand-blue pt-1 border-t border-[#20283E]"><span>Policy:</span> <strong>Lump Sum at Term End</strong></div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#20283E] font-sans text-xs text-gray-200">
              {(plan.features || ['Portfolio Access', 'Investment Dashboard', 'Email Support']).map((feat: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-blue/20 text-brand-blue font-bold text-[10px]">✔</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleConfirmAllocation} className="rounded-2xl border border-[#20283E] bg-[#131824] p-7 shadow-tesla space-y-6">
          <div className="border-b border-[#20283E] pb-4">
            <h3 className="text-lg font-extrabold text-white font-sans">Set Capital Allocation</h3>
            <p className="text-xs text-gray-400 font-mono mt-1">Enter exact fixed-point amount within allowed bounds.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 font-mono mb-2">
              Allocation Amount (`NUMERIC(20,8)`)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 font-mono font-bold text-gray-400">$</span>
              <input
                type="number"
                step="any"
                min={parseFloat(plan.minDepositUsd)}
                max={parseFloat(plan.maxDepositUsd)}
                required
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                className="w-full rounded-xl border border-[#20283E] bg-[#0B0E14] pl-9 pr-4 py-3.5 text-base font-mono font-extrabold text-white focus:border-red-500 focus:outline-none shadow-inner"
              />
            </div>
          </div>

          <div className="rounded-xl bg-[#0B0E14] p-5 border border-emerald-500/30 shadow-inner space-y-3 font-mono">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">Projected Maturity Calculation (`DecimalUtil`)</span>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Principal:</span>
              <span className="text-white font-bold">${parseFloat(amountUsd || '0').toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Term Duration:</span>
              <span className="text-white font-bold">{plan.termDays} Days</span>
            </div>
            <div className="flex justify-between items-baseline text-sm pt-3 border-t border-[#20283E]">
              <span className="text-gray-200 font-bold font-sans">Est. Lump-Sum Return:</span>
              <CurrencyDisplay amount={projectedReturn()} currency="USD" className="text-emerald-400 font-extrabold text-xl" />
            </div>
          </div>

          <Button
            type="submit"
            variant="tesla-red"
            size="lg"
            className="w-full py-4 text-sm font-extrabold uppercase tracking-wider shadow-red-glow"
            isLoading={allocating}
          >
            Confirm &amp; Lock Capital in Pool &rarr;
          </Button>

          <p className="text-[11px] text-gray-500 text-center font-sans">
            By clicking confirm, your double-entry ledger will instantly debit your liquid USD balance and move funds into locked balance compounding.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function DedicatedPlanCheckoutPageWrapper() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center font-mono text-xs text-gray-400 uppercase tracking-wider animate-pulse">Loading Dedicated Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
