# TeslaPrimeCapital — Enterprise Performance & Benchmarking Specification

---

## 1. Core Web Vitals & Frontend UI Benchmarks

To guarantee a snappy, premium financial terminal experience, the frontend application must satisfy the following Core Web Vitals metrics across desktop and mobile browsers globally:

| Performance Metric | Target Ceiling | Measurement Methodology & Architectural Defense |
| :--- | :--- | :--- |
| **Largest Contentful Paint (LCP)** | **< 1.5 Seconds** | Edge rendering (`Next.js` App Router), automatic image conversion (`Cloudinary WebP/AVIF`), and zero blocking third-party scripts. |
| **Interaction to Next Paint (INP / FID)**| **< 100 Milliseconds** | Client-side React hydration optimization, optimistic UI state updates for badge counters, and background web worker offloading. |
| **Cumulative Layout Shift (CLS)** | **< 0.05** | Strict CSS pre-sizing (`aspect-video`, fixed height skeleton placeholders for charts and wallet balances) before data arrival. |
| **Time to First Byte (TTFB)** | **< 200 Milliseconds** | Global edge caching via Coolify proxy and reverse CDN pre-fetching on static marketing routes (`/`, `/plans`). |

---

## 2. Database & API Execution Ceilings

- **Single-Entity Lookup (`GET /api/v1/wallet`):** Database query execution time MUST NOT exceed **10ms**. Enforced via strict primary key (`id`) and indexed composite lookup (`[userId, currency]`).
- **Complex Aggregation (`GET /api/v1/admin/analytics/daily-yield`):** Execution time MUST NOT exceed **100ms**. If an aggregation requires over 100ms, the computation must be offloaded to an asynchronous background worker and served from a pre-computed summary table (`AnalyticsSummary`).
- **N+1 Query Prevention:** Application code MUST utilize `Prisma` relation includes (`include: { wallet: true }`) or dedicated data loaders (`DataLoader`) to prevent N+1 sequential database trips inside loops.
