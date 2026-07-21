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
    <div className="relative overflow-hidden flex flex-col justify-between rounded-2xl border border-[#1E2433] bg-[#111520] p-6 shadow-tesla transition-all duration-200 hover:border-gray-600 group">
      <div className="space-y-4 z-10">
        <div className="flex items-center justify-between font-mono">
          <span className="rounded-md border border-[#2F374F] bg-[#1E2433] px-3 py-1 text-xs font-bold text-gray-200">
            {annualPercentageRate} Target
          </span>
          <span className="rounded-md bg-[#181D2D] border border-[#2C354C] px-2.5 py-1 text-xs font-bold text-gray-300">
            {termDays} Days Duration
          </span>
        </div>

        <div>
          <h3 className="text-2xl font-extrabold tracking-tight text-white font-sans">{name}</h3>
          <p className="mt-2 text-xs text-gray-300 leading-relaxed font-sans">{description}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-[#1E2433] pt-6 space-y-4 z-10 font-mono">
        <div className="space-y-1.5 text-xs text-gray-300">
          <div className="flex justify-between">
            <span>Min Capital:</span>
            <CurrencyDisplay amount={minDepositUsd} currency="USD" className="text-white font-bold" />
          </div>
          <div className="flex justify-between">
            <span>Max Capital:</span>
            <CurrencyDisplay amount={maxDepositUsd} currency="USD" className="text-white font-bold" />
          </div>
          <div className="flex justify-between text-gray-400 pt-1.5 border-t border-[#1E2433]">
            <span>Maturity Payout:</span>
            <span className="text-white font-bold">Lump Sum at Term End</span>
          </div>
        </div>

        {error && (
          <div className="rounded border border-red-500/40 bg-red-950/60 p-2.5 text-[11px] font-semibold text-red-400 font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleAllocateClick} className="space-y-3 pt-2 font-sans">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
              Allocation Amount (`NUMERIC(20,8)`)
            </label>
            <input
              type="text"
              required
              value={allocationAmount}
              onChange={(e) => setAllocationAmount(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#2C354C] bg-black px-3.5 py-2.5 text-sm font-mono text-white focus:border-red-500 focus:outline-none transition"
            />
          </div>

          <div className="flex justify-between items-center text-xs bg-black/80 p-3 rounded-lg border border-[#1E2433] font-mono">
            <span className="text-gray-400 font-sans font-medium text-[11px]">Est. Maturity Return:</span>
            <CurrencyDisplay amount={projectedReturn()} currency="USD" className="text-emerald-400 font-extrabold text-sm" />
          </div>

          <button
            type="submit"
            disabled={isAllocating}
            className="w-full rounded-lg bg-[#EF4444] py-3.5 text-sm font-bold tracking-wider text-white transition hover:bg-[#DC2626] shadow-red-glow"
          >
            {isAllocating ? 'Locking Capital...' : 'Invest Now'}
          </button>
        </form>
      </div>
    </div>
  );
};
