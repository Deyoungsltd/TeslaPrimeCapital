# TeslaPrimeCapital — Database Architecture & Data Modeling Specification

---

## 1. Database Technology & ORM Selection

- **Primary Database Engine:** **PostgreSQL 16+** chosen for its industry-leading ACID compliance, robust concurrent transaction isolation (`READ COMMITTED` default, `SERIALIZABLE` where required for financial ledger modifications), native JSONB flexibility for audit metadata, and strict mathematical data types.
- **Object-Relational Mapping (ORM):** **Prisma ORM v5+** selected for type-safe schema modeling (`schema.prisma`), automated migration generation (`prisma migrate dev`), zero-downtime deployment capabilities (`prisma migrate deploy`), and native integration with TypeScript backend services.

---

## 2. Core Entity Modeling & Relational Integrity

The relational database model strictly separates identity, financial state, transactional history, and audit records. All tables must enforce strict primary keys (`UUID` v4), foreign key constraints with explicit `ON DELETE` / `ON UPDATE` behaviors, and comprehensive indexing on high-cardinality query columns.

### 2.1 Entity Summary & Relationship Matrix
1. **`User` Entity:** Core identity table storing basic credentials, registration status, compliance verification tier, and timestamps.
   - *Relations:* One-to-Many with `Session`, `Wallet`, `ActiveInvestment`, `Transaction`, `KYCDocument`, `SupportTicket`, `Notification`, and `UserReferral`.
2. **`Session` Entity:** Stores active cryptographic refresh tokens, device fingerprints, IP addresses, geographic location, and expiration markers.
3. **`KYCDocument` Entity:** Stores metadata, encrypted file paths (`Cloudinary` secure URL signatures), verification status (`PENDING`, `APPROVED`, `REJECTED`), verification level (`TIER_1`, `TIER_2`), and compliance review notes.
4. **`Wallet` Entity:** Segregated sub-balance records for each user per currency (`USD`, `EUR`, `BTC`, `ETH`, etc.) storing `availableBalance`, `lockedBalance`, and `totalDeposited`.
5. **`Transaction` Entity:** Immutable double-entry financial ledger capturing `transactionId`, `userId`, `walletId`, `type` (`DEPOSIT`, `WITHDRAWAL`, `INVESTMENT_LOCK`, `YIELD_PAYOUT`, `COMMISSION`, `PENALTY`), `amount` (`NUMERIC(20,8)`), `currency`, `status` (`PENDING`, `COMPLETED`, `FAILED`), and `idempotencyKey`.
6. **`Plan` Entity:** Catalog of available investment structures storing `name`, `description`, `minDeposit`, `maxDeposit`, `termDays`, `dailyRate` (`NUMERIC(20,8)`), `isCompoundingAllowed`, and `isActive`.
7. **`ActiveInvestment` Entity:** User capital allocations linked to a `Plan`, storing `principalAmount` (`NUMERIC(20,8)`), `currentValue`, `totalEarned`, `status` (`ACTIVE`, `COMPLETED`, `CANCELLED`), `startDate`, `maturityDate`, and `nextAccrualAt`.
8. **`AccrualLog` Entity:** Granular daily audit trail linking every single yield payout back to an `ActiveInvestment` and `Transaction` ID.
9. **`UserReferral` & `CommissionLog` Entities:** Tracks affiliate parent-child relationships and logs every commission earned with percentage calculations and payout status.
10. **`AuditLog` Entity:** System-wide immutable security log recording `userId`, `actorRole`, `actionType`, `resourceId`, `oldValue` (JSONB), `newValue` (JSONB), `ipAddress`, and `timestamp`.

---

## 3. Strict Financial Precision Standards (`NUMERIC(20,8)`)

To eliminate the catastrophic rounding drift and precision loss inherent in floating-point representations (`FLOAT`, `DOUBLE PRECISION`), every single financial attribute inside `schema.prisma` **must** use exact fixed-point decimal notation:
```prisma
model Wallet {
  id               String   @id @default(uuid())
  userId           String
  currency         String   // 'USD', 'EUR', 'BTC', 'ETH', 'USDT', 'USDC'
  availableBalance Decimal  @default(0.00000000) @db.Decimal(20, 8)
  lockedBalance    Decimal  @default(0.00000000) @db.Decimal(20, 8)
  totalDeposited   Decimal  @default(0.00000000) @db.Decimal(20, 8)
  updatedAt        DateTime @updatedAt
  user             User     @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@unique([userId, currency])
  @@index([userId])
}
```
*Engineering Rule:* Never perform mathematical operations inside raw JavaScript floating-point (`a + b`). Always use `decimal.js` or `Prisma.Decimal` methods (`balance.add(amount)`) inside Node.js services.

---

## 4. Database Indexing & Performance Strategy

To ensure sub-10ms query performance across tables containing millions of rows, the following indexing schema is mandatory:
- **Composite Unique Indexes:** `[userId, currency]` on `Wallet`; `[idempotencyKey]` on `Transaction`.
- **B-Tree Foreign Key Indexes:** All foreign key columns (`userId`, `walletId`, `planId`, `investmentId`) must have dedicated B-Tree indexes.
- **Timestamp & Status Composite Indexes:** `[status, nextAccrualAt]` on `ActiveInvestment` to allow the background daily accrual worker to fetch thousands of ripe investments via a single high-speed index scan (`WHERE status = 'ACTIVE' AND nextAccrualAt <= NOW()`).
- **Partitioning Strategy:** High-volume append-only tables (`Transaction`, `AccrualLog`, `AuditLog`) shall be partitioned monthly (`RANGE (timestamp)`) inside PostgreSQL once total database volume exceeds 10 million rows to preserve cache efficiency and rapid backup recovery.
