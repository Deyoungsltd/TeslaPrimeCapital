# TeslaPrimeCapital — Redis In-Memory Caching, Queue & Concurrency Architecture (`Phase 2`)

---

## 1. Redis Cluster Utilization & Key Namespace Taxonomy

**Redis 7+** operates as our centralized high-performance state store, handling multi-tier API caching, stateful refresh token tracking, rate-limiting leaky buckets, asynchronous `BullMQ` job queues, and critical `Redlock` distributed concurrency locking.

### 1.1 Key Namespace Inventory & Expiration Policies
| Key Namespace Pattern | Redis Data Type | TTL Expiration | Architectural Purpose & Description |
| :--- | :--- | :--- | :--- |
| **`cache:plans:active`** | String (`JSON.stringify`) | 3,600s (1 Hour) | Caches active investment plan catalog (`GET /api/v1/investments/plans`). |
| **`cache:user:perms:{ID}`**| String (`JSON.stringify`) | 900s (15 Mins) | Caches RBAC permission scope array for high-speed middleware authorization checks. |
| **`session:{SESSION_ID}`** | Hash (`HSET`) | 604,800s (7 Days) | Stateful refresh token metadata, device fingerprint, and IP binding. |
| **`otp:user:{ID}`** | String (`SHA-256 hash`) | 600s (10 Mins) | Hashed One-Time Password verification token. |
| **`rate:{scope}:{key}`** | Integer (`INCR`) | 60s / 900s / 3600s | Sliding window rate limiting counters across all endpoint boundaries. |
| **`unread_count:user_{ID}`**| Integer (`INCR/DECR`) | No Expiration (`0` reset)| Atomic unread notification badge counter served via `< 5ms` API query. |
| **`lock:wallet:usr_{ID}`** | String (`Redlock` Mutex)| 10s (Strict Lease) | Distributed mutex preventing race conditions during concurrent balance mutations. |
| **`lock:accrual:inv_{ID}`**| String (`Redlock` Mutex)| 30s (Strict Lease) | Distributed lock preventing duplicate yield worker calculations on the same investment. |

---

## 2. Distributed Concurrency Locking (`Redlock` Mutex Engine)

To completely eliminate **Double-Spend Race Conditions** (e.g., a user submitting two rapid withdrawal clicks before the database row lock commits), every balance-modifying service (`WalletService`, `InvestmentService`) must enforce our `Redlock` mutex protocol:

### 2.1 Mutex Execution Blueprint (`src/lib/redis.ts`)
```typescript
// Technical Architecture Specification for Concurrency Locking
export async function withWalletLock<T>(userId: string, action: () => Promise<T>): Promise<T> {
  const lockKey = `lock:wallet:usr_${userId}`;
  const lock = await redlock.acquire([lockKey], 10000); // 10,000ms lease time

  try {
    return await action(); // Executes Prisma transaction safely
  } finally {
    await lock.release();  // Guaranteed release even on failure
  }
}
```

---

## 3. Asynchronous Job Queue Topology (`BullMQ`)

To ensure resource-intensive worker operations never block synchronous HTTP request processing (`< 300ms write p95`), **BullMQ** runs on Redis across 4 isolated background queues:
1. **`accruals-queue`:** Executes daily at 00:00 UTC. Processes active investment maturity tracking (`payoutPolicy = 'LUMP_SUM_MATURITY'`) in paginated chunks (`take: 500, skip: cursor`).
2. **`email-queue` / `email-high-priority`:** Dispatches transactional React Email payloads via Resend (`concurrency: 20`, exponential backoff up to 5 retries).
3. **`webhooks-queue`:** Ingests raw payment gateway webhook payloads, verifies `HMAC-SHA256` signatures asynchronously, and credits wallets.
4. **`audit-batch-queue`:** Batches non-critical read activity logs into memory and flushes them to PostgreSQL in bulk (`prisma.auditLog.createMany`) every 10 seconds.
