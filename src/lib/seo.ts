import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/site.config';

/**
 * Marketing-Page Metadata Factory.
 *
 * Every public marketing surface needs a COMPLETE snippet contract — Next.js
 * replaces (not deep-merges) `openGraph` when a parent segment already
 * defines one, so partial overrides silently drop the share card image,
 * and fully-inherited blocks leak the root page's title/url onto subpages.
 * This factory emits the whole object deterministically on every page:
 *
 *   <title>        "<Page> — TeslaPrimeCapital" via the root template
 *   canonical      absolute, per-page (collapses query-string variants)
 *   og:*           page-specific title/description/url + the brand card
 *   twitter:*      summary_large_image (Twitter falls back to og:image)
 */
export function buildMarketingMetadata(title: string, description: string, path: string): Metadata {
  const fullTitle = `${title} — ${SITE_CONFIG.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      url: `${SITE_CONFIG.url}${path}`,
      title: fullTitle,
      description,
      images: [
        {
          url: `${SITE_CONFIG.url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}
