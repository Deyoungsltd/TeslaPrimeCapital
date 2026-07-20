# TeslaPrimeCapital — Coolify Deployment, Rollback & Disaster Recovery Architecture (`Phase 2`)

---

## 1. Coolify Production Deployment & Rolling Cutover Strategy

**Coolify** acts as our self-hosted cloud platform orchestrator. When the CD pipeline triggers a deployment webhook, Coolify executes a strict **Zero-Downtime Rolling Cutover**:

### 1.1 Step-by-Step Rolling Deployment Workflow
1. **Isolated Image Build:** Coolify pulls the latest commit from `arena/019f8047-teslaprimecapital` (during staging testing) or `main` (during production release) and builds the multi-stage Docker image inside an isolated staging builder container.
2. **Database Migration Execution (`DIRECT_URL`):** Before starting application replicas, Coolify executes `npx prisma migrate deploy` using the direct master database connection string (`DIRECT_URL` on port `5432`) to apply pending migrations safely without table locks.
3. **Replica Spin-Up & Liveness Polling:** Coolify starts the new application container (`v0.2.0`) alongside the running old container (`v0.1.0`). It continuously queries `GET /api/v1/healthz` every 5 seconds (`HEALTHCHECK --start-period=30s`).
4. **Proxy Cutover & Graceful Drain:** Only when the new container returns `{ status: "ok", db: true, redis: true }` for 3 consecutive polls does Coolify's internal reverse proxy (`Traefik/Nginx`) redirect incoming HTTPS web traffic (`port 443`) to the new container. A `SIGTERM` signal is then sent to the old container, allowing active requests 30 seconds to finish draining before termination.

---

## 2. Automated Rollback Protocol (`Coolify Quick Rollback`)

If a critical runtime defect or database anomaly occurs post-deployment:
- **Instant Container Revert:** Operators click "Rollback to Previous Build" inside Coolify console or issue an emergency webhook trigger (`cd-rollback.yml`). Coolify instantly redirects reverse proxy traffic back to the cached previous Docker image (`v0.1.0`) within **< 10 seconds**.
- **Database Schema Compatibility Rule:** To ensure instant rollback capability, **all database schema migrations must be strictly backward-compatible (`Expand and Contract` pattern)**. Dropping columns or renaming tables in a single migration is strictly prohibited; columns must first be deprecated and made nullable before removal in a subsequent release.

---

## 3. Disaster Recovery (DR) & Backup Restoration Procedures

- **PostgreSQL Point-in-Time Recovery (PITR):** Continuous Write-Ahead Log (WAL) files are streamed to offsite encrypted object storage (`AWS S3` / `MinIO`) with a Recovery Point Objective (**RPO <= 5 minutes**).
- **Automated Daily Full Snapshot (`pg_basebackup`):** A cold physical database snapshot (`.tar.gz` encrypted with `AES-256-GCM`) is exported every 24 hours at 03:00 UTC during low-traffic windows.
- **Cold Recovery Procedure (**RTO <= 30 minutes**):**
  1. Provision fresh bare-metal or cloud instance running Linux kernel 5.15+ and install Docker/Coolify.
  2. Restore encrypted `.env` secret vault from Coolify disaster recovery repository.
  3. Download latest `pg_basebackup` tarball and replay WAL logs up to the exact pre-failure timestamp (`recovery_target_time`).
  4. Execute `docker compose -f docker-compose.prod.yml up -d` to restore 100% operational readiness.
