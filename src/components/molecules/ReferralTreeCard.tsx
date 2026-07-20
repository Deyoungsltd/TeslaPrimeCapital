import React, { useState } from 'react';
import { CurrencyDisplay } from '../atoms/CurrencyDisplay';
import { Button } from '../atoms/Button';

export interface IReferralSummary {
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
  totalEarnedUsd: string;
  pendingVestingUsd: string;
}

export const ReferralTreeCard: React.FC<{ referralCode: string; referralLink: string; summary: IReferralSummary }> = ({
  referralCode,
  referralLink,
  summary,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(`https://${referralLink}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback if clipboard API restricted
    }
  };

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-2xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-800 pb-6 md:flex-row md:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">Affiliate Partnership Link</span>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-sm text-white">
            <span className="rounded bg-black p-2.5 text-gray-300 border border-gray-800 select-all break-all">
              https://{referralLink}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Share this link or your unique code (<strong className="text-white font-mono">{referralCode}</strong>). Enforces approved policy: **Active Investment Allocation Trigger** (`Tier 1: 5%, Tier 2: 2%, Tier 3: 1%`).
          </p>
        </div>
        <div>
          <Button variant="primary" size="md" onClick={handleCopy}>
            {copied ? '✓ Copied Link to Clipboard' : 'Copy Partnership URL'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-center">
        <div className="rounded-lg bg-gray-900/60 p-3 border border-gray-800">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Direct (Tier 1 - 5%)</span>
          <span className="mt-1 block text-2xl font-extrabold text-white font-mono">{summary.tier1Count}</span>
        </div>
        <div className="rounded-lg bg-gray-900/60 p-3 border border-gray-800">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Sub (Tier 2 - 2%)</span>
          <span className="mt-1 block text-2xl font-extrabold text-gray-300 font-mono">{summary.tier2Count}</span>
        </div>
        <div className="rounded-lg bg-gray-900/60 p-3 border border-gray-800">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Extended (Tier 3 - 1%)</span>
          <span className="mt-1 block text-2xl font-extrabold text-gray-400 font-mono">{summary.tier3Count}</span>
        </div>
        <div className="rounded-lg bg-emerald-950/20 p-3 border border-emerald-500/30">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">Credited Volume (`USD`)</span>
          <span className="mt-1 block text-lg font-extrabold text-emerald-400 font-mono">
            <CurrencyDisplay amount={summary.totalEarnedUsd} currency="USD" showSymbol={false} />
          </span>
        </div>
        <div className="rounded-lg bg-amber-950/20 p-3 border border-amber-500/30">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending Vesting (`USD`)</span>
          <span className="mt-1 block text-lg font-extrabold text-amber-400 font-mono">
            <CurrencyDisplay amount={summary.pendingVestingUsd} currency="USD" showSymbol={false} />
          </span>
        </div>
      </div>
    </div>
  );
};
