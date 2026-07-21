# TeslaPrimeCapital — Atomic Design Component & UI System Inventory

---

## 1. Atomic UI Component Hierarchy

The user interface follows strict **Atomic Design** principles, built using Tailwind CSS and Radix UI primitives to ensure visual consistency, full keyboard accessibility, and WCAG 2.1 AA contrast compliance:

### 1.1 Atoms (Basic Primitives)
- **`Button`:** Standardized action element supporting variants (`primary`, `secondary`, `outline`, `danger`, `ghost`) and loading spinner states (`isLoading`).
- **`Input` & `Select`:** Accessible form controls with integrated Zod error message display slots (`aria-describedby`).
- **`CurrencyDisplay`:** High-precision decimal formatter dynamically rendering 2 decimal places for fiat (`$5,000.00`) and 8 decimal places for digital assets (`0.05432100 BTC`).
- **`Badge` & `StatusIndicator`:** Visual status chips representing transaction states (`PENDING`, `COMPLETED`, `LOCKED`, `APPROVED`).

### 1.2 Molecules (Composite Controls)
- **`FormField`:** Combined label, input control, tooltip, and real-time validation error container.
- **`StatCard`:** Executive metric display box showing total balance, daily yield, or active plan counts with percentage change indicators.
- **`PlanCard`:** Interactive investment plan presentation unit displaying APR, term duration, min/max deposit sliders, and allocation CTA button.
- **`TransactionRow`:** Ledger table row showing transaction ID, timestamp, debit/credit indicator, currency icon, exact amount, and status pill.

### 1.3 Organisms (Complex Feature Sections)
- **`WalletSummary`:** Complete multi-currency portfolio breakdown card with interactive currency tab selector and instant deposit/withdraw action triggers.
- **`InvestmentCalculator`:** Real-time compounding yield projector allowing users to drag deposit sliders and view interactive maturity growth curves (`Recharts`).
- **`KYCEditor`:** Multi-step verification wizard handling secure private document drag-and-drop upload to Cloudinary authenticated folders.
- **`DataTable`:** High-performance, cursor-paginated administrative table supporting column sorting, status filtering, and bulk action triggers.

### 1.4 Layouts & Templates
- **`DashboardLayout`:** Responsive, collapsible sidebar navigation layout with sticky top navbar, unread notification bell dropdown, and session monitor.
- **`AdminLayout`:** Specialized high-density executive layout with prominent role banner and strict role-based navigation item filtering.
