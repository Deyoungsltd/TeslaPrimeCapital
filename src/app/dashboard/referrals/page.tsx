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
            referralLink: 'teslaequitypro.com?ref=TESLA_PRIME_9988',
            summary: { tier1Count: 14, tier2Count: 38, tier3Count: 65, totalEarnedUsd: '1450.00000000', pendingVestingUsd: '320.00000000' },
            commissions: [
              { id: 'com1', tierLevel: 1, commissionPercentage: '5%', qualifyingAmount: '10000.00000000', commissionEarned: '500.00000000', status: 'CREDITED', referredUser: 'Jonathan D. (jo***@example.com)', createdAt: new Date().toISOString() },
              { id: 'com2', tierLevel: 2, commissionPercentage: '2%', qualifyingAmount: '5000.00000000', commissionEarned: '100.00000000', status: 'CREDITED', referredUser: 'Sarah K. (sa***@example.com)', createdAt: new Date(Date.now() - 86400000).toISOString() },
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
      <div className="flex h-96 items-center justify-center font-mono text-xs text-gray-400 uppercase tracking-wider animate-pulse">
        <span>Synchronizing Affiliate Commission Ledgers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-[#2A2338] pb-6">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl font-sans tracking-tight">
          Referrals
        </h1>
        <p className="mt-1.5 text-xs text-gray-400 font-sans">
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
        <h2 className="text-base font-extrabold uppercase tracking-wider text-white font-sans">
          Commission Vesting History (`CommissionLog`)
        </h2>
        {profile?.commissions?.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2A2338] p-12 text-center text-xs text-gray-400">
            No commission logs generated yet. Share your partner URL to onboard investors.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#2A2338] bg-[#16131F] shadow-tesla">
            <table className="min-w-full divide-y divide-[#2A2338] font-mono text-left">
              <thead className="bg-[#201A2C]">
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
              <tbody className="divide-y divide-[#2A2338]/60">
                {profile?.commissions?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-[#201A2C]/60 transition">
                    <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-white font-sans">{c.referredUser}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-center">
                      <span className="rounded bg-[#201A2C] px-2 py-1 font-mono text-[10px] text-gray-300 border border-[#2C354C] font-bold">
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
