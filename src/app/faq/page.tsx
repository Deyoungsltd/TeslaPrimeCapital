import React from 'react';
import type { Metadata } from 'next';
import { APP_CONFIG } from '@/config/app.config';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';

export const metadata: Metadata = {
  title: 'FAQ — TeslaPrimeCapital',
  description: 'Detailed answers on settlement, verification, funding, withdrawals, referrals, and platform security.',
};

const FAQS = [
  {
    q: 'When is my capital settled?',
    a: 'Under the Lump-Sum Maturity Policy, daily compounding yield accrues off-ledger for the entire term of your plan. At 00:00 UTC on maturity day, your principal plus the full compounded yield is credited to your available wallet in a single settlement. Nothing pays out early; nothing is held late.',
  },
  {
    q: 'Can I exit a plan before it matures?',
    a: 'No. Allocations are term-locked from the moment you confirm at checkout — 3, 7, 14, or 24 days depending on the pool. The term and the fixed maturity date are shown before you commit. Only allocate capital you can comfortably lock for the full duration.',
  },
  {
    q: 'Can I allocate before completing identity verification?',
    a: 'Yes. Tier-0 clearance is granted automatically at registration and permits cumulative allocations up to $1,000 USD equivalent. Tier-1 verification — government-issued ID plus a selfie match — is required before any withdrawal and before deposits above the ceiling. Tier-2 opens the flagship Diamond pool from $50,000.',
  },
  {
    q: 'Which currencies can I deposit and withdraw?',
    a: 'Eight settlement rails are supported on one account: USD, EUR, GBP, and JPY on fiat rails; BTC, ETH, USDT, and USDC on digital rails. Balances across all currencies are normalized under one fixed-point ledger, shown side-by-side in your terminal.',
  },
  {
    q: 'How long do deposits take to credit?',
    a: 'Fiat deposits credit after confirmation by the originating rail; digital-asset deposits credit after the required network confirmations for the chain used (Bitcoin, Ethereum, or TRC20/ERC20 for stablecoins). Every confirmation step is visible as a ledger event in your transaction history.',
  },
  {
    q: 'How are withdrawals processed?',
    a: 'Funds lock instantly when you submit the request, then enter a pending-review queue. A finance manager authorizes the release with two-factor TOTP attestation — there is no automated gateway disbursement on this platform. First-time destinations may receive an additional verification contact.',
  },
  {
    q: 'How is the daily yield actually calculated?',
    a: 'The accrual engine runs at 00:00 UTC daily. For each active position it compounds the position value at the plan’s fixed daily rate and writes one AccrualLog record per run. Your accumulated yield is visible in the terminal at all times, but it settles into spendable balance only at maturity.',
  },
  {
    q: 'How does the referral program pay?',
    a: 'Three tiers: 5% on direct partners, 2% on their partners, and 1% on the third level — measured on qualifying allocated amounts. Commissions vest only when referred capital allocates into a structured plan, never on sign-ups alone, and credit to your USD wallet automatically.',
  },
  {
    q: 'What fees does the platform charge?',
    a: 'No management fee, no performance fee, no custody fee. Digital-asset withdrawals carry only the network fee required by the chain itself at broadcast time. If that ever changes, the fee schedule will be published before any change takes effect.',
  },
  {
    q: 'How is my account actually secured?',
    a: 'Passwords are Argon2id-hashed; session and two-factor secrets are AES-256-GCM encrypted; sessions use short-lived access tokens with rotating refresh tokens; sensitive release actions in the admin layer require two-factor attestation and are written to an immutable audit log. You can additionally enable TOTP two-factor authentication on your own login at any time.',
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#EF4444] selection:text-white">
      <MarketingHeader activePath="/faq" />

      <main className="mx-auto max-w-4xl px-6 sm:px-12 py-20">
        <div className="space-y-4 pb-14">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#EF4444]" />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
              Intelligence
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Answers, before you ask
          </h1>
          <p className="max-w-2xl text-sm text-gray-400 leading-relaxed">
            Ten questions we hear most. If yours is not listed, a human reads every message sent to {APP_CONFIG.supportEmail}.
          </p>
        </div>

        <div className="divide-y divide-[#1E2433] border-y border-[#1E2433]">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-6 px-1 cursor-pointer">
              <summary className="flex items-center justify-between gap-6 list-none">
                <span className="text-sm sm:text-base font-bold text-white group-hover:text-[#EF4444] transition-colors">
                  {item.q}
                </span>
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[#2C354C] text-gray-400 transition-transform duration-300 group-open:rotate-45">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-4 pr-10 text-xs sm:text-sm text-gray-400 leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-14 flex flex-col sm:flex-row items-center gap-4">
          <a href="/register" className="w-full sm:w-auto">
            <button className="w-full sm:w-[240px] h-12 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] hover:-translate-y-0.5">
              Open an Account
            </button>
          </a>
          <a href="/plans" className="w-full sm:w-auto">
            <button className="w-full sm:w-[220px] h-12 rounded-lg border border-white/15 bg-white/5 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5">
              Review the Plans
            </button>
          </a>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
