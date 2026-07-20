# TeslaPrimeCapital — Master System Dependency & Integration Map (`Phase 2`)

---

## 1. System Integration & External Service Topology

This matrix documents exact inter-service dependencies, communication protocols, failure fallbacks, and retry strategies for every external dependency integrated within **TeslaPrimeCapital**:

```
                                  ┌────────────────────────┐
                                  │   TeslaPrimeCapital    │
                                  │   Next.js / Node.js    │
                                  └───────────┬────────────┘
         ┌──────────────────┬─────────────────┼─────────────────┬──────────────────┐
         ▼                  ▼                 ▼                 ▼                  ▼
┌──────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────────┐
│ PostgreSQL 16    │ │ Redis 7       │ │ Cloudinary    │ │ Resend Engine │ │ Payment Gateways │
│ + PgBouncer      │ │ Cluster       │ │ Secure Storage│ │ + React Email │ │ (Stripe/Crypto)  │
│ (TCP Port 6432)  │ │ (TCP Port 6379) │ │ (HTTPS API)   │ │ (HTTPS API)   │ │ (Webhook Ingress)│
└──────────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ └──────────────────┘
```

---

## 2. Dependency Matrix & Resilience Specifications

| Dependency Name | Protocol & Port | Architectural Responsibility | Timeout & Retry Policy | Failure Fallback / Circuit Breaker Action |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL 16 Master (via PgBouncer)** | `TCP : 6432` (`DATABASE_URL`) | Primary relational data store (`users`, `wallets`, `transactions`, `investments`, `auditLogs`). | `connect_timeout=10s`, pool `connection_limit=100` | If master unreachable, application transitions to read-only mode via Read Replica (`readReplicaUrl`); writes return `503 Service Unavailable`. |
| **PostgreSQL Read Replica** | `TCP : 5432` (`READ_REPLICA_URL`)| Offloads heavy analytical queries, dashboard browsing, and admin CSV report generation. | `connect_timeout=10s` | If replica fails, queries gracefully route back to master (`DATABASE_URL`) with logged warning. |
| **Redis 7 Cluster** | `TCP : 6379` (`REDIS_URL`) | In-memory cache, rotating refresh token state, rate-limit buckets, `BullMQ` job queues, and `Redlock` mutexes. | `connectTimeout=5000ms`, `maxRetriesPerRequest=3` | If Redis crashes, stateless API endpoints continue via short-lived 15m JWTs; write operations requiring `Redlock` (`deposit`, `withdraw`) freeze safely (`503 Error`). |
| **Cloudinary SDK (`cloudinary.v2`)** | `HTTPS : 443` (`CLOUDINARY_API_URL`)| Public UI CDN asset delivery (`q_auto,f_auto`) and private KYC document storage (`type: 'authenticated'`). | `timeout=15000ms`, `retries=2` | If Cloudinary upload API fails during KYC submission, the payload is queued locally in encrypted temp storage and retried by `webhook.worker.ts`. |
| **Resend Email API (`resend` SDK)** | `HTTPS : 443` (`RESEND_API_KEY`) | Dispatches transactional React Email payloads (OTP verification, login alerts, withdrawal notices). | `timeout=10000ms`, `retries=5` (Exponential Backoff) | If Resend API returns 5xx error, `BullMQ` `email-queue` automatically retries up to 5 times (`delay: 2000 * 2^attempt`) before moving to `email-dead-letter-queue`. |
| **Stripe / CoinPayments Gateways** | `HTTPS : 443` (`POST /api/v1/webhooks/*`)| Ingests incoming deposit webhooks and issues outgoing fiat/crypto disbursement requests. | Strict `HMAC-SHA256` signature verification | If webhook signature mismatch occurs, payload is rejected immediately (`HTTP 401`). If outgoing disbursement API times out, transaction remains `PENDING_REVIEW` in admin queue. |
