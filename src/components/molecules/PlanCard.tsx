'use client';
/**
 * TeslaPrimeCapital — Allocation Plan Card (`PlanCard.tsx`)
 *
 * Private-bank minimal: CMS-managed tier artwork, a single commanding APR
 * numeral in the display serif, disciplined spec rows on hairlines, and one
 * authoritative CTA. Every figure is read from the plan term sheet — nothing
 * decorative, nothing invented. Shared by the marketing plans grid, the
 * homepage preview, and the dashboard allocation surface.
 */
import { ManagedImage } from '@/components/atoms/ManagedImage';

import React from 'react';

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
  dailyRateNumeric?: string;
  compoundingAllowed?: boolean;
  payoutPolicy?: string;
  imageUrl?: string;
  profitText?: string;
  features?: string[];
  onAllocate?: (planId: string, amount: string) => Promise<void>;
  poolCapacityPct?: number;
  buttonColor?: 'blue' | 'red';
}

const SVG_CHECK = (
  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const KYC_TIER_LABELS: Record<string, string> = {
  TIER_0: 'Tier 0 · Entry',
  TIER_1: 'Tier 1 · Verified',
  TIER_2: 'Tier 2 · Institutional',
};

function formatUsd(value: string): string {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return value;
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function dailyRatePct(dailyRateNumeric?: string): string | null {
  if (!dailyRateNumeric) return null;
  const n = parseFloat(dailyRateNumeric);
  if (Number.isNaN(n)) return null;
  return `${(n * 100).toFixed(2)}%`;
}

export const PlanCard: React.FC<IPlanCardProps> = ({
  planId,
  name,
  description,
  minDepositUsd,
  maxDepositUsd,
  termDays,
  annualPercentageRate,
  requiresKycTier,
  dailyRateNumeric,
  compoundingAllowed,
  payoutPolicy,
  imageUrl,
  features = [],
  poolCapacityPct,
  buttonColor = 'red',
}) => {
  const dailyPct = dailyRatePct(dailyRateNumeric);
  const tierLabel = KYC_TIER_LABELS[requiresKycTier] ?? requiresKycTier;
  const ctaClasses =
    buttonColor === 'blue'
      ? 'from-[#3E6AE1] via-[#3461D8] to-[#2C52C8] shadow-[0_4px_25px_rgba(62,106,225,0.35)] hover:shadow-[0_8px_35px_rgba(62,106,225,0.55)]'
      : 'from-[#EF4444] via-[#E53E3E] to-[#DC2626] shadow-[0_4px_25px_rgba(239,68,68,0.35)] hover:shadow-[0_8px_35px_rgba(239,68,68,0.6)]';

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#1E2433] bg-[#111520] shadow-tesla transition-all duration-500 hover:-translate-y-1 hover:border-[#EF4444]/40 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]">
      {/* ── CMS-managed tier artwork ─────────────────────────────── */}
      <div className="relative h-48 w-full overflow-hidden bg-black sm:h-52">
        <ManagedImage
          slotKey={`plan.${planId}`}
          alt={`${name} tier artwork`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          fallbackSrc={imageUrl}
          className="object-cover object-center opacity-90 transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111520] via-[#111520]/25 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-white/15 bg-black/70 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-gray-200 backdrop-blur-md">
            {tierLabel}
          </span>
          <span className="rounded-md border border-white/15 bg-black/70 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-gray-200 backdrop-blur-md">
            {termDays}-Day Term
          </span>
        </div>
      </div>

      {/* ── Term sheet ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h3 className="font-display text-[26px] font-medium leading-snug tracking-tight text-white">
          {name}
        </h3>
        <p className="mt-3 text-[13px] leading-[1.7] text-gray-400 min-h-[66px]">{description}</p>

        {/* The numeral */}
        <div className="mt-6 flex items-end gap-4 border-b border-[#1E2433] pb-6">
          <span className="font-display text-[52px] font-medium leading-none tracking-tight text-white">
            {annualPercentageRate.replace(/\s*%$/, '')}
            <span className="text-[24px] text-gray-400">%</span>
          </span>
          <div className="pb-0.5">
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-gray-500">Per Annum</div>
            {dailyPct && (
              <div className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#EF4444]">
                {dailyPct} daily{dailyRateNumeric ? ' · 00:00 UTC' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Disciplined spec rows */}
        <dl className="mt-5 grid grid-cols-3 gap-x-4 gap-y-5">
          {[
            { k: 'Min Allocation', v: formatUsd(minDepositUsd) },
            { k: 'Max Allocation', v: formatUsd(maxDepositUsd) },
            { k: 'Term', v: `${termDays} days` },
            { k: 'Compounding', v: compoundingAllowed ? 'Daily' : 'Fixed base' },
            { k: 'Settlement', v: payoutPolicy === 'LUMP_SUM_MATURITY' ? 'Lump-sum' : payoutPolicy ?? 'Lump-sum' },
            { k: 'Clearance', v: tierLabel.split('·')[0].trim() },
          ].map((row) => (
            <div key={row.k}>
              <dt className="font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-gray-500">{row.k}</dt>
              <dd className="mt-1 text-[12px] font-semibold text-gray-200">{row.v}</dd>
            </div>
          ))}
        </dl>

        {/* System truths */}
        {features.length > 0 && (
          <ul className="mt-7 space-y-3 border-t border-[#1E2433] pt-6">
            {features.map((feat) => (
              <li key={feat} className="flex items-start gap-3 text-[11.5px] font-medium text-gray-300">
                <span className="mt-0.5 flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  {SVG_CHECK}
                </span>
                {feat}
              </li>
            ))}
          </ul>
        )}

        {/* Capacity meter when the caller tracks pool utilisation */}
        {typeof poolCapacityPct === 'number' && (
          <div className="mt-6">
            <div className="flex items-center justify-between font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500">
              <span>Pool utilisation</span>
              <span className="text-gray-300">{poolCapacityPct}%</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#1E2433]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, poolCapacityPct))}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-7 pt-1">
          <a href={`/dashboard/investments/checkout?planId=${planId}`} className="block w-full">
            <button
              type="button"
              className={`h-11 w-full rounded-lg bg-gradient-to-r font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${ctaClasses}`}
            >
              Allocate Capital
            </button>
          </a>
        </div>
      </div>
    </article>
  );
};
