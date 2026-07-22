import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/site.config';
import { INSIGHT_ARTICLES } from '@/content/insights/articles';

/**
 * sitemap.xml — served at /sitemap.xml.
 *
 * Enumerates every crawlable public route with honest change signals so
 * search engines discover new marketing and editorial pages within hours
 * instead of weeks. Authenticated routes are intentionally absent — they are
 * fenced in robots.txt and carry noindex metadata.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const corePages: MetadataRoute.Sitemap = [
    { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { path: '/plans', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/how-to-invest', changeFrequency: 'weekly' as const, priority: 0.9 },
    { path: '/insights', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/about', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/faq', changeFrequency: 'monthly' as const, priority: 0.7 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/risk', changeFrequency: 'yearly' as const, priority: 0.4 },
  ].map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_CONFIG.url}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const articlePages: MetadataRoute.Sitemap = INSIGHT_ARTICLES.map((article) => ({
    url: `${SITE_CONFIG.url}/insights/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...corePages, ...articlePages];
}
