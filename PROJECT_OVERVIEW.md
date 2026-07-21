# TeslaPrimeCapital — Project Overview & Executive Summary

---

## 1. Product Vision & Background

**TeslaPrimeCapital** is conceived as a premier, enterprise-grade digital wealth management and automated investment platform. Serving a global retail and institutional clientele, the platform combines the transparency of multi-currency financial accounting with high-performance algorithmic allocation engines and rigorous regulatory compliance.

While taking functional inspiration from high-yield investment structures (e.g., `teslapremiumfinance.com`) and clean, premium visual design cues inspired by modern engineering leaders (`Tesla.com`), **TeslaPrimeCapital** is built strictly as an original, clean-room enterprise implementation. No proprietary code, layouts, copy, or visual assets are ever copied. The focus is entirely on institutional-grade security, mathematical precision, intuitive UX, and seamless global scalability.

---

## 2. Target Audience & Market Positioning

The platform is engineered to cater to three distinct investor segments across global jurisdictions:
1. **Retail Investors:** Individuals seeking accessible entry points into structured investment plans, multi-currency wallet management, and transparent daily compound or fixed-term yield generation.
2. **High-Net-Worth Individuals (HNWI) & VIPs:** Investors requiring enhanced daily liquidity limits, dedicated account managers, preferential yield tiers, and multi-signature security protocols.
3. **Institutional & Syndicate Partners:** Corporate entities and financial partners leveraging automated API access, structured capital allocation, and customizable affiliate commission structures.

---

## 3. Core Product Capabilities

### A. Multi-Currency Wallet Engine
- **Fiat Integration:** Native support for USD, EUR, GBP, and JPY with automated currency conversion tracking based on real-time oracle rates.
- **Crypto Integration:** Native support for Bitcoin (BTC), Ethereum (ETH), Tether (USDT - ERC20/TRC20), and USD Coin (USDC).
- **Exact Decimal Ledger:** Double-entry immutable accounting ledger ensuring every deposit, yield accrual, transfer, and withdrawal is tracked with exact `NUMERIC(20,8)` database precision to prevent floating-point drift.

### B. Dynamic Investment Engine
- **Structured Investment Plans:** Flexible creation of capital allocation strategies categorized by yield structure (Fixed-Term Yield, Daily Accrual with Optional Compounding, and Tiered Lock-up Pools).
- **Automated Yield Execution:** High-concurrency, idempotent background worker processing that calculates and distributes daily or hourly interest precisely at scheduled intervals without race conditions or duplicate payouts.
- **Principal & Profit Management:** Configurable maturity rules allowing principal return to wallet, automatic rollover into new investment terms, or continuous yield extraction.

### C. Enterprise Compliance & KYC/AML Center
- **Tiered Verification Levels:** Progressive Know Your Customer (KYC) requirements scaling from basic email/phone verification up to Enhanced Due Diligence (EDD) for high-volume transactors.
- **Secure Document Processing:** Encrypted storage and strict role-based access to sensitive government identification documents, proof of address, and biometric selfie checks via time-limited signed URLs.
- **Audit & Velocity Controls:** Automated monitoring of transaction velocities, sudden geographic IP shifts, and structured AML flagging alerts for manual compliance review.

### D. Multi-Tier Affiliate & Referral Network
- **Configurable Commission Trees:** Multi-level referral rewards (e.g., Tier 1: 5%, Tier 2: 2%, Tier 3: 1%) triggered either on initial deposit or yield accrual events based on administrative policy.
- **Transparent Attribution:** Real-time tracking of click-through rates, active sign-ups, and commission payouts with instant wallet crediting and comprehensive exportable audit trails.

---

## 4. Key Differentiators

