'use client';

import React, { useEffect, useState } from 'react';
import { ReferralTreeCard } from '@/components/molecules/ReferralTreeCard';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';
import { Badge } from '@/components/atoms/Badge';
import { TradingViewAdvancedChart } from '@/components/organisms/tradingview/TradingViewAdvancedChart';
import { TradingViewTopStories } from '@/components/organisms/tradingview/TradingViewTopStories';
import { TradingViewSymbolOverview } from '@/components/organisms/tradingview/TradingViewSymbolOverview';
import { TradingViewMarketOverview } from '@/components/organisms/tradingview/TradingViewMarketOverview';

export default function MultiTierReferralsPage() {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAffiliateProfile = async () => {
      try {
        const res = await fetch('/api/v1/referrals/profile?page=1&limit=20');
        if (res.ok) {
          const body = await res.json();
          if (body.success && body.data) setProfile(body.data);
        }
      } catch {
        // Affiliate profile unreachable — render unavailable state, never fabricated tiers
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAffiliateProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-gray-400 uppercase tracking-wider animate-pulse">
        <span>Synchronizing Affiliate Commission Ledgers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-[#1E2433] pb-6">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl font-sans tracking-tight">
          Referrals
        </h1>
        <p className="mt-1.5 text-xs text-gray-400 font-sans">
          Enforcing approved policy: **Active Investment Allocation Trigger** (`5% / 2% / 1%`). Commissions vest immediately upon capital allocation locking.
        </p>
      </div>

      {profile ? (
        <ReferralTreeCard
          referralCode={profile.referralCode}
          referralLink={profile.referralLink}
          summary={profile.summary}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-[#1E2433] bg-[#111520]/50 p-10 text-center">
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider leading-relaxed">
            Affiliate profile temporarily unavailable.
            <br />
            <span className="text-gray-500">Your commission data will load automatically once the service reconnects.</span>
          </p>
        </div>
      )}

      {/* Live Advanced Candlestick Chart (`Tesla, Inc.` workstation match) */}
      <section className="rounded-2xl border border-[#1E2433] bg-[#111520] p-5 sm:p-6 shadow-tesla">
        <TradingViewAdvancedChart />
      </section>

      {/* TSLA Top Stories News Timeline (`Latest headlines` match) */}
      <section className="space-y-4">
        <h2 className="text-base font-extrabold text-white font-sans tracking-tight">
          TSLA <span className="text-gray-400 font-bold">Top Stories</span>
        </h2>
        <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-5 sm:p-6 shadow-tesla">
          <TradingViewTopStories />
        </div>
      </section>

      {/* Stock — Live Price & Area Sparkline (`Big-quote panel` match) */}
      <section className="space-y-4">
        <h2 className="text-base font-extrabold text-gray-300 font-sans tracking-tight">Stock</h2>
        <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-5 sm:p-6 shadow-tesla">
          <TradingViewSymbolOverview />
        </div>
      </section>

      {/* Market Overview — 12-Month Range Chart (`Dotted-grid line` match) */}
      <section className="space-y-4">
        <h2 className="text-base font-extrabold text-gray-300 font-sans tracking-tight">Market Overview</h2>
        <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-5 sm:p-6 shadow-tesla">
          <TradingViewMarketOverview />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-extrabold uppercase tracking-wider text-white font-sans">
          Commission Vesting History (`CommissionLog`)
        </h2>
        {profile?.commissions?.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1E2433] p-12 text-center text-xs text-gray-400">
            No commission logs generated yet. Share your partner URL to onboard investors.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#1E2433] bg-[#111520] shadow-tesla">
            <table className="min-w-full divide-y divide-[#1E2433] font-mono text-left">
              <thead className="bg-[#181D2D]">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Referred Partner</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Tier Level</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Qualifying Allocation (`USD`)</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Commission Rate</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Earned Payout</th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2433]/60">
                {profile?.commissions?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-[#181D2D]/60 transition">
                    <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-white font-sans">{c.referredUser}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-center">
                      <span className="rounded bg-[#181D2D] px-2 py-1 font-mono text-[10px] text-gray-300 border border-[#2C354C] font-bold">
                        Tier {c.tierLevel}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-sm text-gray-300">
                      <CurrencyDisplay amount={c.qualifyingAmount} currency="USD" />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-xs font-bold text-gray-400">{c.commissionPercentage}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-mono text-sm font-extrabold text-emerald-400">
                      <CurrencyDisplay amount={c.commissionEarned} currency="USD" />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-center"><Badge status={c.status} /></td>
                    <td className="whitespace-nowrap px-5 py-4 text-right text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
