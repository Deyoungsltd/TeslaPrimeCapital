import React from 'react';
import { APP_CONFIG } from '@/config/app.config';
import { TeslaLogo } from '@/components/atoms/TeslaLogo';

const FOOTER_COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Investment Plans', href: '/plans' },
      { label: 'How to Invest', href: '/how-to-invest' },
      { label: 'Live Markets', href: '/#markets' },
      { label: 'Referral Program', href: '/dashboard/referrals' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About the Firm', href: '/about' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Create Account', href: '/register' },
      { label: 'Sign In', href: '/login' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Recover Access', href: '/forgot-password' },
      { label: 'Verification', href: '/dashboard/kyc' },
      { label: 'Wallets', href: '/dashboard/wallet' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Risk Disclosure', href: '/risk' },
      { label: 'Contact Compliance', href: `mailto:${APP_CONFIG.supportEmail}` },
    ],
  },
];

/** Institutional public-site footer shared across every marketing surface. */
export const MarketingFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#1E2433] bg-[#080A0F]">
      <div className="mx-auto max-w-7xl px-6 sm:px-12 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
        <div className="space-y-4">
          <TeslaLogo size="sm" />
          <p className="text-xs text-gray-500 leading-relaxed">
            Enterprise digital wealth management. Structured high-yield allocations on double-entry rails with fixed-point ledger precision.
          </p>
          <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
            {APP_CONFIG.supportEmail}
          </span>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.heading}>
            <h4 className="font-mono text-[10px] font-extrabold uppercase tracking-[0.25em] text-gray-500 mb-5">
              {column.heading}
            </h4>
            <ul className="space-y-3 text-xs font-semibold text-gray-400">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[#1E2433]">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 py-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            TeslaPrimeCapital &copy; 2026 — All Rights Reserved
          </span>
          <p className="max-w-2xl text-center lg:text-right font-mono text-[9px] leading-relaxed text-gray-600">
            Structured allocations are subject to term and market risk. Compounded yield is calculated daily and settled only at plan maturity under the Lump-Sum Payout Policy. Figures presented in plan materials are targets, not guarantees of future performance.
          </p>
        </div>
      </div>
    </footer>
  );
};
