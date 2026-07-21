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
  imageUrl?: string;
  profitText?: string;
  features?: string[];
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
  imageUrl = '/branding/car-bronze.jpg',
  profitText = '$1,000 minimum investment',
  features = ['Portfolio Access', 'Investment Dashboard', 'Email Support'],
  onAllocate,
  poolCapacityPct = 86,
}) => {
  const [allocationAmount, setAllocationAmount] = useState(minDepositUsd);
  const [isAllocating, setIsAllocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllocateModal, setShowAllocateModal] = useState(false);

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
      setShowAllocateModal(false);
    } catch (err: any) {
      setError(err.message || 'Allocation failed.');
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div className="relative overflow-hidden flex flex-col justify-between rounded-2xl border border-[#1E2433] bg-[#111520] shadow-tesla transition-all duration-300 hover:border-brand-blue/60 group">
      {/* 1. Horizontal Car Image Header (`IMG_7582.jpeg` match!) */}
      <div className="relative h-48 w-full overflow-hidden bg-black/60">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110 opacity-95 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-[#111520]/20 to-transparent" />
        
        {/* Top Pills */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-xs">
          <span className="rounded-md border border-white/20 bg-black/70 px-2.5 py-1 font-bold text-white backdrop-blur-md">
            {profitText}
          </span>
          <span className="rounded-md bg-brand-blue/80 px-2.5 py-1 font-bold text-white backdrop-blur-md shadow-sm">
            {termDays} Days Term
          </span>
        </div>
      </div>

      {/* 2. Card Content & Checkmark Features (`IMG_7582.jpeg` match!) */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="text-2xl font-extrabold tracking-tight text-white font-sans group-hover:text-brand-blue transition-colors">
            {name}
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed font-sans min-h-[36px]">
            {description}
          </p>
        </div>

        {/* Checkmark Features List (`IMG_7582.jpeg` checkmarks match!) */}
        <div className="space-y-2 pt-3 border-t border-[#1E2433]/80 font-sans text-xs text-gray-300">
          {(features && features.length > 0 ? features : ['Portfolio Access', 'Investment Dashboard', 'Email Support']).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                ✔
              </span>
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Live Pool Capacity Progress Bar */}
        <div className="pt-3 border-t border-[#1E2433]/80 space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between text-gray-400">
            <span>Pool Allocation:</span>
            <span className="font-bold text-emerald-400">{poolCapacityPct}% Filled</span>
          </div>
          <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-[#2C354C]">
            <div style={{ width: `${poolCapacityPct}%` }} className="bg-gradient-to-r from-brand-blue to-emerald-400 h-full rounded-full" />
          </div>
        </div>

        {/* Action CTA Button (`IMG_7582.jpeg` Get Started match!) */}
        <div className="pt-4">
          <button
            onClick={() => setShowAllocateModal(true)}
            className="w-full rounded-xl bg-brand-blue py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-brand-blueHover shadow-md group-hover:scale-[1.02]"
          >
            Get Started &rarr;
          </button>
        </div>
      </div>

      {/* Allocation Modal Popup */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
          <div className="w-full max-w-md rounded-2xl border border-[#2C354C] bg-[#111520] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E2433] pb-3">
              <h3 className="text-lg font-extrabold text-white">Allocate Capital: {name}</h3>
              <button type="button" onClick={() => setShowAllocateModal(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="bg-black p-4 rounded-xl border border-[#1E2433] space-y-2 font-mono text-xs text-gray-300">
              <div className="flex justify-between"><span>Target Return:</span> <span className="font-bold text-emerald-400">{annualPercentageRate} APR ({profitText})</span></div>
              <div className="flex justify-between"><span>Term Length:</span> <span className="font-bold text-white">{termDays} Days</span></div>
              <div className="flex justify-between"><span>Allowed Limits:</span> <span className="font-bold text-gray-200">${minDepositUsd} - ${maxDepositUsd} USD</span></div>
              <div className="flex justify-between text-brand-blue pt-1 border-t border-[#1E2433]"><span>Maturity Payout:</span> <span className="font-bold">Lump Sum at Term End</span></div>
            </div>

            {error && <div className="rounded-lg border border-red-500/40 bg-red-950/60 p-3 text-xs font-bold text-red-400">{error}</div>}

            <form onSubmit={handleAllocateClick} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5 font-mono">
                  Exact Allocation Amount (`NUMERIC(20,8)`)
                </label>
                <input
                  type="text"
                  required
                  value={allocationAmount}
                  onChange={(e) => setAllocationAmount(e.target.value)}
                  className="w-full rounded-lg border border-[#2C354C] bg-black px-4 py-3 text-sm font-mono text-white focus:border-brand-blue focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center text-xs bg-[#181D2D] p-3 rounded-lg border border-[#2C354C] font-mono">
                <span className="text-gray-400 font-sans font-medium text-[11px]">Est. Lump-Sum Return:</span>
                <CurrencyDisplay amount={projectedReturn()} currency="USD" className="text-emerald-400 font-extrabold text-sm" />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="electric" size="md" className="flex-1" isLoading={isAllocating}>
                  Confirm Allocation &rarr;
                </Button>
                <Button type="button" variant="secondary" size="md" onClick={() => setShowAllocateModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