| Strategic Pillar | Standard Retail Platforms | TeslaPrimeCapital Enterprise Implementation |
| :--- | :--- | :--- |
| **Financial Accounting** | Single-table balances prone to race conditions and floating-point rounding errors (`FLOAT`). | Double-entry immutable ledger (`Transaction` + `BalanceSnapshot`) utilizing strict `NUMERIC(20,8)` database precision and Redis `Redlock` distributed locking. |
| **Security Architecture** | Basic password auth, unencrypted file uploads, and implicit session trust. | Argon2id password hashing, mandatory MFA for high-risk actions, strict RBAC segregation, encrypted private KYC storage, and real-time IP/device velocity checks. |
| **Scalability Strategy** | Monolithic synchronous execution where daily accrual calculations block web requests. | Decoupled asynchronous worker topology utilizing Redis BullMQ queues, read-replica database splitting, and edge-cached static rendering via Next.js and Coolify. |
| **Regulatory Readiness** | Ad-hoc manual verification with unencrypted ID files stored on public object servers. | Formal 3-tier AML verification hierarchy, automated document expiration alerts, compliance officer workflow queues, and full GDPR/CCPA data export/erasure compliance hooks. |

---

## 5. Summary of Engineering Panel Recommendations & Options

Our senior engineering panel reviewed all major architectural crossroads and presents the following recommended configuration for Phase 1 sign-off:

1. **Authentication State Model:**
   - *Option A: Pure Stateless JWT.* (Low server memory overhead, but impossible to instantly revoke compromised tokens without complex blacklists).
   - *Option B: Pure Stateful Redis Sessions.* (High security and instant revocation, but requires Redis lookup on every API call).
   - *Option C (Recommended): Hybrid Rotating Session Model.* Short-lived JWT access tokens (15 minutes) combined with strict, stateful httpOnly rotating refresh tokens stored in Redis. This guarantees instant revocation capabilities while keeping 95% of read-heavy API authorization checks lightweight and stateless.

2. **Yield Calculation & Accrual Engine:**
   - *Option A: Real-time on-demand calculation during page load.* (Creates massive CPU load and locking bottlenecks during user spikes).
   - *Option B (Recommended): Scheduled Asynchronous Batch Processing via BullMQ.* A dedicated cron-triggered worker service pulls active investments in paginated chunks (500 records per batch), acquires explicit row locks or distributed Redis locks, computes exact decimal yield, writes to the immutable transaction ledger, and updates wallet balances atomically.

3. **Media & KYC Storage Architecture:**
   - *Option A: Single Cloudinary bucket for all assets.* (Exposes sensitive government identification documents to public CDN guessing).
   - *Option B (Recommended): Segregated Dual-Storage Strategy.* Public UI elements (logos, plan graphics, banners) are hosted on Cloudinary with CDN caching (`f_auto,q_auto`). Sensitive KYC files (passports, tax IDs, selfies) are uploaded to a strict private authenticated folder (`type: 'authenticated'`), accessible only via time-limited signed URLs generated exclusively when a authenticated `COMPLIANCE_OFFICER` or `SUPER_ADMIN` requests access.

---

## 6. Outstanding Decisions & User Approval Checklist

Before proceeding to **Phase 2 (Enterprise System Architecture & Technical Design)**, the engineering team requests explicit confirmation or direction on the following business policy decisions:

- [x] **Decision 1: Yield Accrual Frequency (APPROVED: Lump Sum at Plan Maturity).** Yield is calculated and locked throughout the investment lifecycle and distributed to the user's wallet as a single lump sum alongside the principal upon plan maturity.
- [x] **Decision 2: KYC Mandatory Enforcement Threshold (APPROVED: Tier 0 Starter with $1,000 Limit without KYC).** Users can deposit up to $1,000 USD equivalent and browse/allocate into basic plans without KYC. Mandatory Tier 1 ID verification is enforced prior to any withdrawal or when cumulative deposits exceed $1,000.
- [x] **Decision 3: Withdrawal Review & Disbursement Policy (APPROVED: Mandatory Admin Approval for All Withdrawals).** Every single withdrawal request submitted by a user is placed in a `PENDING_REVIEW` queue where an authorized Admin (`FINANCE_MANAGER` or `SUPER_ADMIN`) must review and explicitly approve the request before funds are released/disbursed.
- [x] **Decision 4: Referral Commission Trigger (APPROVED: Active Investment Allocation).** Affiliate referral commissions are credited only when the referred user locks capital into an Active Investment Plan. If a plan is cancelled early or clawed back, unvested commission is offset or clawed back, eliminating deposit-withdrawal turnover manipulation.

Once these foundational policies are confirmed, the engineering organization is ready to lock Phase 1 documentation and advance directly to Phase 2 Technical Architecture.
