'use client';

import React, { useEffect, useState } from 'react';
import { TeslaLogo } from '@/components/atoms/TeslaLogo';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Plans', href: '/plans' },
  { label: 'How to Invest', href: '/how-to-invest' },
  { label: 'Insights', href: '/insights' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
];

/**
 * Institutional public-site header. Shared by every marketing surface so
 * navigation stays coherent — each item routes to a dedicated page, never to
 * in-page anchors. Mobile resolves to a full-width disclosure panel driven by
 * the hamburger control (a nav pattern, not a modal).
 */
export const MarketingHeader: React.FC<{ activePath?: string }> = ({ activePath }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [activePath]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E2433] bg-[#080A0F]/90 backdrop-blur-xl">
      <div className="flex h-[72px] w-full items-center justify-between px-6 sm:px-12">
        <a href="/" className="flex items-center" aria-label="TeslaPrimeCapital home">
          <TeslaLogo size="sm" />
        </a>

        <nav className="hidden items-center gap-9 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`transition hover:text-white ${activePath === link.href ? 'border-b-2 border-[#EF4444] pb-1.5 text-white' : ''}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href="/login">
            <button
              type="button"
              className="h-10 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] px-6 font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_35px_rgba(239,68,68,0.6)] active:translate-y-0"
            >
              Sign In
            </button>
          </a>
        </div>

        {/* Mobile disclosure trigger */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#1E2433] text-gray-300 transition-colors hover:border-[#2C354C] hover:text-white lg:hidden"
        >
          {menuOpen ? (
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile disclosure panel */}
      {menuOpen && (
        <nav className="border-t border-[#1E2433] bg-[#080A0F] px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  activePath === link.href
                    ? 'bg-[#111520] text-white'
                    : 'text-gray-400 hover:bg-[#111520] hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
            <a href="/login" onClick={() => setMenuOpen(false)} className="mt-4">
              <button
                type="button"
                className="h-11 w-full rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.35)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.6)]"
              >
                Sign In
              </button>
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};
