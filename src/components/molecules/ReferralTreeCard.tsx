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
    <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-6 shadow-tesla space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-[#1E2433] pb-6 md:flex-row md:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300 font-sans">Referral Link</span>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`https://${referralLink}`}
              className="w-full rounded-lg border border-[#2C354C] bg-black px-4 py-3 text-sm font-mono text-white select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex-shrink-0 rounded-lg border border-[#2C354C] bg-[#181D2D] p-3 text-gray-300 hover:border-white hover:text-white transition shadow-sm"
              title="Copy Link"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400 font-sans">
            Share this link or your unique code (<strong className="text-white font-mono">{referralCode}</strong>). Enforces approved policy: **Active Investment Allocation Trigger** (`Tier 1: 5%, Tier 2: 2%, Tier 3: 1%`).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-center font-mono">
        <div className="rounded-xl bg-[#080A0F] p-4 border border-[#1E2433]">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Direct (Tier 1 - 5%)</span>
          <span className="mt-1 block text-2xl font-extrabold text-white">{summary.tier1Count}</span>
        </div>
        <div className="rounded-xl bg-[#080A0F] p-4 border border-[#1E2433]">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Sub (Tier 2 - 2%)</span>
          <span className="mt-1 block text-2xl font-extrabold text-gray-300">{summary.tier2Count}</span>
        </div>
        <div className="rounded-xl bg-[#080A0F] p-4 border border-[#1E2433]">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Extended (Tier 3 - 1%)</span>
          <span className="mt-1 block text-2xl font-extrabold text-gray-400">{summary.tier3Count}</span>
        </div>
        <div className="rounded-xl bg-emerald-950/30 p-4 border border-emerald-500/30">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">Credited Volume (`USD`)</span>
          <span className="mt-1 block text-lg font-extrabold text-emerald-400">
            <CurrencyDisplay amount={summary.totalEarnedUsd} currency="USD" showSymbol={false} />
          </span>
        </div>
        <div className="rounded-xl bg-amber-950/30 p-4 border border-amber-500/30">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending Vesting (`USD`)</span>
          <span className="mt-1 block text-lg font-extrabold text-amber-400">
            <CurrencyDisplay amount={summary.pendingVestingUsd} currency="USD" showSymbol={false} />
          </span>
        </div>
      </div>
    </div>
  );
};
