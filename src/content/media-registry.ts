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
    key: 'brand.logo',
    label: 'Brand Logo Lockup',
    description: 'Master logo rendered in the header/footer and both consoles. Transparent PNG or SVG-style artwork on dark background, wide aspect. Default renders the built-in vector lockup.',
    defaultSrc: '/icons/icon-192.png',
    defaultAlt: 'TeslaPrimeCapital logo',
    aspect: 'wide',
    usedOn: 'header, footer, consoles',
  },
  {
    key: 'plan.plan-starter-fixed',
    label: 'Plan Art — Starter Fixed Yield',
    description: 'Hero vehicle for the Starter tier: bronze electric performance sedan, studio dark.',
    defaultSrc: '/branding/car-bronze.jpg',
    defaultAlt: 'Bronze electric performance sedan in a dark studio — Starter tier',
    aspect: '16:9',
    usedOn: '/plans, dashboard allocations',
  },
  {
    key: 'plan.plan-prime-growth',
    label: 'Plan Art — Prime Dynamic Growth',
    description: 'Hero vehicle for the Prime tier: gold electric performance sedan, studio dark.',
    defaultSrc: '/branding/car-gold.jpg',
    defaultAlt: 'Gold electric performance sedan in a dark studio — Prime tier',
    aspect: '16:9',
    usedOn: '/plans, dashboard allocations',
  },
  {
    key: 'plan.plan-institutional-apex',
    label: 'Plan Art — Institutional Apex',
    description: 'Hero vehicle for the Apex tier: flagship electric performance machine, studio dark.',
    defaultSrc: '/branding/car-diamond.jpg',
    defaultAlt: 'Flagship electric performance machine in a dark studio — Apex tier',
    aspect: '16:9',
    usedOn: '/plans, dashboard allocations',
  },
  {
    key: 'leadership.portrait',
    label: 'Leadership — Executive Portrait',
    description: 'Portrait frame for the leadership section. 4:5 crop, dark studio exposure, subject facing camera or three-quarter. Ships as abstract brand texture until the real portrait is uploaded.',
    defaultSrc: '/branding/gen/brand-backdrop.jpg',
    defaultAlt: 'Leadership portrait placeholder — abstract brand texture',
    aspect: '4:5',
    usedOn: '/, /about',
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

/* --------------------------------------------------------------------------
 * TEXT SLOTS — CMS-managed copy keyed like the image slots.
 * Leadership identity lives here: the section ships complete with truthful
 * office-grade defaults and becomes personal the instant the admin publishes
 * a name through the Brand Library. Never seed a fabricated person.
 * ------------------------------------------------------------------------ */

export interface ITextSlotDefinition {
  key: string;
  label: string;
  description: string;
  defaultValue: string;
  maxLength: number;
  usedOn: string;
}

export const TEXT_SLOTS: ITextSlotDefinition[] = [
  {
    key: 'brand.displayName',
    label: 'Brand — Display Name',
    description: 'Rendered wherever the platform names itself (header wordmark area, footer, consoles). Metadata/SEO titles stay in code — change those with the next release.',
    defaultValue: 'TeslaPrimeCapital',
    maxLength: 60,
    usedOn: 'global chrome',
  },
  {
    key: 'brand.tagline',
    label: 'Brand — Tagline',
    description: 'Short descriptor shown under the name in console footers and email contexts.',
    defaultValue: 'Structured Capital Allocations',
    maxLength: 90,
    usedOn: 'consoles, email',
  },
  {
    key: 'site.announcement.message',
    label: 'Announcement Ribbon — Message',
    description: 'Site-wide ribbon pinned above the header on every marketing page. Leave EMPTY to hide the ribbon entirely. Publish only what matters: rail maintenance windows, plan availability, desk advisories.',
    defaultValue: '',
    maxLength: 220,
    usedOn: 'global chrome',
  },
  {
    key: 'site.announcement.ctaLabel',
    label: 'Announcement Ribbon — Link Label',
    description: 'Optional call-to-action text rendered beside the message. Ignored unless both label and link are set.',
    defaultValue: '',
    maxLength: 40,
    usedOn: 'global chrome',
  },
  {
    key: 'site.announcement.ctaHref',
    label: 'Announcement Ribbon — Link Target',
    description: 'Destination for the call-to-action (e.g. /plans or /status). Must begin with / or https:// — anything else is ignored.',
    defaultValue: '',
    maxLength: 200,
    usedOn: 'global chrome',
  },
  {
    key: 'leadership.name',
    label: 'Leadership — Display Name',
    description: 'The name rendered under the leadership portrait. Default publishes the office, not a person.',
    defaultValue: 'The Founding Team',
    maxLength: 120,
    usedOn: '/, /about',
  },
  {
    key: 'leadership.title',
    label: 'Leadership — Title Line',
    description: 'Small-cap line beneath the name (e.g. Founder & Chief Executive).',
    defaultValue: 'Office of Executive Leadership',
    maxLength: 120,
    usedOn: '/, /about',
  },
  {
    key: 'leadership.signature',
    label: 'Leadership — Signature Line',
    description: 'The operating creed quoted beside the portrait. Shorten for the best typographic balance (≤ 200 chars is ideal).',
    defaultValue: 'Deterministic ledgers. Human custody. Settlement on the exact day promised.',
    maxLength: 600,
    usedOn: '/, /about',
  },
];

export const TEXT_SLOT_MAP: Record<string, ITextSlotDefinition> = Object.fromEntries(
  TEXT_SLOTS.map((slot) => [slot.key, slot]),
);

export function isTextSlotKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(TEXT_SLOT_MAP, key);
}
