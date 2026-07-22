/**
 * Insights Editorial Content Module.
 *
 * Long-form educational articles published at /insights. Every article is
 * grounded strictly in mechanics that actually exist in this codebase —
 * the Lump-Sum Maturity payout policy, the 00:00 UTC accrual engine and its
 * AccrualLog, the verification tier ladder, and the TOTP-attested withdrawal
 * review queue. Growth targets quoted in plan material are targets, never
 * promises, and the articles keep that framing intact.
 */

export interface IInsightSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface IInsightArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  sections: IInsightSection[];
}

export const INSIGHT_ARTICLES: IInsightArticle[] = [
  {
    slug: 'understanding-lump-sum-maturity-settlement',
    title: 'Understanding Lump-Sum Maturity Settlement',
    description:
      'Why yield never drips out early on this platform: how term-locked positions compound off-ledger and settle principal plus full accrued yield in a single credit at 00:00 UTC on maturity day.',
    category: 'Settlement Engineering',
    publishedAt: '2026-07-22',
    updatedAt: '2026-07-22',
    readingMinutes: 6,
    sections: [
      {
        heading: 'One settlement, at the end',
        paragraphs: [
          'Most retail platforms pay yield in fragments — daily, weekly, sometimes continuously — and each fragment is a temptation: withdraw it, move it, spend it. The position never gets to do the one thing compounding needs, which is to stay whole. The Lump-Sum Maturity Policy takes the opposite position. From the moment your allocation locks, every unit of yield the position accrues stays inside the position for the entire term. Nothing pays out early, and nothing is held a minute past maturity. At 00:00 UTC on the final day of the term, the settlement engine credits your available wallet with one sum: your principal plus the full accrued yield, recorded as a single ledger event.',
        ],
      },
      {
        heading: 'What "off-ledger accrual" actually means',
        paragraphs: [
          'During the term, yield is accrued off-ledger: it is calculated, compounded where the plan allows, and recorded line-by-line in the accrual log — but it is not spendable balance. Your terminal shows the accumulating figure at all times; your available wallet does not move. This separation is deliberate bookkeeping, not a delay tactic. Double-entry discipline requires that funds are either inside a term-locked position or in an available wallet, never in both. The accrual log is the audit trail that bridges the two states over time.',
          'Because accrual runs once per day at 00:00 UTC rather than continuously, the value of a position at any moment is unambiguous: it is exactly the value written by the last completed accrual run. There is no intraday estimate to argue about.',
        ],
      },
      {
        heading: 'Why the platform was built this way',
        paragraphs: [
          'Term-locking protects both sides of the ledger. For the platform, predictable capital horizons make treasury planning an engineering problem instead of a guessing game — the maturity date of every position is known to the second at the moment it opens. For the investor, the structure removes the two most common ways yield strategies fail in practice: early exit at the first sign of noise, and fragmentation of compounding by constant withdrawals.',
        ],
        bullets: [
          'The term and the exact maturity date are shown before you confirm at checkout — you are never surprised by your own lock-up.',
          'The position cannot be exited early under any configuration; only allocate capital you can comfortably lock for the full term.',
          'At maturity the settlement is a single atomic credit, visible immediately in your wallet and transaction history.',
        ],
      },
      {
        heading: 'Plan for the term, not around it',
        paragraphs: [
          'The practical consequence is simple: treat each allocation as money you will not see until a specific calendar date, because mechanically that is what it is. Terms range from 3 to 24 days depending on the pool, which makes them short enough to ladder — staggering allocations so that maturities land on different dates — without ever pretending liquidity exists where it does not. If you need access to capital on a schedule, the honest way to get it is a laddered set of short terms, not an exit button that this platform deliberately does not provide.',
        ],
      },
    ],
  },
  {
    slug: 'how-daily-compounding-accrual-works',
    title: 'How Daily Compounding Accrual Works',
    description:
      'Inside the 00:00 UTC accrual engine: one deterministic run per day, one AccrualLog record per position per run, and exactly how a fixed daily rate turns into the yield figure you see in the terminal.',
    category: 'Yield Mechanics',
    publishedAt: '2026-07-22',
    updatedAt: '2026-07-22',
    readingMinutes: 7,
    sections: [
      {
        heading: 'A single, deterministic daily run',
        paragraphs: [
          'The accrual engine executes once per day at 00:00 UTC. On each run it walks every active position, applies the plan’s fixed daily rate to the position’s current accrued value, and persists exactly one AccrualLog record per position. The record stores the position value before the run, the rate applied, and the value after — the run is therefore fully replayable from the log alone, which is precisely what makes it auditable rather than anecdotal.',
        ],
      },
      {
        heading: 'Compounding versus simple accrual',
        paragraphs: [
          'Whether the daily rate applies to principal alone or to principal plus previous accrual depends on the plan — and the plan card states it plainly before you commit. The Bronze pool, for example, is a simple-accrual structure: the daily rate applies to the original principal each day, so a $2,000 allocation at its published rate accrues the same fixed amount every day for the full term, reaching the pool’s stated 24-day target at maturity. Pools that permit compounding apply the daily rate to the running accrued total instead, so each day’s base is slightly larger than the last.',
          'Either way, the arithmetic is fixed at plan creation. The engine does not quote a floating rate, and it does not improvise: the terms displayed at checkout are the terms executed.',
        ],
      },
      {
        heading: 'What you see in the terminal',
        paragraphs: [
          'Open any active position and you will find the accrued yield figure updating exactly once per day, never intraday. That figure is informational until maturity: it is the sum the settlement engine has committed to pay, off-ledger, under the Lump-Sum Maturity Policy. It becomes spendable balance only when the position settles.',
        ],
        bullets: [
          'Accrual timestamps are 00:00 UTC regardless of your timezone.',
          'Each day’s accrual is a permanent, individually inspectable ledger record.',
          'Published plan yields are targets the engine is configured to accrue towards; digital-asset allocation carries market risk, and target mechanics are not a guarantee of future performance — see the Risk Disclosure.',
        ],
      },
      {
        heading: 'Why once a day, instead of continuously',
        paragraphs: [
          'Continuous-time accrual looks sophisticated and audits poorly: every observer sees a slightly different number depending on when they look. A single daily checkpoint at a fixed global instant gives every participant — investor, finance reviewer, auditor — the same number at the same time. Determinism is the feature. In a system whose core promise is settled-to-the-decimal accounting, the accrual cadence is part of the promise.',
        ],
      },
    ],
  },
  {
    slug: 'verification-tiers-and-withdrawal-review',
    title: 'Verification Tiers and Withdrawal Review, Explained',
    description:
      'The reasoning behind the verification ladder — automatic Tier-0 access with a $1,000 cumulative ceiling, Tier-1 identity checks before withdrawal, and why every release is human-approved with two-factor attestation instead of an automated gateway.',
    category: 'Compliance & Security',
    publishedAt: '2026-07-22',
    updatedAt: '2026-07-22',
    readingMinutes: 6,
    sections: [
      {
        heading: 'Tier-0: real access, real limits',
        paragraphs: [
          'Registration grants Tier-0 clearance immediately, with no documents and no waiting room. Tier-0 is genuinely functional: you can fund a wallet and allocate into the Bronze pool from day one. What you cannot do is exceed a $1,000 cumulative allocation ceiling or withdraw. This is the standard proportionality principle applied honestly — anonymous access is fine in small amounts, indefensible in large ones. The ceiling is enforced per-account on cumulative allocations, not per transaction, so splitting deposits does not move it.',
        ],
      },
      {
        heading: 'Tier-1 and Tier-2: identity before money moves out',
        paragraphs: [
          'Tier-1 verification — a government-issued identity document plus a live selfie match, reviewed by a compliance officer — is required before any withdrawal and before deposits above the Tier-0 ceiling. Tier-2 extends clearance to the flagship Diamond pool at the $50,000 entry level, where source-of-funds questions become materially more important.',
          'Documents are reviewed by humans against clear criteria, and decisions are recorded with a reason. If a submission is rejected, the rejection states what failed so you can correct it rather than guess.',
        ],
      },
      {
        heading: 'Why withdrawals are never auto-dispatched',
        paragraphs: [
          'When you submit a withdrawal, the requested amount locks instantly in your wallet — it cannot be double-spent, re-allocated, or silently rerouted — and the request enters a pending-review queue. A finance manager then authorizes the release with a two-factor TOTP attestation, and that authorization is written to an immutable audit ledger. There is no automated gateway disbursement on this platform, on purpose.',
          'Automated disbursement optimizes for speed at the cost of the one moment where fraud, account takeover, and destination errors can still be stopped. Human attestation keeps that door closed. The trade-off is a review window instead of instant broadcast; the gain is that no code path exists through which a compromised session alone can move funds out.',
        ],
        bullets: [
          'Funds lock at submission and are released or returned — never stuck in limbo.',
          'First-time destinations may receive an additional verification contact before release.',
          'Every release decision carries the attesting officer’s identity in the audit record.',
        ],
      },
      {
        heading: 'What this means for you in practice',
        paragraphs: [
          'Complete Tier-1 verification before you need it, not after a position matures. Use your own, accurate identity details — mismatched records are the single most common cause of review friction. And enable TOTP two-factor authentication on your own login: the platform attests withdrawals on its side, but your side of the perimeter deserves the same discipline.',
        ],
      },
    ],
  },
  {
    slug: 'reading-your-accrual-log',
    title: 'Reading Your Accrual Log: A Line-by-Line Guide',
    description:
      'Your position’s complete audit trail, decoded: what each field in an accrual record means, how to verify a day’s arithmetic yourself in under a minute, and what to check if a figure ever looks wrong.',
    category: 'Platform Guides',
    publishedAt: '2026-07-22',
    updatedAt: '2026-07-22',
    readingMinutes: 5,
    sections: [
      {
        heading: 'One record per day, per position',
        paragraphs: [
          'Every active position produces one accrual record at each daily 00:00 UTC run, and the full sequence is inspectable from the position’s detail view. Nothing is summarized away: a 24-day position produces 24 records, in order, each one permanent. If you remember only one thing about the log, remember that it is append-only — records are never edited or deleted, only read. That property is what lets you trust a figure you did not watch being computed.',
        ],
      },
      {
        heading: 'The fields that matter',
        paragraphs: [
          'Each record answers four questions at a glance. When: the run timestamp, always 00:00 UTC. From what: the position value carried into the run — for compounding plans this is yesterday’s closing value, for simple-accrual plans it is the original principal. At what rate: the plan’s fixed daily rate, unchanged for the life of the position. To what: the resulting accrued total. The terminal presents these as a day-indexed table, and the wallet ledger cross-references the total as the position’s current committed yield.',
        ],
      },
      {
        heading: 'Verify a day’s arithmetic yourself',
        paragraphs: [
          'Pick any record and multiply the carried-in value by (1 + daily rate) for a compounding position, or the original principal by the daily rate for a simple-accrual one. The result should match the day’s accrued amount to the cent — fixed-point decimal arithmetic means there is no floating-point fog to hide in. If you do this for three consecutive records and the chain holds, you have independently verified the engine’s behavior for your position.',
        ],
        bullets: [
          'Carried-in value of day N+1 equals closing value of day N on compounding plans.',
          'The sum of all daily accruals equals the committed yield shown on the position.',
          'At maturity, that exact total credits your wallet as part of the single lump-sum settlement.',
        ],
      },
      {
        heading: 'If something ever looks wrong',
        paragraphs: [
          'Start from the plan card: confirm the daily rate, the compounding behavior, and the term — most surprises trace back to a mismatched expectation rather than a mismatched record. If the arithmetic itself ever fails to reconcile, that is a reportable defect: contact support with the position identifier and the record date, and the finance desk will replay the run against the ledger. The log exists precisely so that conversation is short.',
        ],
      },
    ],
  },
];

export const INSIGHT_ARTICLE_MAP: ReadonlyMap<string, IInsightArticle> = new Map(
  INSIGHT_ARTICLES.map((article) => [article.slug, article]),
);
