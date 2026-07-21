# TeslaPrimeCapital — Non-Functional Requirements Specification

---

## 1. Availability, Reliability & High Availability (HA)

- **NFR-AVA-001 (Service Level Objective - SLO):** The platform shall achieve a minimum production availability uptime of **99.99%** (less than 52.6 minutes of unplanned downtime per year) excluding scheduled maintenance windows.
- **NFR-REL-001 (Fault Tolerance):** All stateless application services (`Next.js` and `Node.js API`) must run across at least 2 redundant container replicas within the `Coolify` cluster behind an automated load balancer and reverse proxy (`Traefik/Nginx`).
- **NFR-REL-002 (Idempotency):** All stateful financial endpoints (deposits, investment allocations, withdrawals, accrual calculations) must be strictly idempotent. Re-sending identical request payloads with the same `Idempotency-Key` header shall return the cached success response without duplicating database ledger mutations.

---

## 2. Performance & Latency Budgets

### 2.1 API & Backend Processing
- **NFR-PERF-001 (Read API Latency):** 95% (p95) of all read-only API requests (e.g., fetching wallet balances, browsing investment plans, viewing transaction history) must complete within **150ms** under normal load (up to 2,000 requests/sec).
- **NFR-PERF-002 (Write API Latency):** 95% (p95) of all transactional write requests (e.g., placing an investment, creating a support ticket) must complete within **300ms**.
- **NFR-PERF-003 (Accrual Worker Throughput):** The background daily accrual calculation engine must be capable of processing at least **100,000 active investment records per minute** via Redis BullMQ batching and database connection pooling without degrading concurrent user dashboard performance.

### 2.2 Frontend Core Web Vitals
- **NFR-PERF-004 (Largest Contentful Paint - LCP):** LCP must occur within **1.5 seconds** across standard 4G and broadband connections globally via edge static caching and optimized Next.js server rendering.
- **NFR-PERF-005 (Cumulative Layout Shift - CLS):** CLS score must remain below **0.05** across all viewport sizes by strictly pre-allocating aspect ratios for charts, tables, and media containers.
- **NFR-PERF-006 (First Input Delay - FID / INP):** Interaction to Next Paint (INP) must remain under **100ms** by deferring non-essential client scripts and utilizing React transition hooks.

---

## 3. Scalability Requirements

- **NFR-SCL-001 (Horizontal Elasticity):** The architecture must support stateless horizontal scaling. Adding new container replicas must require zero code changes or local state re-synchronization.
- **NFR-SCL-002 (Database Connection Management):** The system shall utilize `PgBouncer` or Prisma-managed external pooling to support up to **5,000 concurrent client connections** multiplexed onto a limited pool of physical PostgreSQL database connections.
- **NFR-SCL-003 (Read/Write Separation):** The database layer must support seamless read-replica routing (`readReplicaUrl` in Prisma or service layer) to offload heavy reporting, analytics, and admin queries from the primary read/write master instance.

---

## 4. Internationalization (i18n), Localization & Accessibility

- **NFR-I18N-001 (Multi-Language Support):** The platform shall be architected with complete internationalization support using standard localization frameworks (`next-intl` or equivalent). Initial supported locales: English (`en`), Spanish (`es`), French (`fr`), German (`de`), Mandarin Chinese (`zh`), Japanese (`ja`), and Arabic (`ar`).
- **NFR-I18N-002 (Right-To-Left - RTL Support):** The Tailwind CSS layout design must utilize logical properties (`ms-`, `me-`, `ps-`, `pe-`, `dir="rtl"`) to ensure flawless visual presentation for Arabic and Hebrew locales without layout breaking.
- **NFR-ACC-001 (WCAG 2.1 AA Compliance):** All user-facing application screens must adhere to Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, including minimum 4.5:1 color contrast ratios, full keyboard navigation capability, semantic HTML5 structure, and ARIA attributes for interactive financial charts and modals.

---

## 5. Data Durability, Disaster Recovery & Retention

- **NFR-DR-001 (Recovery Point Objective - RPO):** Maximum allowable data loss in the event of catastrophic physical server failure is **5 minutes** achieved via continuous PostgreSQL Write-Ahead Log (WAL) archiving to offsite secure object storage.
- **NFR-DR-002 (Recovery Time Objective - RTO):** Total system restoration time from cold offsite backup to full operational readiness on a new infrastructure node must not exceed **30 minutes**.
- **NFR-RET-001 (Audit & Financial Data Retention):** In compliance with global financial records regulations, all audit logs, transaction ledgers, and KYC verification records must be retained in read-only immutable storage for a minimum of **7 years** even if the user account is closed or deleted.
