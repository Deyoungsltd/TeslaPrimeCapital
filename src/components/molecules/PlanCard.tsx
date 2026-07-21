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
}) => {
  const [allocationAmount, setAllocationAmount] = useState(minDepositUsd);
  const [isAllocating, setIsAllocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate projected lump-sum maturity return precisely using DecimalUtil
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
    <div className="flex flex-col justify-between rounded-xl border border-brand-border bg-brand-card p-6 shadow-2xl transition-all hover:border-brand-gold/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
            {requiresKycTier === 'TIER_0' ? 'Starter Plan (<$1k)' : `Verified ${requiresKycTier}`}
          </span>
          <span className="rounded-md bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-300">
            {termDays} Days Term
          </span>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white">{name}</h3>
          <p className="mt-1 text-xs text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-800 pt-6 space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-medium text-gray-400">Target APR</span>
          <span className="text-2xl font-extrabold text-brand-gold">{annualPercentageRate}</span>
        </div>

        <div className="space-y-1 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Min Capital:</span>
            <CurrencyDisplay amount={minDepositUsd} currency="USD" className="text-gray-200" />
          </div>
          <div className="flex justify-between">
            <span>Max Capital:</span>
            <CurrencyDisplay amount={maxDepositUsd} currency="USD" className="text-gray-200" />
          </div>
          <div className="flex justify-between text-brand-gold pt-1 border-t border-gray-800/60 font-semibold">
            <span>Maturity Payout:</span>
            <span>Lump Sum at Term End</span>
          </div>
        </div>

        {error && (
          <div className="rounded border border-red-500/40 bg-red-950/40 p-2 text-[11px] font-semibold text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleAllocateClick} className="space-y-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Allocation Amount (`NUMERIC(20,8)`)
            </label>
            <input
              type="text"
              required
              value={allocationAmount}
              onChange={(e) => setAllocationAmount(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm font-mono text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          <div className="flex justify-between text-xs bg-gray-900/60 p-2.5 rounded border border-gray-800 font-mono">
            <span className="text-gray-400 font-sans font-medium">Est. Maturity Total:</span>
            <CurrencyDisplay amount={projectedReturn()} currency="USD" className="text-emerald-400" />
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isAllocating}>
            Allocate Capital &rarr;
          </Button>
        </form>
      </div>
    </div>
  );
};
