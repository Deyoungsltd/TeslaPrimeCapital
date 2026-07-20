# TeslaPrimeCapital — System & Infrastructure Requirements Specification

---

## 1. Hosting Environment & Server Topology

**TeslaPrimeCapital** is designed for deployment on self-hosted, cloud-agnostic bare-metal or virtualized cloud instances orchestrated via **Coolify** and **Docker Engine**. The platform runs within isolated Docker containers to guarantee parity across local development, staging, and production environments.

### 1.1 Minimum Server Specifications (Phase A — Up to 10,000 Active Users)
| Node / Role | CPU Cores | RAM Memory | Storage (NVMe SSD) | Network Bandwidth |
| :--- | :--- | :--- | :--- | :--- |
| **Application & Edge Node** (Next.js SSR + Node API + Coolify Proxy) | 4 vCPU | 8 GB | 160 GB NVMe | 1 Gbps (Unmetered) |
| **Database & Cache Node** (PostgreSQL 16 Master + Redis 7 + BullMQ) | 4 vCPU | 16 GB | 320 GB NVMe (RAID-10) | 1 Gbps (Private VLAN) |

### 1.2 Recommended Production Specifications (Phase B — Up to 100,000+ Active Users)
| Node / Role | CPU Cores | RAM Memory | Storage (NVMe SSD) | Network Bandwidth |
| :--- | :--- | :--- | :--- | :--- |
| **Edge & Load Balancer Node** (Coolify Proxy / Traefik / Nginx) | 2 vCPU | 4 GB | 80 GB NVMe | 2.5 Gbps |
| **Application Server Cluster** (2x Node.js / Next.js Replicas) | 8 vCPU | 16 GB per node | 160 GB NVMe per node | 2.5 Gbps (Private VLAN) |
| **Worker Cluster** (Dedicated BullMQ Accrual & Webhook Workers) | 4 vCPU | 8 GB | 160 GB NVMe | 2.5 Gbps (Private VLAN) |
| **Primary Database Node** (PostgreSQL Master + PgBouncer) | 8 vCPU | 32 GB | 1.2 TB NVMe (RAID-10) | 2.5 Gbps (Private VLAN) |
| **Read Replica Database Node** (PostgreSQL Read Replica) | 4 vCPU | 16 GB | 1.2 TB NVMe | 2.5 Gbps (Private VLAN) |
| **In-Memory Cache Cluster** (Redis Cluster - 3 Nodes) | 4 vCPU | 16 GB total | 160 GB NVMe | 2.5 Gbps (Private VLAN) |

---

## 2. Software Runtime Dependencies & Prerequisites

To successfully build and run the platform, the operating environment must satisfy the following exact version dependencies:

| Component | Minimum Version | Recommended / Target Version | Architectural Notes |
| :--- | :--- | :--- | :--- |
| **Host Operating System** | Ubuntu 22.04 LTS / Debian 12 | Ubuntu 24.04 LTS | Linux Kernel 5.15+ required for optimal container cgroups v2 memory isolation. |
| **Docker Engine** | `v24.0.0+` | `v26.1.0+` | Must support BuildKit and multi-stage builds. |
| **Docker Compose** | `v2.20.0+` | `v2.27.0+` | Native Go-based compose engine (`docker compose`). |
| **Node.js Runtime** | `v20.10.0 LTS` | `v20.14.0 LTS` (Iron) | Native ESM support, high-speed V8 engine, strict memory management. |
| **PostgreSQL Database** | `v15.4+` | `v16.3+` | Must include `pg_stat_statements` and `uuid-ossp` / `pgcrypto` extensions enabled. |
| **Redis Cache Engine** | `v6.2+` | `v7.2+` | Must have persistence enabled (`AOF` + `RDB` hybrid) for distributed lock recovery. |
| **Prisma CLI / ORM** | `v5.10.0+` | `v5.15.0+` | Type-safe schema generation and migration engine. |

---

## 3. Network, Firewall & Security Group Configuration

To prevent unauthorized ingress while enabling global performance, host firewalls (`ufw` / cloud security groups) must be configured with strict zero-trust principles:

| Port Number | Protocol | Ingress Source | Destination / Service | Description |
| :--- | :--- | :--- | :--- | :--- |
| **80** | TCP | `0.0.0.0/0` (Global Internet) | Coolify Proxy / Traefik | HTTP traffic (automatically redirected to HTTPS Port 443 via Let's Encrypt). |
| **443** | TCP | `0.0.0.0/0` (Global Internet) | Coolify Proxy / Traefik | HTTPS encrypted traffic for web application and API endpoints. |
| **22** | TCP | Restricted Admin IP Whitelist | Host SSH Server | Server management access via SSH keys (`PasswordAuthentication no`). |
| **3000** | TCP | `172.18.0.0/16` (Docker Network) | Next.js Container | Internal container-to-container web traffic only. Blocked externally. |
| **5432 / 6432** | TCP | `172.18.0.0/16` (Docker Network) | PostgreSQL / PgBouncer | Direct database access restricted strictly to application/worker subnets. Blocked externally. |
| **6379** | TCP | `172.18.0.0/16` (Docker Network) | Redis Server | Internal caching and BullMQ job queue access. Blocked externally. |

---

## 4. Coolify Deployment & CI/CD Orchestration Prerequisites

1. **GitHub App / Git Hook Integration:** Coolify must be authenticated with the Git repository (`Deyoungsltd/TeslaPrimeCapital`) to enable automated webhook triggers on branch commits (`arena/019f8047-teslaprimecapital` during testing, `main` during production release).
2. **Environment Secret Vault:** All sensitive configuration variables (`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `SESSION_SECRET`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `MASTER_ENCRYPTION_KEY`) must be injected exclusively via Coolify's encrypted environment variable management console and must never be committed to Git or written to `.env` files on disk.
3. **Health Check Endpoints:** The Docker containers must expose standardized liveness checks (`GET /api/v1/healthz` returning `{ "status": "ok", "db": true, "redis": true }`) monitored by Coolify every 10 seconds to trigger automated container restart if unhealthy.
