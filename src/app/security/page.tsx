import React from 'react';
import type { Metadata } from 'next';
import { buildMarketingMetadata } from '@/lib/seo';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';

export const metadata: Metadata = buildMarketingMetadata(
  'Security Practices',
  'How TeslaPrimeCapital protects accounts, balances, and documents: mandatory two-factor treasury sign-off, deterministic double-entry ledgers, encrypted document custody, and session revocation.',
  '/security',
);

const PILLARS: { title: string; intro: string; points: string[] }[] = [
  {
    title: 'Treasury Custody',
    intro: 'Money moves only when a verified human says so.',
    points: [
      'Every withdrawal locks funds instantly, then waits for manual review — 100% of requests, no exceptions.',
      'Disbursements and deposit settlements require a 6-digit TOTP code from an authorized finance officer, verified server-side.',
      'All balance arithmetic runs in fixed-point decimal (NUMERIC(20,8)) inside atomic database transactions guarded by distributed locks.',
      'Every administrative action is written to an append-only audit ledger with the acting officer, timestamp, and before/after values.',
    ],
  },
  {
    title: 'Account Protection',
    intro: 'Your session is sealed to your device and your authenticator.',
    points: [
      'Passwords are hashed with Argon2id — the current memory-hard reference standard — never stored or logged.',
      'Two-factor authentication (TOTP authenticator apps) is mandatory before any withdrawal can be requested.',
      'Sessions carry device fingerprints; signing out of all devices triggers instantaneous global session revocation.',
      'One-time verification codes are short-lived and single-use; they are never emailed twice or stored in plain text.',
    ],
  },
  {
    title: 'Document Custody',
    intro: 'Identity documents live behind authenticated delivery, not public URLs.',
    points: [
      'KYC uploads land in authenticated cloud folders — inaccessible without a signed, time-limited delivery URL.',
      'Compliance previews expire after 300 seconds and are watermarked with the viewing officer\'s identity.',
      'Every document view by staff writes an immutable audit entry.',
      'Originals are encrypted at rest by the storage provider and transmitted exclusively over TLS.',
    ],
  },
  {
    title: 'Platform Integrity',
    intro: 'The application limits itself as strictly as it limits attackers.',
    points: [
      'Content-Security-Policy and strict transport headers constrain every page to its declared origins.',
      'Financial mutations are idempotent — a retried request can never double-credit or double-debit.',
      'Real-time features use scoped in-memory channels; no third party observes your balances.',
      'The public status page reads the same health probes our monitors use — degraded states are published, not hidden.',
    ],
  },
];

const GOLDEN_RULES: string[] = [
  'TeslaPrimeCapital staff will never ask for your password or your 6-digit authenticator codes — not by email, chat, or phone.',
  'Desk messages reach you three ways: inside your Support Desk thread, as an in-app notification, and as a desk-letter email. Anything else claiming to be us is not.',
  'Verify every URL you sign in from. Bookmark the platform and distrust lookalike domains, sponsored ads, and unsolicited "support" outreach.',
  'If anything feels off, change your password and revoke all sessions from the terminal, then open a Security Desk conversation from your dashboard.',
];

export default function SecurityPracticesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080A0F] text-gray-200">
      <MarketingHeader activePath="/security" />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:px-12 sm:py-20">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#EF4444]">Defense in Depth</p>
        <h1 className="mt-3 max-w-3xl font-display text-[34px] font-semibold leading-[1.1] tracking-tight text-white sm:text-[46px]">
          Security is not a feature here. It is the operating system.
        </h1>
        <p className="mt-5 max-w-2xl text-[14px] leading-[1.8] text-gray-400">
          Below are the actual controls running in production — the same mechanisms enforced by code on
          every request, not aspirations. Each pillar can be verified from inside your own terminal.
        </p>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {PILLARS.map((pillar) => (
            <section key={pillar.title} className="rounded-lg border border-[#1E2433] bg-[#111520] p-7">
              <h2 className="font-display text-[19px] font-semibold text-white">{pillar.title}</h2>
              <p className="mt-1.5 text-[12px] italic text-gray-500">{pillar.intro}</p>
              <ul className="mt-5 space-y-3">
                {pillar.points.map((point) => (
                  <li key={point} className="flex gap-3 text-[12px] leading-relaxed text-gray-400">
                    <svg className="mt-0.5 h-[14px] w-[14px] flex-shrink-0 text-[#EF4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-lg border border-[#2C354C] bg-[#111520] p-8">
          <h2 className="font-display text-[19px] font-semibold text-white">The Golden Rules of Real Contact</h2>
          <p className="mt-2 text-[12px] text-gray-500">
            Most account takeovers begin with impersonation, not intrusion. These rules make impersonation useless.
          </p>
          <ol className="mt-6 space-y-5">
            {GOLDEN_RULES.map((rule, idx) => (
              <li key={rule} className="flex gap-4">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[#EF4444]/40 bg-[#EF4444]/10 font-mono text-[11px] font-bold text-[#EF4444]">
                  {idx + 1}
                </span>
                <p className="text-[13px] leading-relaxed text-gray-300">{rule}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-lg border border-[#1E2433] bg-[#0A0D14] p-7 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[15px] font-semibold text-white">Something looks wrong?</h2>
            <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-gray-500">
              Signed-in clients reach a desk officer in under a minute through the Support Desk — permanently logged, never lost.
            </p>
          </div>
          <a href="/dashboard/support">
            <button
              type="button"
              className="rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] px-6 py-3 font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.35)] transition-opacity hover:opacity-90"
            >
              Open Support Desk
            </button>
          </a>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
