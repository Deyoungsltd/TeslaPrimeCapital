import React from 'react';
import { CurrencyDisplay } from '../atoms/CurrencyDisplay';

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
  onAllocate?: (planId: string, amount: string) => Promise<void>;
  poolCapacityPct?: number;
  buttonColor?: 'blue' | 'red'; // Supports blue `[ Get Started ]` on landing / red `[ Invest Now ]` on dashboard (`IMG_7582` / `IMG_7555` match)
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
  poolCapacityPct = 88,
  buttonColor = 'blue',
}) => {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#20283E] bg-[#131824] shadow-tesla transition-all duration-300 hover:border-brand-blue hover:shadow-tesla-hover group overflow-hidden">
      {/* 1. Horizontal Car Image Banner (`IMG_7582.jpeg` Match!) */}
      <div className="relative h-48 w-full overflow-hidden bg-black">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110 opacity-95 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131824] via-[#131824]/30 to-transparent" />
        
        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-xs z-10">
          <span className="rounded-lg border border-white/20 bg-black/80 px-3 py-1 font-extrabold text-white backdrop-blur-md shadow">
            {profitText}
          </span>
          <span className="rounded-lg bg-brand-blue px-3 py-1 font-extrabold text-white backdrop-blur-md shadow-blue-glow">
            {termDays} Days Term
          </span>
        </div>
      </div>

      {/* 2. Card Content & Checkmark Features (`IMG_7582.jpeg` match!) */}
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between bg-[#131824]">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-extrabold tracking-tight text-white font-sans group-hover:text-brand-blue transition-colors">
              {name}
            </h3>
            <span className="text-xs font-mono font-bold text-gray-400">
              {annualPercentageRate} APR
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans min-h-[36px]">
            {description}
          </p>
        </div>

        {/* Min / Max Range (`IMG_7555` match) */}
        <div className="rounded-xl bg-[#0B0E14] p-3.5 border border-[#20283E] space-y-1.5 font-mono text-xs">
          <div className="flex justify-between font-bold">
            <span className="text-gray-400">Min Capital:</span>
            <span className="text-emerald-400 font-extrabold">${parseFloat(minDepositUsd).toLocaleString()} USD</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-gray-400">Max Capital:</span>
            <span className="text-white font-extrabold">${parseFloat(maxDepositUsd).toLocaleString()} USD</span>
          </div>
        </div>

        {/* Checkmark Features List (`IMG_7582.jpeg` checkmarks match!) */}
        <div className="space-y-2.5 pt-2 font-sans text-xs text-gray-200">
          {(features && features.length > 0 ? features : ['Portfolio Access', 'Investment Dashboard', 'Email Support']).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue/20 text-brand-blue font-extrabold text-[11px] border border-brand-blue/40">
                ✔
              </span>
              <span className="font-semibold">{feat}</span>
            </div>
          ))}
        </div>

        {/* Live Pool Allocation Progress Bar */}
        <div className="pt-3 border-t border-[#20283E] space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between text-gray-400">
            <span>Pool Allocation:</span>
            <span className="font-bold text-brand-blue">{poolCapacityPct}% Filled</span>
          </div>
          <div className="w-full bg-[#0B0E14] h-2 rounded-full overflow-hidden border border-[#20283E]">
            <div style={{ width: `${poolCapacityPct}%` }} className="bg-gradient-to-r from-brand-blue to-emerald-400 h-full rounded-full" />
          </div>
        </div>

        {/* 3. Dedicated Page Navigation CTA Button (`No in-page modal! Strictly returns to dedicated page!`) */}
        <div className="pt-4">
          <a
            href={`/dashboard/investments/checkout?planId=${planId}`}
            className="block w-full"
          >
            <button
              type="button"
              className={`w-full rounded-xl py-4 text-xs font-extrabold uppercase tracking-wider text-white transition-all shadow-md active:scale-[0.98] ${
                buttonColor === 'red'
                  ? 'bg-[#EF4444] hover:bg-[#DC2626] shadow-red-glow border border-red-400/30'
                  : 'bg-brand-blue hover:bg-brand-blueHover shadow-blue-glow border border-blue-400/30'
              }`}
            >
              {buttonColor === 'red' ? 'Invest Now →' : 'Get Started →'}
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};
