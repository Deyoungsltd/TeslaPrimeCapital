/**
 * Canonical Site Identity Configuration.
 *
 * Single source of truth for the platform's public origin and entity data.
 * Every crawler-facing surface — sitemap.xml, robots.txt, canonical URLs,
 * Open Graph absolute URLs, JSON-LD organization graph, and the web app
 * manifest — derives its absolute URLs from `SITE_CONFIG.url`.
 *
 * The origin is build-time injected via NEXT_PUBLIC_SITE_URL. The compiled-in
 * fallback is the intended production vanity domain; before deploying to any
 * other host, set NEXT_PUBLIC_SITE_URL in the environment so search engines
 * are never handed canonical URLs pointing at the wrong origin.
 */
export const SITE_CONFIG = {
  name: 'TeslaPrimeCapital',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.teslaprimecapital.com').replace(/\/+$/, ''),
  tagline: 'Enterprise Digital Wealth Management',
  description:
    'Global institutional-grade digital asset wealth management: multi-currency wallets, term-locked structured allocations with daily compounding accrual, and lump-sum maturity settlement on double-entry rails.',
  themeColor: '#080A0F',
  /**
   * Verified social profiles render in the marketing footer and feed the
   * Organization `sameAs` graph. All values are environment-injected; a
   * profile is omitted entirely when its variable is unset, so no dead or
   * fabricated handles are ever published.
   */
  socials: {
    X: process.env.NEXT_PUBLIC_SOCIAL_X_URL ?? '',
    LinkedIn: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL ?? '',
    Telegram: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM_URL ?? '',
    Instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL ?? '',
  },
} as const;

/** Social profiles that are actually configured (never an empty or dead link). */
export const ACTIVE_SOCIAL_LINKS: ReadonlyArray<{ label: string; url: string }> = Object.entries(
  SITE_CONFIG.socials,
)
  .filter((entry): entry is [string, string] => Boolean(entry[1]))
  .map(([label, url]) => ({ label, url }));
