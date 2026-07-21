# TeslaPrimeCapital — Functional Requirements Specification

---

## 1. User Onboarding, Authentication & Profile Management

### 1.1 Account Registration & Identity Creation
- **FR-AUTH-001:** The system shall allow users to register using a valid email address, secure password, and optional referral code.
- **FR-AUTH-002:** The system shall enforce password complexity standards: minimum 12 characters, including uppercase, lowercase, numerical digit, and special symbol.
- **FR-AUTH-003:** Upon registration, the system shall generate a 6-digit cryptographic One-Time Password (OTP) sent via `Resend` email, valid for 10 minutes. Account status remains `PENDING_VERIFICATION` until OTP confirmation.
- **FR-AUTH-004:** The system shall support Time-based One-Time Password (TOTP) Multi-Factor Authentication (MFA) via authenticator applications (Google Authenticator, Authy). MFA must be mandatory for withdrawal requests and account security changes.

### 1.2 Session & Security Management
- **FR-AUTH-005:** The system shall track and display all active user sessions, capturing IP address, user-agent/device type, geographic region, and last activity timestamp.
- **FR-AUTH-006:** Users shall be able to remotely terminate any or all active sessions ("Log out of all devices"), which immediately invalidates the corresponding Redis refresh tokens.

---

## 2. Know Your Customer (KYC) & Verification Workflows

- **FR-KYC-001:** The system shall categorize users into three distinct compliance verification tiers:
  - **Tier 0 (Unverified):** Email verified only. Maximum cumulative deposit limit: $1,000 equivalent. Withdrawals disabled.
  - **Tier 1 (Identity Verified):** Requires submission of government-issued ID (Passport, Driver's License, or National Identity Card) and liveness selfie check. Maximum monthly withdrawal: $50,000 equivalent.
  - **Tier 2 (Enhanced Due Diligence):** Requires proof of residential address (utility bill or bank statement < 3 months old) and source of funds declaration. Unlimited deposit and withdrawal ceilings (subject to multi-sig review).
- **FR-KYC-002:** All KYC uploaded documents must be stored directly in secure private cloud storage (`Cloudinary` authenticated folders or private S3) and must never be accessible via public URLs.
- **FR-KYC-003:** Compliance officers shall have a dedicated review dashboard (`/admin/kyc`) to inspect submitted documents, view automated fraud indicators, and approve, reject, or request resubmission with detailed notes.

---

## 3. Wallet & Financial Ledger Operations

### 3.1 Multi-Currency Balances & Ledger Accounting
- **FR-WAL-001:** Each user account shall maintain segregated wallet sub-balances for each supported fiat (`USD`, `EUR`, `GBP`, `JPY`) and crypto (`BTC`, `ETH`, `USDT`, `USDC`) asset.
- **FR-WAL-002:** Every balance modification (deposit, withdrawal, investment lock, yield payout, commission crediting) must generate two immutable double-entry ledger entries (`Debit` and `Credit`) linked by a unique transaction reference ID (`TXN_ID`).
- **FR-WAL-003:** Direct balance mutations (e.g., `UPDATE wallet SET balance = balance + 100`) without a corresponding transaction log entry are strictly prohibited at the database architecture level.

### 3.2 Deposit & Withdrawal Workflows
- **FR-DEP-001:** For crypto deposits, the system shall integrate with secure payment gateway webhooks or generate unique deterministic deposit addresses per user asset, requiring explicit network confirmation thresholds (e.g., 3 confirmations for BTC, 12 for ETH/ERC20) before crediting balances.
- **FR-WTH-001:** When a user initiates a withdrawal, the system shall verify sufficient unencumbered wallet balance, verify 2FA/MFA token verification, and immediately transition the requested funds into a `LOCKED_FOR_WITHDRAWAL` status while generating a `PENDING` withdrawal ticket.
- **FR-WTH-002:** Per approved enterprise treasury policy, **every single withdrawal request** regardless of amount transitions immediately to `PENDING_REVIEW` status and must be manually inspected and approved by an authorized Admin (`FINANCE_MANAGER` or `SUPER_ADMIN`) before funds are released to external banking or crypto gateways.

---

## 4. Investment Plan Execution & Daily Accrual Engine

- **FR-INV-001:** Users shall browse active investment plans categorized by term length, minimum/maximum capital requirements, and projected return rates.
- **FR-INV-002:** When allocating capital into a plan, the system shall debit the user's available wallet balance, create an `ActiveInvestment` record, and lock the capital for the specified term duration.
- **FR-INV-003:** Per approved investment accrual policy (**Lump Sum at Plan Maturity**), while internal daily tracking records (`AccrualLog`) can be computed for dashboard growth visualization, actual yield distribution to the user's `AvailableWallet` is locked throughout the term duration and disbursed as a single consolidated lump sum alongside the returned principal on the exact scheduled `maturityDate`.
- **FR-INV-004:** Upon plan maturity, the system shall automatically return the initial principal balance plus any remaining unpaid interest to the user's primary wallet and mark the investment status as `COMPLETED`.

---

## 5. Administration, Support & Reporting Capabilities

- **FR-ADM-001:** The platform shall provide a comprehensive administrative portal (`/admin`) governed by strict Role-Based Access Control (RBAC).
- **FR-SUP-001:** The system shall include an integrated support ticketing system where users can create tickets, attach screenshots (public asset upload), and communicate securely with `SUPPORT_AGENT` personnel without exposing account financial credentials.
- **FR-REP-001:** The system shall generate exportable CSV and PDF financial statement reports for users detailing their complete transaction history, daily accruals, and tax reporting summaries.
