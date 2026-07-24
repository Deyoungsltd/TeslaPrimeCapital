import React from 'react';
import { APP_CONFIG } from '@/config/app.config';
import { SITE_CONFIG, ACTIVE_SOCIAL_LINKS } from '@/config/site.config';
import { BrandLogo } from '@/components/atoms/BrandLogo';
import { ManagedText } from '@/components/atoms/ManagedText';
import { SmartsuppChat } from '@/components/organisms/SmartsuppChat';

const FOOTER_COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Investment Plans', href: '/plans' },
      { label: 'How to Invest', href: '/how-to-invest' },
      { label: 'Fee Schedule', href: '/fees' },
      { label: 'Platform Status', href: '/status' },
      { label: 'Insights', href: '/insights' },
      { label: 'Live Markets', href: '/#markets' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About the Firm', href: '/about' },
      { label: 'Security Practices', href: '/security' },
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
      { label: 'Referral Program', href: '/dashboard/referrals' },
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

/** Pixel-tight profile glyphs for configured social channels (16px viewBox 24). */
const SOCIAL_GLYPHS: Record<string, React.ReactNode> = {
  X: (
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" stroke="none" />
  ),
  LinkedIn: (
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565z" fill="currentColor" stroke="none" />
  ),
  Telegram: (
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" fill="currentColor" stroke="none" />
  ),
  Instagram: (
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" fill="currentColor" stroke="none" />
  ),
};

/**
 * Institutional public-site footer shared across every marketing surface.
 * Also owns the Smartsupp support-chat mount (it renders exactly once per
 * marketing page here) and the verified social profile row — profiles are
 * environment-configured, and the row is omitted when none are set so no
 * dead or fabricated handles ever ship.
 */
export const MarketingFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#1E2433] bg-[#080A0F]">
      <div className="mx-auto max-w-7xl px-6 sm:px-12 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
        <div className="space-y-4">
          <BrandLogo size="sm" />
          <p className="text-xs text-gray-500 leading-relaxed">
            Enterprise digital wealth management. Structured high-yield allocations on double-entry rails with fixed-point ledger precision.
          </p>
          <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
            {APP_CONFIG.supportEmail}
          </span>
          {ACTIVE_SOCIAL_LINKS.length > 0 && (
            <div className="flex items-center gap-3 pt-2">
              {ACTIVE_SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${SITE_CONFIG.name} on ${social.label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2C354C] text-gray-500 transition hover:border-[#EF4444]/60 hover:text-[#EF4444]"
                >
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    {SOCIAL_GLYPHS[social.label]}
                  </svg>
                </a>
              ))}
            </div>
          )}
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
            <ManagedText slotKey="brand.displayName" /> &copy; 2026 — All Rights Reserved
          </span>
          <p className="max-w-2xl text-center lg:text-right font-mono text-[9px] leading-relaxed text-gray-600">
            Structured allocations are subject to term and market risk. Compounded yield is calculated daily and settled only at plan maturity under the Lump-Sum Payout Policy. Figures presented in plan materials are targets, not guarantees of future performance.
          </p>
        </div>
      </div>

      <SmartsuppChat />
    </footer>
  );
};
