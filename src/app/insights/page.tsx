import React from 'react';
import type { Metadata } from 'next';
import { buildMarketingMetadata } from '@/lib/seo';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';
import { BreadcrumbJsonLd } from '@/components/atoms/BreadcrumbJsonLd';
import { ManagedImage } from '@/components/atoms/ManagedImage';
import { INSIGHT_ARTICLES } from '@/content/insights/articles';

export const metadata: Metadata = buildMarketingMetadata(
  'Insights',
  'Deep-dive briefings on how the platform actually works: lump-sum maturity settlement, the 00:00 UTC accrual engine, verification tiers, and ledger transparency.',
  '/insights',
);

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

export default function InsightsIndexPage() {
  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#EF4444] selection:text-white">
      <MarketingHeader activePath="/insights" />
      <BreadcrumbJsonLd items={[{ name: 'Home', path: '/' }, { name: 'Insights', path: '/insights' }]} />

      <main className="mx-auto max-w-7xl px-6 sm:px-12 py-20">
        {/* Header band */}
        <div className="space-y-4 pb-14">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#EF4444]" />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
              Intelligence Briefings
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-medium tracking-tight leading-[1.05] max-w-3xl">
            How the machine actually works
          </h1>
          <p className="max-w-2xl text-sm text-gray-400 leading-relaxed">
            No marketing fog. These briefings document the real mechanics — settlement policy, the accrual engine,
            verification architecture, and the ledger you audit yourself. If it is written here, it is implemented
            exactly that way in the platform.
          </p>
        </div>

        {/* Article grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-[#1E2433] bg-[#1E2433]">
          {INSIGHT_ARTICLES.map((article, index) => (
            <a
              key={article.slug}
              href={`/insights/${article.slug}`}
              className="group relative flex flex-col bg-[#0A0D14] transition-colors duration-300 hover:bg-[#111520]"
            >
              <div className="relative h-44 w-full overflow-hidden bg-black sm:h-52">
                <ManagedImage
                  slotKey={`insights.${article.slug}`}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center opacity-90 transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-transparent to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-8 sm:p-10">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-md border border-[#2C354C] bg-[#080A0F] px-3 py-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-400 transition-colors group-hover:border-[#EF4444]/50 group-hover:text-[#EF4444]">
                  {article.category}
                </span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h2 className="mt-7 text-xl sm:text-2xl font-extrabold tracking-tight leading-snug text-white transition-colors group-hover:text-[#EF4444]">
                {article.title}
              </h2>
              <p className="mt-4 text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-3">
                {article.description}
              </p>

              <div className="mt-8 flex items-center justify-between border-t border-[#1E2433] pt-5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600">
                  {formatDate(article.publishedAt)} · {article.readingMinutes} min read
                </span>
                <svg
                  className="h-[18px] w-[18px] text-gray-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#EF4444]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              </div>
            </a>
          ))}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
