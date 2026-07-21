# TeslaPrimeCapital — Horizontal & Vertical Scalability Roadmap

---

## 1. Multi-Phase Scaling Strategy

To balance initial infrastructure cost efficiency with massive global expansion headroom, the platform architecture scales across three pre-defined operational phases:

### 1.1 Phase A: Foundation Scale (0 to 10,000 Daily Active Users)
- **Topology:** Single-Node **Coolify** server running `Docker Compose` orchestrating two `Next.js/Node.js` app replicas, a local `PostgreSQL 16` container, and a single `Redis 7` container.
- **Throughput Capacity:** Up to 500 API requests/sec; 10,000 active daily accrual calculations completed in < 15 seconds via `BullMQ`.

### 1.2 Phase B: High-Availability Growth Scale (10,000 to 100,000 DAU)
- **Topology:** Split infrastructure into dedicated specialized tiers:
  - **Load Balancer Tier:** 2x redundant Edge routers (`Traefik/Nginx`).
  - **Stateless App Cluster:** 4x to 8x horizontally scaled `Node.js` / `Next.js` container replicas.
  - **Database Cluster:** Managed PostgreSQL Master with **PgBouncer** + 1x physical Read Replica to absorb 100% of analytical and read-heavy traffic.
  - **Cache Cluster:** Dedicated **Redis Cluster (3 Master + 3 Slave nodes)**.
- **Throughput Capacity:** Up to 5,000 API requests/sec; 100,000 daily accrual calculations completed across parallel worker threads in < 60 seconds.

### 1.3 Phase C: Global Enterprise Multi-Region Scale (500,000+ DAU)
- **Topology:** Global multi-region deployment across North America, Europe, and Asia.
- **Database Sharding:** Shard high-volume transactional tables (`Transaction`, `AccrualLog`) by geographic region or user ID range using PostgreSQL native declarative partitioning or `Citus` horizontal scaling.
- **Microservice Extraction:** Extract the `Daily Accrual Engine` into a high-concurrency dedicated Go/Rust or optimized Node microservice cluster capable of processing millions of compound yield calculations per minute.
