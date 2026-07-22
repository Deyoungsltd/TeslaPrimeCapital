'use client';
import { SafeImage } from '@/components/atoms/SafeImage';

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
    <div className="flex flex-col justify-between rounded-2xl border border-[#1E2433] bg-[#111520] shadow-tesla transition-all duration-300 hover:border-red-500/50 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] group overflow-hidden">
      {/* Horizontal Vehicle Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-black">
        <SafeImage
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 320px"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105 opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-[#111520]/30 to-transparent" />

        <div className="absolute top-3 right-3 z-10">
          <span className="rounded-md border border-white/15 bg-black/80 px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-red-400 backdrop-blur-md">
            {profitText}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-6 flex-1 flex flex-col justify-between bg-[#111520]">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-extrabold tracking-tight text-white font-sans group-hover:text-[#EF4444] transition-colors">
              {name}
            </h3>
            <span className="flex-shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 pt-1.5">
              {termDays}D Term
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans min-h-[36px]">
            {description}
          </p>
        </div>

        <div className="pt-4 border-t border-[#1E2433]/80">
          <div className="text-2xl font-extrabold text-white tracking-tight font-sans">
            ${parseFloat(minDepositUsd).toLocaleString()}
          </div>
          <span className="font-mono text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mt-1">
            Minimum Allocation
          </span>
        </div>

        {/* Precision SVG Checkmarks */}
        <div className="space-y-3 pt-1 font-sans text-xs text-gray-300">
          {featList.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-semibold">{feat}</span>
            </div>
          ))}
        </div>

        {/* Dedicated Page Navigation CTA */}
        <div className="pt-4">
          <a href={`/dashboard/investments/checkout?planId=${planId}`} className="block w-full">
            <button
              type="button"
              className="w-full h-11 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Allocate Capital
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};
