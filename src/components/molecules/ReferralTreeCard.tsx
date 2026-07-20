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
      // Fallback
    }
  };

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-tesla space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-[#222226] pb-6 md:flex-row md:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue font-mono">Affiliate Partnership Link</span>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-sm text-white">
            <span className="rounded-md bg-[#18181b] p-3 text-gray-200 border border-[#27272a] select-all break-all">
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-center font-mono">
        <div className="rounded-lg bg-[#18181b] p-4 border border-[#27272a]">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Direct (Tier 1 - 5%)</span>
          <span className="mt-1 block text-2xl font-extrabold text-white">{summary.tier1Count}</span>
        </div>
        <div className="rounded-lg bg-[#18181b] p-4 border border-[#27272a]">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Sub (Tier 2 - 2%)</span>
          <span className="mt-1 block text-2xl font-extrabold text-gray-300">{summary.tier2Count}</span>
        </div>
        <div className="rounded-lg bg-[#18181b] p-4 border border-[#27272a]">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Extended (Tier 3 - 1%)</span>
          <span className="mt-1 block text-2xl font-extrabold text-gray-400">{summary.tier3Count}</span>
        </div>
        <div className="rounded-lg bg-emerald-950/20 p-4 border border-emerald-500/30">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">Credited Volume (`USD`)</span>
          <span className="mt-1 block text-lg font-extrabold text-emerald-400">
            <CurrencyDisplay amount={summary.totalEarnedUsd} currency="USD" showSymbol={false} />
          </span>
        </div>
        <div className="rounded-lg bg-amber-950/20 p-4 border border-amber-500/30">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending Vesting (`USD`)</span>
          <span className="mt-1 block text-lg font-extrabold text-amber-400">
            <CurrencyDisplay amount={summary.pendingVestingUsd} currency="USD" showSymbol={false} />
          </span>
        </div>
      </div>
    </div>
  );
};
