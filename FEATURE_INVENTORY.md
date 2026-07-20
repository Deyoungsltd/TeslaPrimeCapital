# TeslaPrimeCapital — Master Feature Inventory & Capability Matrix

---

## 1. Domain Feature Catalog

This inventory enumerates every functional capability across **TeslaPrimeCapital**, mapped against domain responsibility and required stakeholder persona access:

### 1.1 Identity & Security Features (`IAM Domain`)
- **`FEAT-IAM-001` (Secure Registration):** Email registration with Zod complexity validation, referral binding, and Argon2id password hashing.
- **`FEAT-IAM-002` (OTP Verification):** Cryptographic 6-digit One-Time Password sent via Resend with 10-minute expiration and rate-limiting.
- **`FEAT-IAM-003` (MFA/TOTP Setup):** QR-code generation (`otplib`), secret key encryption, and emergency backup code generation.
- **`FEAT-IAM-004` (Device & Session Management):** Real-time tracking of active JWT/Redis sessions with remote termination capability ("Log out all devices").

### 1.2 Multi-Currency Wallet & Ledger Features (`Wallet Domain`)
- **`FEAT-WAL-001` (Segregated Sub-Balances):** Independent ledger balances for `USD`, `EUR`, `GBP`, `JPY`, `BTC`, `ETH`, `USDT`, and `USDC`.
- **`FEAT-WAL-002` (Exact Decimal Double-Entry Ledger):** Immutable `Debit`/`Credit` transaction logs with `NUMERIC(20,8)` precision and Redis `Redlock` mutex enforcement.
- **`FEAT-WAL-003` (Multi-Gateway Deposit Engine):** Automated payment gateway webhook verification (`Stripe`, `CoinPayments`) with network confirmation thresholds.
- **`FEAT-WAL-004` (Multi-Sig Withdrawal Disbursement):** Automated velocity screening for withdrawals < $5,000 and two-person manual sign-off (`FINANCE_MANAGER` + `SUPER_ADMIN`) for withdrawals >= $5,000.

### 1.3 Investment Marketplace & Accrual Engine Features (`Investment Domain`)
- **`FEAT-INV-001` (Dynamic Plan Catalog):** Tiered investment structure browsing with clear APR, term limits, and compounding options.
- **`FEAT-INV-002` (Capital Allocation & Locking):** Instant wallet debiting and investment locking into `ActiveInvestment` state.
- **`FEAT-INV-003` (Automated Daily/Hourly Yield Engine):** Asynchronous `BullMQ` batch worker calculating daily compound or simple interest precisely at 00:00 UTC.
- **`FEAT-INV-004` (Rollover & Principal Maturity Handling):** Automated principal return to wallet or reinvestment rollover upon term completion.

### 1.4 Compliance & Verification Features (`KYC Domain`)
- **`FEAT-KYC-001` (Tiered Verification Hierarchy):** Tier 0 ($1k limit), Tier 1 ($50k limit), and Tier 2 (EDD unlimited) progressive gating.
- **`FEAT-KYC-002` (Secure Private Document Upload):** Cloudinary authenticated private storage (`type: 'authenticated'`) strictly hidden from public CDNs.
- **`FEAT-KYC-003` (Compliance Officer Review Desk):** Ephemeral 5-minute signed delivery URLs with dynamic admin watermarking and audit logging.

### 1.5 Affiliate, Notification & Admin Features (`Governance Domain`)
- **`FEAT-AFF-001` (Multi-Tier Referral Commission Trees):** 3-tier reward structure (5% / 2% / 1%) triggered on qualifying investment events.
- **`FEAT-NOT-001` (Real-Time Notification Bell & Badge):** Server-Sent Events (`SSE`) streaming with Redis atomic unread counters and Resend email alerts.
- **`FEAT-ADM-001` (Granular RBAC Portal):** Specialized administrative interfaces segregated by `SUPER_ADMIN`, `COMPLIANCE_OFFICER`, and `FINANCE_MANAGER` roles.
