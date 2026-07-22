import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';
import { BreadcrumbJsonLd } from '@/components/atoms/BreadcrumbJsonLd';
import { JsonLd } from '@/components/atoms/JsonLd';
import { SITE_CONFIG } from '@/config/site.config';
import { INSIGHT_ARTICLES, INSIGHT_ARTICLE_MAP } from '@/content/insights/articles';

interface IInsightArticlePageProps {
  params: { slug: string };
}

/** Articles are fully static — one prerendered route per content record. */
export function generateStaticParams() {
  return INSIGHT_ARTICLES.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: IInsightArticlePageProps): Metadata {
  const article = INSIGHT_ARTICLE_MAP.get(params.slug);
  if (!article) {
    return { title: 'Briefing Not Found' };
  }
  const canonical = `/insights/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      siteName: SITE_CONFIG.name,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      section: article.category,
      images: [
        {
          url: `${SITE_CONFIG.url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${SITE_CONFIG.name} — ${article.title}`,
        },
      ],
    },
  };
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

const SVG_CHECK = (
  <svg className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-[#EF4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function InsightArticlePage({ params }: IInsightArticlePageProps) {
  const article = INSIGHT_ARTICLE_MAP.get(params.slug);
  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#080A0F] text-white font-sans selection:bg-[#EF4444] selection:text-white">
      <MarketingHeader activePath="/insights" />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/insights' },
          { name: article.title, path: `/insights/${article.slug}` },
        ]}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.description,
          articleSection: article.category,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          inLanguage: 'en',
          mainEntityOfPage: `${SITE_CONFIG.url}/insights/${article.slug}`,
          author: { '@id': `${SITE_CONFIG.url}/#organization` },
          publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
        }}
      />

      <main className="mx-auto max-w-3xl px-6 sm:px-10 py-16 sm:py-20">
        {/* Article header */}
        <header className="space-y-5 pb-12 border-b border-[#1E2433]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md border border-[#2C354C] bg-[#0A0D14] px-3 py-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#EF4444]">
              {article.category}
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600">
              {formatDate(article.publishedAt)} · {article.readingMinutes} min read
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.08]">
            {article.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            {article.description}
          </p>
        </header>

        {/* Sections */}
        <div className="space-y-14 pt-12">
          {article.sections.map((section, index) => (
            <section key={section.heading}>
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#EF4444]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {section.heading}
                </h2>
              </div>
              <div className="mt-5 space-y-4">
                {section.paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-sm sm:text-[15px] text-gray-400 leading-[1.9]">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.bullets && (
                <ul className="mt-6 space-y-3 border-l-2 border-[#1E2433] pl-6">
                  {section.bullets.map((bullet, bIndex) => (
                    <li key={bIndex} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                      {SVG_CHECK}
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Risk note + CTA */}
        <footer className="mt-16 border-t border-[#1E2433] pt-10 space-y-8">
          <p className="font-mono text-[10px] leading-relaxed text-gray-600 uppercase tracking-[0.12em]">
            Briefings describe platform mechanics as implemented. Published plan yields are targets the accrual
            engine is configured towards and are not guarantees of future performance. Digital-asset allocation
            carries market risk — read the <a href="/risk" className="text-gray-400 underline underline-offset-4 hover:text-white">Risk Disclosure</a> before allocating capital.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href="/plans" className="w-full sm:w-auto">
              <button className="w-full sm:w-[260px] h-12 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] hover:-translate-y-0.5">
                Review the Plans
              </button>
            </a>
            <a href="/insights" className="w-full sm:w-auto">
              <button className="w-full sm:w-[240px] h-12 rounded-lg border border-white/15 bg-white/5 font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-white/10 hover:border-white/40 hover:-translate-y-0.5">
                All Briefings
              </button>
            </a>
          </div>
        </footer>
      </main>

      <MarketingFooter />
    </div>
  );
}
