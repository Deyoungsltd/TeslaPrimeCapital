import React from 'react';
import type { Metadata } from 'next';
import { buildMarketingMetadata } from '@/lib/seo';
import { APP_CONFIG } from '@/config/app.config';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';
import { FAQ_ITEMS } from '@/app/faq/faq-items';
import { JsonLd } from '@/components/atoms/JsonLd';
import { BreadcrumbJsonLd } from '@/components/atoms/BreadcrumbJsonLd';

export const metadata: Metadata = buildMarketingMetadata(
  'FAQ',
  'Detailed answers on settlement, verification, funding, withdrawals, referrals, and platform security.',
  '/faq',
);

/** FAQPage structured data — mirrors FAQ_ITEMS exactly. */
const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};




export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#EF4444] selection:text-white">
      <MarketingHeader activePath="/faq" />
      <JsonLd data={FAQ_JSON_LD} />
      <BreadcrumbJsonLd items={[{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }]} />

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
          {FAQ_ITEMS.map((item) => (
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
