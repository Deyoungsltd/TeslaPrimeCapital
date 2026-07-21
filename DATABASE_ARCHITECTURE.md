# TeslaPrimeCapital — Database Architecture & Logical Schema Technical Design (`Phase 2`)

---

## 1. Relational Modeling Strategy & Strict Financial Rules

In strict adherence to Phase 2 rules, **no executable Prisma model code block blocks or SQL migration scripts are generated in this document**. This specification documents the exact logical relational database design, table structures, relationships, exact data types, constraints, indexing rules, and cascade strategies to be implemented in Phase 3.

### 1.1 Strict Fixed-Point Precision Requirement (`NUMERIC(20,8)`)
Every financial figure across all tables (`Wallet`, `Transaction`, `Plan`, `ActiveInvestment`, `AccrualLog`) MUST be modeled in the database schema using exact fixed-point decimal notation: **`NUMERIC(20, 8)`** (represented in Prisma as `Decimal @db.Decimal(20, 8)`). This ensures 8 decimal places of exact precision for satoshis and micro-units while preventing floating-point rounding drift.

---

## 2. Logical Table Specifications & Data Dictionary

### 2.1 `users` (Core Identity & Compliance Tier)
- **Primary Key:** `id` (`UUIDv4`, Indexed, Unique)
- **Attributes:** `email` (`VARCHAR(255)`, Unique), `passwordHash` (`VARCHAR(255)`, Argon2id), `firstName` (`VARCHAR(100)`), `lastName` (`VARCHAR(100)`), `phone` (`VARCHAR(50)`), `role` (`ENUM`: `SUPER_ADMIN`, `COMPLIANCE_OFFICER`, `FINANCE_MANAGER`, `SUPPORT_AGENT`, `AFFILIATE_PARTNER`, `INVESTOR`), `status` (`ENUM`: `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `LOCKED`), `kycTier` (`ENUM`: `TIER_0`, `TIER_1`, `TIER_2`, Default `TIER_0` per approved policy), `twoFactorEnabled` (`BOOLEAN`), `twoFactorSecret` (`VARCHAR(255)`, AES-256 encrypted), `backupCodes` (`JSONB`, Argon2id hashes), `referralCode` (`VARCHAR(50)`, Unique), `referredById` (`UUIDv4`, Nullable FK to `users.id`), `createdAt` (`TIMESTAMP_TZ`), `updatedAt` (`TIMESTAMP_TZ`).
- **Relationships:** One-to-Many `sessions`, `wallets`, `investments`, `transactions`, `kycDocuments`, `supportTickets`, `notifications`, `auditLogs`.

### 2.2 `sessions` (Rotating Token State Store)
- **Primary Key:** `id` (`UUIDv4`)
- **Attributes:** `userId` (`UUIDv4`, FK to `users.id`), `refreshTokenHash` (`VARCHAR(255)`, Unique SHA-256 hash), `deviceFingerprint` (`VARCHAR(255)`), `ipAddress` (`VARCHAR(64)`), `userAgent` (`TEXT`), `expiresAt` (`TIMESTAMP_TZ`, Indexed), `createdAt` (`TIMESTAMP_TZ`).
- **Cascade Rules:** `ON DELETE CASCADE` (Deleting a user wipes all their sessions).

### 2.3 `wallets` (Multi-Currency Segregated Sub-Balances)
- **Primary Key:** `id` (`UUIDv4`)
- **Attributes:** `userId` (`UUIDv4`, FK to `users.id`), `currency` (`VARCHAR(10)`: `USD`, `EUR`, `GBP`, `JPY`, `BTC`, `ETH`, `USDT`, `USDC`), `availableBalance` (`NUMERIC(20,8)`, Default `0.00000000`), `lockedBalance` (`NUMERIC(20,8)`, Default `0.00000000`), `totalDeposited` (`NUMERIC(20,8)`, Default `0.00000000`), `totalWithdrawn` (`NUMERIC(20,8)`, Default `0.00000000`), `updatedAt` (`TIMESTAMP_TZ`).
- **Constraints:** Unique composite index on `[userId, currency]`.
- **Cascade Rules:** `ON DELETE RESTRICT` (A user account with active wallet history cannot be hard-deleted).

### 2.4 `transactions` (Immutable Double-Entry Financial Ledger)
- **Primary Key:** `id` (`UUIDv4`)
- **Attributes:** `transactionId` (`VARCHAR(64)`, Unique human-readable reference `TXN_20260720_...`), `userId` (`UUIDv4`, FK to `users.id`), `walletId` (`UUIDv4`, FK to `wallets.id`), `type` (`ENUM`: `DEPOSIT`, `WITHDRAWAL`, `INVESTMENT_LOCK`, `YIELD_PAYOUT`, `COMMISSION`, `PENALTY`, `EXCHANGE`), `amount` (`NUMERIC(20,8)`), `currency` (`VARCHAR(10)`), `status` (`ENUM`: `PENDING_REVIEW`, `PROCESSING`, `COMPLETED`, `REJECTED`, `FAILED`), `metadata` (`JSONB`, storing payment gateway receipt or bank wire reference), `approvedById` (`UUIDv4`, Nullable FK to `users.id` for multi-sig sign-off), `idempotencyKey` (`VARCHAR(128)`, Unique composite index), `createdAt` (`TIMESTAMP_TZ`, Indexed).
- **Cascade Rules:** `ON DELETE RESTRICT` (Ledger records are strictly append-only and immutable).

### 2.5 `plans` & `active_investments` (Investment Marketplace & Lump-Sum Engine)
- **`plans` Table:** `id` (`UUIDv4`), `name` (`VARCHAR(100)`), `description` (`TEXT`), `minDeposit` (`NUMERIC(20,8)`), `maxDeposit` (`NUMERIC(20,8)`), `termDays` (`INTEGER`), `dailyRate` (`NUMERIC(20,8)`), `isCompounding` (`BOOLEAN`), `isActive` (`BOOLEAN`), `createdAt`, `updatedAt`.
- **`active_investments` Table:** `id` (`UUIDv4`), `userId` (`UUIDv4`, FK to `users.id`), `planId` (`UUIDv4`, FK to `plans.id`), `principalAmount` (`NUMERIC(20,8)`), `currentAccruedYield` (`NUMERIC(20,8)`, Default `0.00000000`), `status` (`ENUM`: `ACTIVE`, `MATURED`, `CANCELLED`), `payoutPolicy` (`ENUM`: `LUMP_SUM_MATURITY` per approved policy), `startDate` (`TIMESTAMP_TZ`), `maturityDate` (`TIMESTAMP_TZ`, Indexed), `nextAccrualAt` (`TIMESTAMP_TZ`, Indexed), `createdAt`, `updatedAt`.
- **Cascade Rules:** `ON DELETE RESTRICT`.

### 2.6 `kyc_documents` (Secure Private Document Metadata)
- **Primary Key:** `id` (`UUIDv4`)
- **Attributes:** `userId` (`UUIDv4`, FK to `users.id`), `documentType` (`ENUM`: `PASSPORT`, `NATIONAL_ID`, `DRIVERS_LICENSE`, `PROOF_OF_ADDRESS`, `SELFIE`), `cloudinaryPublicId` (`VARCHAR(255)`, Private authenticated folder ID), `status` (`ENUM`: `PENDING_REVIEW`, `APPROVED`, `REJECTED`), `reviewNotes` (`TEXT`), `reviewedById` (`UUIDv4`, Nullable FK to `users.id`), `createdAt` (`TIMESTAMP_TZ`), `updatedAt` (`TIMESTAMP_TZ`).

### 2.7 `audit_logs` (Immutable Governance Activity Ledger)
- **Primary Key:** `id` (`UUIDv4`)
- **Attributes:** `userId` (`UUIDv4`, Nullable FK to `users.id`), `actorRole` (`VARCHAR(50)`), `actionType` (`VARCHAR(100)`), `resourceId` (`VARCHAR(255)`), `oldValue` (`JSONB`), `newValue` (`JSONB`), `ipAddress` (`VARCHAR(64)`), `userAgent` (`TEXT`), `timestamp` (`TIMESTAMP_TZ`, Indexed).

---

## 3. Database Indexing & Performance Optimization Architecture

To guarantee sub-10ms query execution across high-volume tables:
- **Composite Unique Indexes:** `[userId, currency]` on `wallets`; `[idempotencyKey]` on `transactions`.
- **B-Tree Foreign Key & Status Indexes:** `[userId, status]` on `active_investments`; `[status, maturityDate]` on `active_investments` (allowing the background worker to fetch muring investments instantly via index scan).
- **Partitioning Strategy:** High-volume tables (`transactions`, `audit_logs`) shall be partitioned monthly using PostgreSQL native declarative partitioning once row volume exceeds 10 million entries.
