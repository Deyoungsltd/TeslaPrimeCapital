import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { CurrencyDisplay } from '../atoms/CurrencyDisplay';
import { DecimalUtil } from '@/utils/decimal.util';

export interface IPlanCardProps {
  id: string;
  planId: string;
  name: string;
  description: string;
  minDepositUsd: string;
  maxDepositUsd: string;
  termDays: number;
  annualPercentageRate: string;
  requiresKycTier: string;
  onAllocate: (planId: string, amount: string) => Promise<void>;
  poolCapacityPct?: number;
}

export const PlanCard: React.FC<IPlanCardProps> = ({
  id,
  planId,
  name,
  description,
  minDepositUsd,
  maxDepositUsd,
  termDays,
  annualPercentageRate,
  requiresKycTier,
  onAllocate,
  poolCapacityPct = 86,
}) => {
  const [allocationAmount, setAllocationAmount] = useState(minDepositUsd);
  const [isAllocating, setIsAllocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectedReturn = () => {
    try {
      const dailyRate = DecimalUtil.div(annualPercentageRate.replace('%', ''), '36500');
      const totalYield = DecimalUtil.mul(allocationAmount, DecimalUtil.mul(dailyRate, termDays.toString()));
      return DecimalUtil.add(allocationAmount, totalYield);
    } catch {
      return allocationAmount;
    }
  };

  const handleAllocateClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAllocating(true);
    setError(null);
    try {
      await onAllocate(id, allocationAmount);
    } catch (err: any) {
      setError(err.message || 'Allocation failed.');
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div className="relative overflow-hidden flex flex-col justify-between rounded-2xl border border-brand-border bg-gradient-to-b from-[#181822] via-[#111116] to-[#0a0a0e] p-7 shadow-tesla transition-all duration-300 hover:border-brand-blue hover:shadow-blue-glow group">
      {/* Top Glass Highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="space-y-4 z-10">
        <div className="flex items-center justify-between font-mono">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {requiresKycTier === 'TIER_0' ? 'No KYC Required (<$1k)' : `Verified ${requiresKycTier}`}
          </span>
          <span className="rounded-md bg-[#1f1f2e] border border-white/15 px-2.5 py-1 text-xs font-bold text-gray-200">
            {termDays} Days Term
          </span>
        </div>

        <div>
          <h3 className="text-2xl font-extrabold tracking-tight text-white group-hover:text-brand-blue transition-colors">{name}</h3>
          <p className="mt-2 text-xs text-gray-300 leading-relaxed font-sans">{description}</p>
        </div>
      </div>

      {/* Live Pool Capacity Progress Ring & Metric */}
      <div className="mt-6 z-10 rounded-xl bg-black/60 p-4 border border-white/10 space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-gray-400">Pool Allocation Filled:</span>
          <span className="font-bold text-emerald-400">{poolCapacityPct}%</span>
        </div>
        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
          <div style={{ width: `${poolCapacityPct}%` }} className="bg-gradient-to-r from-brand-blue to-emerald-400 h-full rounded-full transition-all duration-500" />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
          <span>Active Contracts: 4,819</span>
          <span>Status: OPEN</span>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-6 space-y-4 z-10">
        <div className="flex justify-between items-baseline font-mono">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target APR</span>
          <span className="text-3xl font-extrabold tracking-tight text-white group-hover:scale-105 transition-transform">{annualPercentageRate}</span>
        </div>

        <div className="space-y-1.5 text-xs text-gray-400 font-mono">
          <div className="flex justify-between">
            <span>Min Capital:</span>
            <CurrencyDisplay amount={minDepositUsd} currency="USD" className="text-gray-200 font-bold" />
          </div>
          <div className="flex justify-between">
            <span>Max Capital:</span>
            <CurrencyDisplay amount={maxDepositUsd} currency="USD" className="text-gray-200 font-bold" />
          </div>
          <div className="flex justify-between text-brand-blue pt-1.5 border-t border-white/10 font-bold">
            <span>Maturity Payout:</span>
            <span>Lump Sum at Term End</span>
          </div>
        </div>

        {error && (
          <div className="rounded border border-red-500/40 bg-red-950/60 p-2.5 text-[11px] font-semibold text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleAllocateClick} className="space-y-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
              Allocation Amount (`NUMERIC(20,8)`)
            </label>
            <input
              type="text"
              required
              value={allocationAmount}
              onChange={(e) => setAllocationAmount(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-white/20 bg-black px-3 py-2 text-sm font-mono text-white focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition"
            />
          </div>

          <div className="flex justify-between items-center text-xs bg-black/80 p-3 rounded border border-white/10 font-mono">
            <span className="text-gray-400 font-sans font-medium text-[11px]">Est. Maturity Return:</span>
            <CurrencyDisplay amount={projectedReturn()} currency="USD" className="text-emerald-400 font-extrabold text-sm" />
          </div>

          <Button type="submit" variant="electric" size="lg" className="w-full" isLoading={isAllocating}>
            Allocate Capital &rarr;
          </Button>
        </form>
      </div>
    </div>
  );
};
