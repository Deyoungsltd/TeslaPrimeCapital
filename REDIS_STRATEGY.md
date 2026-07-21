# TeslaPrimeCapital — Redis In-Memory Caching, Queue & Concurrency Strategy

---

## 1. Redis Cluster Utilization & Key Architecture

**Redis 7+** serves as the high-speed spinal cord of **TeslaPrimeCapital**, handling multi-tier caching, distributed job orchestration, rate-limiting leaky buckets, and strict concurrency locking. All keys must adhere to a standardized, namespace-prefixed structure:

### 1.1 Namespace Key Inventory
| Key Pattern / Namespace | Data Structure | Expiration (TTL) | Purpose & Description |
| :--- | :--- | :--- | :--- |
| **`cache:plans:active`** | String (JSON) | 3,600s (1 Hour) | Caches active investment plan catalogs to serve `GET /api/v1/plans` with zero DB queries. |
| **`cache:user:perms:{ID}`** | String (JSON) | 900s (15 Mins) | Caches user role and RBAC permission array for high-speed middleware authorization. |
| **`session:{SESSION_ID}`** | Hash (`HSET`) | 604,800s (7 Days) | Stateful refresh token metadata, device fingerprint, and IP address. |
| **`otp:user:{ID}`** | String (Hashed) | 600s (10 Mins) | Hashed OTP code for email/phone verification (`SHA-256` of code). |
| **`rate:ip:{IP}:{ENDPOINT}`**| Integer (`INCR`) | 60s (1 Minute) | Sliding window rate limiting counter for API requests. |
| **`lock:accrual:inv_{ID}`** | String (Redlock)| 30s (Strict TTL) | Distributed mutex lock preventing duplicate yield accrual worker execution. |
| **`lock:wallet:usr_{ID}`** | String (Redlock)| 10s (Strict TTL) | Distributed lock preventing race conditions during concurrent deposits/withdrawals. |

---

## 2. Distributed Locking Protocol (`Redlock` for Race Condition Prevention)

In a high-concurrency financial platform, two simultaneous requests (e.g., a user submitting two rapid withdrawal clicks or two background worker instances processing the same cron job) can result in a **Double-Spend Vulnerability** if handled via naive database reads.

### 2.1 Execution Protocol for Wallet Mutations
Before any backend service can read a wallet balance with the intention of debiting or crediting funds, it **must** acquire a distributed Redis lock using the `Redlock` algorithm:
```typescript
// Architectural Mutex Specification Example
const lockKey = `lock:wallet:usr_${userId}`;
const lock = await redlock.acquire([lockKey], 10000); // 10 second lease time

try {
  // 1. Check current balance inside PostgreSQL with explicit row-level lock
  // 2. Perform exact mathematical balance mutation (Decimal.add / Decimal.sub)
  // 3. Write double-entry transaction log to ledger
  // 4. Commit Prisma database transaction
} finally {
  // 5. Release Redlock immediately upon transaction commit or rollback
  await lock.release();
}
```

---

## 3. Background Job Queue Topology (`BullMQ`)

The platform utilizes `BullMQ` running on Redis to decouple latency-sensitive web requests from resource-intensive background processing:
- **`accruals-queue`:** Processes daily and hourly compound interest calculations in chunks of 500 records.
- **`email-queue` / `email-high-priority`:** Dispatches transactional email payloads via `Resend`.
- **`webhooks-queue`:** Ingests and verifies incoming payment confirmations from crypto and fiat gateways.
- **`audit-batch-queue`:** Batches non-critical read activity logs into memory and flushes them to PostgreSQL in bulk (`insertMany`) every 10 seconds to preserve database write IOPS.
