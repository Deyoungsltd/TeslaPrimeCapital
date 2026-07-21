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
    <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#181824] to-[#111116] p-7 shadow-tesla space-y-8">
      <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 md:flex-row md:items-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue font-mono">Affiliate Partnership Link</span>
          <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-sm text-white">
            <span className="rounded-xl bg-black px-4 py-3 text-gray-200 border border-white/20 select-all break-all shadow-inner font-bold">
              https://{referralLink}
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400 font-sans">
            Share this link or your unique code (<strong className="text-white font-mono">{referralCode}</strong>). Enforces approved policy: **Active Investment Allocation Trigger** (`Tier 1: 5%, Tier 2: 2%, Tier 3: 1%`).
          </p>
        </div>
        <div>
          <Button variant="electric" size="lg" onClick={handleCopy}>
            {copied ? '✓ Copied Link to Clipboard' : 'Copy Partnership URL'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-center font-mono">
        <div className="rounded-xl bg-black/70 p-5 border border-white/15 shadow-md">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Direct (Tier 1 - 5%)</span>
          <span className="mt-2 block text-3xl font-extrabold text-white">{summary.tier1Count}</span>
        </div>
        <div className="rounded-xl bg-black/70 p-5 border border-white/15 shadow-md">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Sub (Tier 2 - 2%)</span>
          <span className="mt-2 block text-3xl font-extrabold text-gray-300">{summary.tier2Count}</span>
        </div>
        <div className="rounded-xl bg-black/70 p-5 border border-white/15 shadow-md">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Extended (Tier 3 - 1%)</span>
          <span className="mt-2 block text-3xl font-extrabold text-gray-400">{summary.tier3Count}</span>
        </div>
        <div className="rounded-xl bg-emerald-950/40 p-5 border border-emerald-500/40 shadow-emerald-glow">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">Credited Volume (`USD`)</span>
          <span className="mt-2 block text-xl font-extrabold text-emerald-400">
            <CurrencyDisplay amount={summary.totalEarnedUsd} currency="USD" showSymbol={false} />
          </span>
        </div>
        <div className="rounded-xl bg-amber-950/40 p-5 border border-amber-500/40 shadow-md">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending Vesting (`USD`)</span>
          <span className="mt-2 block text-xl font-extrabold text-amber-400">
            <CurrencyDisplay amount={summary.pendingVestingUsd} currency="USD" showSymbol={false} />
          </span>
        </div>
      </div>
    </div>
  );
};
