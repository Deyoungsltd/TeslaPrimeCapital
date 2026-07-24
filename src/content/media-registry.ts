/**
 * TeslaPrimeCapital — Brand Media Slot Registry (`media-registry.ts`)
 *
 * Single source of truth for every CMS-managed image slot on the platform.
 * A slot's `defaultSrc` is the committed studio art that ships with the repo;
 * when an admin uploads a replacement through the Brand Library console, the
 * `SiteMediaAsset` row carries a Cloudinary publicId that takes precedence —
 * so imagery persists across commits and deploys while never depending on the
 * repo for the override.
 *
 * Pure data, no I/O: safe to import from server components, client atoms,
 * and the media service alike.
 */

export interface IMediaSlotDefinition {
  /** Stable key stored in `site_media_assets.key` and addressed by <ManagedImage slotKey>. */
  key: string;
  /** Human label rendered in the Brand Library admin grid. */
  label: string;
  /** Console guidance so admins know composition/aspect expectations. */
  description: string;
  /** Committed default art (served when no admin override exists). */
  defaultSrc: string;
  /** Default alt text; also the floor for accessibility when admins skip alt entry. */
  defaultAlt: string;
  /** Display aspect guidance, e.g. '21:9', '16:9', '3:2'. */
  aspect: string;
  /** Surfaces that consume the slot (admin context only). */
  usedOn: string;
}

export const MEDIA_SLOTS: IMediaSlotDefinition[] = [
  {
    key: 'home.hero',
    label: 'Homepage Hero — Dusk Boardroom',
    description: 'Full-bleed cinematic hero behind the headline. Dark exposures keep headline text legible; silhouettes only, no faces.',
    defaultSrc: '/branding/gen/hero-boardroom.jpg',
    defaultAlt: 'Executive boardroom at dusk overlooking a city skyline',
    aspect: '21:9',
    usedOn: '/',
  },
  {
    key: 'home.command',
    label: 'Homepage — Command Desk',
    description: 'Inside-the-terminal section visual: analyst desk with market monitors, rear silhouette, screen bokeh.',
    defaultSrc: '/branding/gen/command-desk.jpg',
    defaultAlt: 'Analyst workstation with market monitors glowing in a dark office',
    aspect: '3:2',
    usedOn: '/',
  },
  {
    key: 'home.band',
    label: 'Homepage — Skyline Statement Band',
    description: 'Ultra-wide night-skyline image band behind the philosophy pull-quote.',
    defaultSrc: '/branding/gen/skyline-band.jpg',
    defaultAlt: 'City skyline at night beneath low clouds',
    aspect: '21:9',
    usedOn: '/',
  },
  {
    key: 'brand.backdrop',
    label: 'Brand Backdrop — Material Texture',
    description: 'Abstract red-and-carbon material texture used as a subtle page/section backdrop and on auth surfaces.',
    defaultSrc: '/branding/gen/brand-backdrop.jpg',
    defaultAlt: 'Abstract dark carbon texture with a red light streak',
    aspect: '16:9',
    usedOn: 'global sections',
  },
  {
    key: 'about.story',
    label: 'About — Tower Statement',
    description: 'Low-angle glass tower at dusk anchoring the firm statement section.',
    defaultSrc: '/branding/gen/about-tower.jpg',
    defaultAlt: 'Low-angle view of a glass office tower at dusk',
    aspect: '3:2',
    usedOn: '/about',
  },
  {
    key: 'about.leadership',
    label: 'About — Governance Boardroom',
    description: 'Boardroom scene with executives reviewing ledgers in silhouette — conveys human custody without depicting real staff.',
    defaultSrc: '/branding/gen/about-boardroom.jpg',
    defaultAlt: 'Executives in silhouette reviewing documents across a boardroom table',
    aspect: '16:9',
    usedOn: '/about',
  },
  {
    key: 'plan.plan-starter-fixed',
    label: 'Plan Art — Starter Fixed Yield',
    description: 'Tier artwork for the Starter plan card: single forged monolith, bronze accent.',
    defaultSrc: '/branding/gen/plan-starter.jpg',
    defaultAlt: 'Single brushed-bronze monolith on a dark plinth',
    aspect: '16:9',
    usedOn: '/plans, dashboard allocations',
  },
  {
    key: 'plan.plan-prime-growth',
    label: 'Plan Art — Prime Dynamic Growth',
    description: 'Tier artwork for the Prime plan card: twin monoliths, copper-red accent.',
    defaultSrc: '/branding/gen/plan-prime.jpg',
    defaultAlt: 'Twin brushed-metal monoliths ascending on a dark plinth',
    aspect: '16:9',
    usedOn: '/plans, dashboard allocations',
  },
  {
    key: 'plan.plan-institutional-apex',
    label: 'Plan Art — Institutional Apex',
    description: 'Tier artwork for the Apex plan card: three ascending monoliths, strongest red rim light.',
    defaultSrc: '/branding/gen/plan-apex.jpg',
    defaultAlt: 'Three ascending dark-metal monoliths with a red rim light',
    aspect: '16:9',
    usedOn: '/plans, dashboard allocations',
  },
  {
    key: 'insights.understanding-lump-sum-maturity-settlement',
    label: 'Insights Cover — Lump-Sum Maturity Settlement',
    description: 'Vault/settlement motif for the settlement-policy article.',
    defaultSrc: '/branding/gen/insights-vault.jpg',
    defaultAlt: 'Vault door detail in low light',
    aspect: '16:9',
    usedOn: '/insights',
  },
  {
    key: 'insights.how-daily-compounding-accrual-works',
    label: 'Insights Cover — Daily Compounding Accrual',
    description: 'Growth-motif cover for the accrual article; ascending-tier artwork by default.',
    defaultSrc: '/branding/gen/plan-prime.jpg',
    defaultAlt: 'Ascending metal monoliths symbolizing daily compounding growth',
    aspect: '16:9',
    usedOn: '/insights',
  },
  {
    key: 'insights.verification-tiers-and-withdrawal-review',
    label: 'Insights Cover — Verification & Withdrawal Review',
    description: 'Human-review boardroom motif for the verification article.',
    defaultSrc: '/branding/gen/about-boardroom.jpg',
    defaultAlt: 'Executives in silhouette reviewing documents across a boardroom table',
    aspect: '16:9',
    usedOn: '/insights',
  },
  {
    key: 'insights.reading-your-accrual-log',
    label: 'Insights Cover — Reading Your Accrual Log',
    description: 'Analyst-terminal motif for the accrual-log article.',
    defaultSrc: '/branding/gen/command-desk.jpg',
    defaultAlt: 'Analyst workstation with market monitors glowing in a dark office',
    aspect: '16:9',
    usedOn: '/insights',
  },
];

export const MEDIA_SLOT_MAP: Record<string, IMediaSlotDefinition> = Object.fromEntries(
  MEDIA_SLOTS.map((slot) => [slot.key, slot]),
);

export function isMediaSlotKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(MEDIA_SLOT_MAP, key);
}
