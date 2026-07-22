/**
 * Canonical FAQ content — single source of truth for the /faq page render
 * and its FAQPage structured-data graph, keeping markup and content in sync.
 */
export const FAQ_ITEMS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'When is my capital settled?',
    a: 'Under the Lump-Sum Maturity Policy, daily compounding yield accrues off-ledger for the entire term of your plan. At 00:00 UTC on maturity day, your principal plus the full compounded yield is credited to your available wallet in a single settlement. Nothing pays out early; nothing is held late.',
  },
  {
    q: 'Can I exit a plan before it matures?',
    a: 'No. Allocations are term-locked from the moment you confirm at checkout — 3, 7, 14, or 24 days depending on the pool. The term and the fixed maturity date are shown before you commit. Only allocate capital you can comfortably lock for the full duration.',
  },
  {
    q: 'Can I allocate before completing identity verification?',
    a: 'Yes. Tier-0 clearance is granted automatically at registration and permits cumulative allocations up to $1,000 USD equivalent. Tier-1 verification — government-issued ID plus a selfie match — is required before any withdrawal and before deposits above the ceiling. Tier-2 opens the flagship Diamond pool from $50,000.',
  },
  {
    q: 'Which currencies can I deposit and withdraw?',
    a: 'Eight settlement rails are supported on one account: USD, EUR, GBP, and JPY on fiat rails; BTC, ETH, USDT, and USDC on digital rails. Balances across all currencies are normalized under one fixed-point ledger, shown side-by-side in your terminal.',
  },
  {
    q: 'How long do deposits take to credit?',
    a: 'Fiat deposits credit after confirmation by the originating rail; digital-asset deposits credit after the required network confirmations for the chain used (Bitcoin, Ethereum, or TRC20/ERC20 for stablecoins). Every confirmation step is visible as a ledger event in your transaction history.',
  },
  {
    q: 'How are withdrawals processed?',
    a: 'Funds lock instantly when you submit the request, then enter a pending-review queue. A finance manager authorizes the release with two-factor TOTP attestation — there is no automated gateway disbursement on this platform. First-time destinations may receive an additional verification contact.',
  },
  {
    q: 'How is the daily yield actually calculated?',
    a: 'The accrual engine runs at 00:00 UTC daily. For each active position it compounds the position value at the plan’s fixed daily rate and writes one AccrualLog record per run. Your accumulated yield is visible in the terminal at all times, but it settles into spendable balance only at maturity.',
  },
  {
    q: 'How does the referral program pay?',
    a: 'Three tiers: 5% on direct partners, 2% on their partners, and 1% on the third level — measured on qualifying allocated amounts. Commissions vest only when referred capital allocates into a structured plan, never on sign-ups alone, and credit to your USD wallet automatically.',
  },
  {
    q: 'What fees does the platform charge?',
    a: 'No management fee, no performance fee, no custody fee. Digital-asset withdrawals carry only the network fee required by the chain itself at broadcast time. If that ever changes, the fee schedule will be published before any change takes effect.',
  },
  {
    q: 'How is my account actually secured?',
    a: 'Passwords are Argon2id-hashed; session and two-factor secrets are AES-256-GCM encrypted; sessions use short-lived access tokens with rotating refresh tokens; sensitive release actions in the admin layer require two-factor attestation and are written to an immutable audit log. You can additionally enable TOTP two-factor authentication on your own login at any time.',
  },
];
