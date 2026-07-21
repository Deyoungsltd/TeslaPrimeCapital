# TeslaPrimeCapital — Backend Architecture & Service Layer Technical Design (`Phase 2`)

---

## 1. Backend Runtime & Architectural Segregation

The backend is engineered on **Node.js 20+ LTS** utilizing strict **TypeScript (`strict: true`)**. The backend code is organized into decoupled layers: **Controllers**, **Services**, **Repositories**, **Middlewares**, **Validators**, and **Workers**. This architecture guarantees zero coupling between HTTP protocol mechanics and core financial business logic.

---

## 2. Complete Backend Service Catalog & Responsibility Matrix

Every service file inside `src/server/services/` encapsulates a specific bounded domain. Below is the technical specification of responsibilities for each core service:

### 2.1 `AuthService` (`src/server/services/auth.service.ts`)
- **Responsibility:** Handles user identity lifecycle, secure credential validation, session token issuance, and rotation.
- **Technical Operations:**
  - Hashes passwords using **Argon2id** (`memoryCost: 65536, timeCost: 3, parallelism: 4`).
  - Generates 6-digit cryptographic random OTP codes (`crypto.randomInt(100000, 999999)`), stores salted `SHA-256` hashes inside Redis (`otp:user_{ID}`), and triggers `EmailService.sendOtp()`.
  - Generates 15-minute stateless JWT access tokens and 7-day cryptographic random refresh tokens stored in Redis (`session:{ID}`) and `Session` database table.
  - Verifies Time-based One-Time Passwords (`TOTP`) during MFA challenges using `otplib`.

### 2.2 `WalletService` (`src/server/services/wallet.service.ts`)
- **Responsibility:** Governs all financial ledger accounting, balance mutations, and multi-currency conversions.
- **Technical Operations:**
  - Enforces **Redis `Redlock` distributed locking** (`lock:wallet:usr_{ID}`, lease 10s) before any balance calculation or debit/credit operation.
  - Executes exact fixed-point arithmetic (`Decimal.add`, `Decimal.sub`) using `NUMERIC(20,8)` database fields.
  - Generates paired double-entry ledger records (`Debit` and `Credit` inside `Transaction` table) linked by a unique transaction reference (`TXN_ID`).
  - Evaluates withdrawal requests against the approved **100% Mandatory Admin Review** rule, transitioning all withdrawals immediately to `PENDING_REVIEW` status.

### 2.3 `InvestmentService` (`src/server/services/investment.service.ts`)
- **Responsibility:** Governs structured investment plan allocations and lifecycle execution.
- **Technical Operations:**
  - Verifies minimum and maximum plan allocation constraints (`minDeposit <= amount <= maxDeposit`).
  - Calls `WalletService.lockCapital()` to debit available wallet balance and lock funds inside an `ActiveInvestment` entity.
  - Implements the approved **Lump Sum at Plan Maturity** policy: tracks daily accrued yield internally within `AccrualLog` for dashboard chart visualization, but restricts actual wallet payout distribution until the exact `maturityDate` is reached.

### 2.4 `KYCService` (`src/server/services/kyc.service.ts`)
- **Responsibility:** Enforces anti-money laundering (AML) verification tiers and secure private document access.
- **Technical Operations:**
  - Implements the approved **Tier 0 Starter ($1,000 Limit without KYC)** policy: monitors cumulative deposits and blocks withdrawals or deposits > $1,000 until `User.kycTier >= TIER_1`.
  - Coordinates secure file direct upload signatures (`cloudinary.v2.utils.api_sign_request`) directing files strictly to authenticated private cloud folders (`/teslaprime/secure/kyc/{USER_ID}/`).
  - Generates time-limited 5-minute signed delivery URLs (`type: 'authenticated'`) strictly for authenticated compliance officers.

### 2.5 `EmailService` (`src/server/services/email.service.ts`)
- **Responsibility:** Renders dynamic email templates using React Email (`@react-email/components`) and dispatches via **Resend**.
- **Technical Operations:** Pushes serialized email payloads (`{ template, recipient, props }`) onto the asynchronous `email-queue` inside Redis (`BullMQ`) with exponential backoff retry configuration.

### 2.6 `NotificationService` (`src/server/services/notification.service.ts`)
- **Responsibility:** Multi-channel real-time alert dispatch (`NotificationEvent`).
- **Technical Operations:** Increments atomic unread badge counters inside Redis (`unread_count:user_{ID}`), writes persistence records to `Notification` table, and broadcasts live payload updates via Server-Sent Events (`SSE` at `/api/v1/notifications/stream`).

### 2.7 `AdminService` & `AuditService` (`src/server/services/admin.service.ts`, `audit.service.ts`)
- **Responsibility:** Enforces enterprise governance, RBAC role management, withdrawal sign-offs, and immutable activity logging.
- **Technical Operations:** Records every sensitive administrative or user write operation (`oldValue`, `newValue`, `ipAddress`, `actorRole`) inside the append-only `AuditLog` database table.

---

## 3. Request Lifecycle & Middleware Pipeline Specification

When an incoming HTTP request hits the backend API Gateway (`src/server/controllers/`), it passes through a strict sequential middleware chain:
```
[ Incoming HTTP Request ]
           │
           ▼
1. [ RateLimitMiddleware ] ──► (Checks Redis sliding window counter; returns 429 if rate exceeded)
           │
           ▼
2. [ AuthenticateMiddleware ] ──► (Verifies JWT header or triggers session cookie check; attaches `req.user`)
           │
           ▼
3. [ AuthorizeMiddleware ] ──► (Evaluates `checkPermission(req.user.role, requiredScope)`; returns 403 if forbidden)
           │
           ▼
4. [ ValidateMiddleware ] ──► (Parses `req.body` against exact Zod schema; returns 400 with detailed issues if invalid)
           │
           ▼
5. [ Controller -> Service -> Repository Execution ] ──► (Executes domain logic within Prisma transaction / Redlock)
           │
           ▼
6. [ Standardized JSON Envelope Response ] ──► (`{ success: true, data: {...}, meta: { timestamp, requestId } }`)
```
