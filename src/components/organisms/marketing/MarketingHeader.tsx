import React from 'react';
import { TeslaLogo } from '@/components/atoms/TeslaLogo';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Plans', href: '/plans' },
  { label: 'How to Invest', href: '/how-to-invest' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
];

/**
 * Institutional public-site header. Shared by every marketing surface
 * (landing, plans, how-to-invest, about, faq) so navigation stays coherent —
 * each item routes to a dedicated page, never to in-page anchors.
 */
export const MarketingHeader: React.FC<{ activePath?: string }> = ({ activePath }) => {
  return (
    <header className="sticky top-0 z-50 flex h-[72px] w-full items-center justify-between border-b border-[#1E2433] bg-[#080A0F]/90 px-6 sm:px-12 backdrop-blur-xl">
      <a href="/" className="flex items-center">
        <TeslaLogo size="sm" />
      </a>

      <nav className="hidden lg:flex items-center gap-9 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`transition hover:text-white ${activePath === link.href ? 'text-white border-b-2 border-[#EF4444] pb-1.5' : ''}`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <a href="/dashboard" className="hidden sm:block">
          <button
            type="button"
            className="h-10 px-5 rounded-lg border border-white/15 bg-white/5 font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-200 transition hover:bg-white/10 hover:border-white/40"
          >
            Terminal
          </button>
        </a>
        <a href="/login">
          <button
            type="button"
            className="h-10 px-6 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.35)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.6)] hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </a>
      </div>
    </header>
  );
};
