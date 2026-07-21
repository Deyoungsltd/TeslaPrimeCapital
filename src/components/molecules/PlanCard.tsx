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
  buttonColor?: 'blue' | 'red';
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
  buttonColor = 'red',
}) => {
  const featList = features && features.length > 0 ? features : ['Portfolio Access', 'Investment Dashboard', 'Email Support'];

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-[#1E2433] bg-[#111520] shadow-tesla transition-all duration-300 hover:border-red-500/60 group overflow-hidden">
      {/* 1. Horizontal Car Image Banner (`IMG_7582.jpeg` Match!) */}
      <div className="relative h-48 w-full overflow-hidden bg-black">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110 opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-[#111520]/30 to-transparent" />
        
        <div className="absolute top-3 right-3 flex items-center justify-between font-mono text-xs z-10">
          <span className="rounded-lg border border-white/20 bg-black/80 px-3 py-1 font-extrabold text-red-400 backdrop-blur-md shadow">
            {profitText}
          </span>
        </div>
      </div>

      {/* 2. Card Content & Checkmark Features (`IMG_7582.jpeg` match!) */}
      <div className="p-6 space-y-6 flex-1 flex flex-col justify-between bg-[#111520]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-extrabold tracking-tight text-white font-sans group-hover:text-[#EF4444] transition-colors">
              {name}
            </h3>
            <span className="text-xs font-mono font-bold text-gray-400">
              {termDays} Days Term
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans min-h-[36px]">
            {description}
          </p>
        </div>

        {/* Min / Max Range (`IMG_7555` match) */}
        <div className="pt-3 border-t border-[#1E2433]/80">
          <div className="text-2xl font-extrabold text-white tracking-tight font-sans">
            ${parseFloat(minDepositUsd).toLocaleString()}
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mt-0.5">
            minimum investment
          </span>
        </div>

        {/* Checkmark Features List (`IMG_7582.jpeg` checkmarks match!) */}
        <div className="space-y-3 pt-2 font-sans text-xs text-gray-200">
          {featList.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[11px] border border-emerald-500/40">
                ✔
              </span>
              <span className="font-semibold">{feat}</span>
            </div>
          ))}
        </div>

        {/* 3. Dedicated Page Navigation CTA Button (`No in-page modal! Strictly returns to dedicated page!`) */}
        <div className="pt-4">
          <a
            href={`/dashboard/investments/checkout?planId=${planId}`}
            className="block w-full"
          >
            <button
              type="button"
              className="w-full rounded-2xl bg-[#EF4444] py-4 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#DC2626] shadow-red-glow active:scale-[0.98]"
            >
              Invest Now →
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};
