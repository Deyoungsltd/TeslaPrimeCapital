# TeslaPrimeCapital — PostgreSQL Database Scaling & Management Strategy

---

## 1. Connection Pooling & Proxy Architecture (`PgBouncer`)

As the platform scales horizontally, Node.js and Next.js container replicas can rapidly exhaust physical database connections. To prevent `FATAL: remaining connection slots are reserved for non-replication superuser roles`, **PgBouncer** is placed directly in front of the PostgreSQL cluster:

### 1.1 Pooling Modes & Configuration
- **Pooling Mode:** `Transaction Pooling` configured inside PgBouncer. Server connections are assigned to client applications strictly during the duration of a single `BEGIN ... COMMIT` database transaction, then returned immediately to the pool.
- **Connection Ratio:** Up to **5,000 concurrent application client connections** are multiplexed down to a strict, optimized pool of **100 physical PostgreSQL connections**.
- **Prisma Configuration:** The application utilizes two separate connection strings injected via Coolify environment variables:
  - `DATABASE_URL`: Routes through `PgBouncer` on port `6432` using `?pgbouncer=true` for standard high-concurrency API operations.
  - `DIRECT_URL`: Routes directly to PostgreSQL master on port `5432` used strictly during deployment for `prisma migrate deploy` schema structural changes.

---

## 2. Read/Write Replica Topology & Query Splitting

To ensure user dashboard browsing (`GET /api/v1/investments`) or complex administrative CSV exports (`GET /api/v1/admin/reports`) never degrade real-time transaction processing, read operations are routed to dedicated read replicas:

```
[ Node.js API Service ]
       │
       ├─ Write Operations (POST / PUT / DELETE) ──► [ PgBouncer ] ──► [ PostgreSQL Master (Read/Write) ]
       │                                                                      │
       └─ Read Operations (GET / Dashboard Feeds) ─► [ PgBouncer ] ──► [ PostgreSQL Read Replica (Async WAL) ]
```

---

## 3. Backup, Point-In-Time Recovery (PITR) & Maintenance Schedule

- **Continuous WAL Archiving:** Write-Ahead Log (WAL) files are continuously streamed to offsite, encrypted object storage (`AWS S3` or self-hosted `MinIO` cluster) with a recovery point objective (RPO) of **<= 5 minutes**.
- **Automated Daily Full Snapshot:** A cold, encrypted physical database snapshot (`pg_basebackup`) is taken every 24 hours at 03:00 UTC during low-traffic windows.
- **Vacuum & Index Maintenance Schedule:** Automated `autovacuum` workers run continuously to clean up dead tuples from high-frequency update tables (`Wallet`, `ActiveInvestment`). A scheduled maintenance task executes `REINDEX TABLE CONCURRENTLY` monthly to eliminate B-Tree index bloat without locking user tables.
