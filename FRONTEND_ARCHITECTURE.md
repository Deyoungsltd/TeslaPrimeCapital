# TeslaPrimeCapital — Frontend Architecture & UI/UX Technical Design Specification (`Phase 2`)

---

## 1. Frontend Core Framework & Layout Architecture

The frontend is architected using **Next.js 14+ (App Router)** with **React Server Components (RSC)** and **TypeScript**. This structure guarantees maximum initial page load speed (**LCP < 1.5s**), optimal search engine indexing on public marketing pages, and snappy client-side state transitions inside the protected user terminal.

### 1.1 Application Route Groups & Layout Segregation
The application utilizes Next.js Route Groups (`(marketing)`, `(auth)`, `(dashboard)`, `(admin)`) to isolate layout wrappers, navigation headers, and authentication boundaries:
- **`src/app/(marketing)/layout.tsx`:** Renders the public global navigation bar, footer, cookie consent banner, and static metadata headers. Utilizes React Server Components (`RSC`) with static site generation (`SSG`).
- **`src/app/(auth)/layout.tsx`:** Renders a clean, distraction-free authentication layout (`AuthLayout`) with responsive brand imagery and strict CSRF protection wrappers.
- **`src/app/(dashboard)/layout.tsx`:** Renders the interactive user terminal (`DashboardLayout`) featuring a collapsible sidebar, real-time balance ticker, unread notification bell dropdown, and session activity monitor.
- **`src/app/(admin)/layout.tsx`:** Renders the high-density executive portal (`AdminLayout`), strictly guarded by server-side RBAC verification (`SUPER_ADMIN`, `COMPLIANCE_OFFICER`, `FINANCE_MANAGER`).

---

## 2. State Management & Data Fetching Strategy

To prevent prop-drilling and eliminate redundant server network requests, state is strictly partitioned into three distinct layers:

### 2.1 Server State & API Cache (`React Query` / `TanStack Query`)
- **Responsibility:** Manages all asynchronous server data (wallet balances, active investment plans, transaction ledgers, KYC status).
- **Caching & Invalidation Policy:** Standard read queries utilize `staleTime: 60000` (1 minute). Transactional mutations (`deposit`, `withdraw`, `allocate plan`) automatically trigger `queryClient.invalidateQueries(['wallet', 'transactions'])` upon success envelope receipt.

### 2.2 Client UI & Session State (`React Context` + `Zustand`)
- **Responsibility:** Manages ephemeral client state including active UI theme (`dark` / `light`), active sidebar collapse state, active modal overlay IDs, and current multi-currency presentation preference (`USD`, `EUR`, `BTC`).
- **Security Rule:** Sensitive cryptographic tokens (`JWT`, `Refresh Token`) and exact financial credentials are **never** persisted inside `Zustand` local storage or `localStorage`. Refresh tokens remain strictly inside `httpOnly` secure cookies.

### 2.3 Form State & Validation (`React Hook Form` + `Zod`)
- **Responsibility:** High-performance controlled and uncontrolled input handling with real-time field-level validation.
- **Contract Alignment:** All form Zod schemas (`src/server/validators/*.ts`) are shared directly between the Next.js client forms and the Node.js backend middleware, ensuring identical validation rules on client and server.

---

## 3. Protected Routes, Code Splitting & Lazy Loading

- **Middleware Route Guard (`src/middleware.ts`):** Intercepts all requests matching `/dashboard/*` and `/admin/*`. Verifies the presence of a valid JWT access token. If expired or missing, triggers a transparent token rotation request to `POST /api/v1/auth/refresh` or redirects to `/login?callbackUrl=...`.
- **Dynamic Import / Lazy Loading (`next/dynamic`):** Heavy interactive UI components—specifically `Recharts` financial growth curves, interactive modal wizards (`DepositWizard`, `KYCEditor`), and administrative data tables (`DataTable`)—are dynamically loaded (`ssr: false`) to keep the initial client JavaScript bundle under **150 KB gzipped**.

---

## 4. Internationalization (i18n), Accessibility & Theme System

- **Internationalization Engine (`next-intl`):** Full multi-language support covering English (`en`), Spanish (`es`), French (`fr`), German (`de`), Mandarin (`zh`), Japanese (`ja`), and Arabic (`ar`).
- **RTL Logical CSS Properties:** All Tailwind CSS utility classes must strictly utilize logical positioning (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`). When `locale === 'ar'`, the root HTML element dynamically injects `dir="rtl"`, ensuring perfect mirrored layout rendering without CSS overrides.
- **Theme System (`next-themes`):** Supports `system`, `dark`, and `light` visual modes using CSS variables (`--bg-primary`, `--text-main`, `--accent-gold`). Dark mode aesthetic is inspired by high-contrast industrial dashboards (`Tesla.com`).
- **Accessibility (WCAG 2.1 AA):** All interactive elements require explicit ARIA labels (`aria-label`, `aria-expanded`, `aria-controls`), full keyboard tab navigation (`tabIndex={0}`), and strict color contrast ratios across all theme modes.
