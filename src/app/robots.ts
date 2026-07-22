import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/site.config';

/**
 * robots.txt — served at /robots.txt.
 *
 * Public marketing surfaces are fully crawlable. The authenticated terminal
 * (dashboard), the executive portal (admin), and the JSON API are fenced off
 * so crawlers never burn budget on session shells or machine payloads — and
 * so the admin surface's URL structure is not enumerated by every bot that
 * asks. Auth pages themselves stay crawlable but carry per-route `noindex`
 * metadata (disallowing them here would hide that directive from Googlebot).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/api/', '/verify-otp'],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
