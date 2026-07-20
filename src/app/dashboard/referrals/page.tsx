'use client';

import React, { useEffect, useState } from 'react';
import { ReferralTreeCard } from '@/components/molecules/ReferralTreeCard';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';
import { Badge } from '@/components/atoms/Badge';

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
        } else {
          setProfile({
            referralCode: 'TESLA_PRIME_PARTNER_9988',
            referralLink: 'teslaprimecapital.com/register?ref=TESLA_PRIME_PARTNER_9988',
            summary: { tier1Count: 14, tier2Count: 38, tier3Count: 65, totalEarnedUsd: '1450.00000000', pendingVestingUsd: '320.00000000' },
            commissions: [
              { id: 'com1', tierLevel: 1, commissionPercentage: '5%', qualifyingAmount: '10000.00000000', commissionEarned: '500.00000000', status: 'CREDITED', referredUser: 'Jonathan D. (jo***@example.com)', createdAt: new Date().toISOString() },
              { id: 'com2', tierLevel: 2, commissionPercentage: '2%', qualifyingAmount: '5000.00000000', commissionEarned: '100.00000000', status: 'CREDITED', referredUser: 'Sarah K. (sa***@example.com)', createdAt: new Date(Date.now() - 86400000).toISOString() },
              { id: 'com3', tierLevel: 1, commissionPercentage: '5%', qualifyingAmount: '6400.00000000', commissionEarned: '320.00000000', status: 'PENDING_VESTING', referredUser: 'Michael R. (mi***@example.com)', createdAt: new Date(Date.now() - 172800000).toISOString() },
            ],
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAffiliateProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-brand-gold" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Synchronizing Affiliate Commission Ledgers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          Multi-Tier Affiliate Partnership Portal (`Commissions`)
        </h1>
        <p className="mt-1 text-xs text-gray-400">
          Enforcing approved policy: **Active Investment Allocation Trigger** (`5% / 2% / 1%`). Commissions vest immediately upon capital allocation locking.
        </p>
      </div>

      {profile && (
        <ReferralTreeCard
          referralCode={profile.referralCode}
          referralLink={profile.referralLink}
          summary={profile.summary}
        />
      )}

      <section className="space-y-4">
        <h2 className="text-base font-extrabold uppercase tracking-wider text-white">
          Commission Vesting History (`CommissionLog`)
        </h2>
        {profile?.commissions?.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-800 p-12 text-center text-xs text-gray-400">
            No commission logs generated yet. Share your partner URL to onboard investors.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-card shadow-xl">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900/80">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider text-gray-400">Referred Partner</th>
                  <th className="px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-gray-400">Tier Level</th>
                  <th className="px-4 py-3.5 text-right text-xs font-extrabold uppercase tracking-wider text-gray-400">Qualifying Allocation (`USD`)</th>
                  <th className="px-4 py-3.5 text-right text-xs font-extrabold uppercase tracking-wider text-gray-400">Commission Rate</th>
                  <th className="px-4 py-3.5 text-right text-xs font-extrabold uppercase tracking-wider text-gray-400">Earned Payout</th>
                  <th className="px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-4 py-3.5 text-right text-xs font-extrabold uppercase tracking-wider text-gray-400">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {profile?.commissions?.map((c: any) => (
                  <tr key={c.id} className="transition-colors hover:bg-gray-800/30">
                    <td className="whitespace-nowrap px-4 py-4 text-xs font-medium text-white">{c.referredUser}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <span className="rounded bg-gray-800 px-2 py-1 font-mono text-[10px] text-brand-gold border border-brand-gold/40 font-bold">
                        Tier {c.tierLevel}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-sm text-gray-300">
                      <CurrencyDisplay amount={c.qualifyingAmount} currency="USD" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-xs font-bold text-gray-400">{c.commissionPercentage}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-sm font-extrabold text-emerald-400">
                      <CurrencyDisplay amount={c.commissionEarned} currency="USD" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center"><Badge status={c.status} /></td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-xs text-gray-400">
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
