# TeslaPrimeCapital — Agile User Stories & Acceptance Criteria Specification

---

## 1. Investor Persona User Stories

### US-INV-001: User Registration & Email Verification
- **As an** prospective investor, **I want to** register an account using my email address and verify it via a secure One-Time Password (OTP), **so that** I can securely access the multi-currency wealth platform.
- **Acceptance Criteria (`Given/When/Then`):**
  - **Given** I am on `/register` and enter valid credentials (`user@example.com`, strong password, optional referral code),
  - **When** I submit the form,
  - **Then** the system creates my account in `PENDING_VERIFICATION` status, generates a 6-digit OTP, stores its SHA-256 hash inside Redis (`TTL 600s`), and dispatches an email via `Resend`.
  - **When** I enter the correct 6-digit OTP on `/verify-otp`,
  - **Then** the system marks my account `status = 'ACTIVE'`, sets my verification tier to `TIER_0`, and issues rotating JWT + Redis refresh tokens.

### US-INV-002: Capital Allocation into an Investment Plan
- **As an** active investor with $10,000 available USD wallet balance, **I want to** allocate $5,000 into the `Prime Dynamic Growth` plan, **so that** I can start generating daily compound interest.
- **Acceptance Criteria (`Given/When/Then`):**
  - **Given** I am authenticated on `/dashboard/investments` with `$10,000.00000000` available USD balance,
  - **When** I select the `Prime Dynamic Growth` plan, enter `$5,000.00000000`, and confirm allocation,
  - **Then** the system acquires a `Redlock` on my wallet, debits `$5,000.00000000` from `availableBalance`, creates an `ActiveInvestment` record with `nextAccrualAt = midnight UTC`, creates a double-entry `Transaction` (`DEPOSIT_LOCK`), releases the lock, and displays a success notification.

---

## 2. Admin & Compliance Persona User Stories

### US-ADM-001: Compliance Officer KYC Review & Approval
- **As a** Compliance Officer (`COMPLIANCE_OFFICER`), **I want to** review submitted passport documents via secure time-limited URLs, **so that** I can verify user identity without leaking sensitive PII to public cloud buckets.
- **Acceptance Criteria (`Given/When/Then`):**
  - **Given** I am logged into `/admin/kyc` with valid `COMPLIANCE_OFFICER` permissions,
  - **When** I click to inspect `KYCDocument` ID `kyc_998877`,
  - **Then** the backend verifies my role and calls Cloudinary to generate a signed URL (`type: 'authenticated'`, 5-minute TTL) overlaid with my admin ID watermark.
  - **When** I click `Approve Document`,
  - **Then** the system sets `KYCDocument.status = 'APPROVED'`, elevates the user to `TIER_1`, dispatches a `Resend` status notification email to the user, and writes an immutable record to the `AuditLog`.
