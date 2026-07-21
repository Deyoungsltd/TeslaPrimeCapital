# TeslaPrimeCapital — Next.js App Router Page & Route Inventory

---

## 1. Route Topology & Access Control Requirements

The frontend application is structured strictly under Next.js App Router conventions (`src/app/`), categorized by access boundary and required RBAC permission scope:

| Route Path (`src/app/...`) | Page Title / Purpose | Required Authentication / Role | Rendering & Cache Strategy |
| :--- | :--- | :--- | :--- |
| `/` | Public Marketing Landing Page | Public (Unauthenticated) | SSG / Edge Cached (`revalidate: 3600`) |
| `/investment-plans` | Public Plan Catalog Marketplace | Public (Unauthenticated) | SSG / Edge Cached (`revalidate: 900`) |
| `/login` | User Authentication Portal | Public / Guest Only | Dynamic CSR / Server Action Auth |
| `/register` | Account Onboarding Form | Public / Guest Only | Dynamic CSR / Server Action Auth |
| `/verify-otp` | 6-Digit Email/Phone Verification | Authenticated (`PENDING_VERIFICATION`)| Dynamic CSR |
| `/dashboard` | User Wealth Terminal Overview | Authenticated (`INVESTOR` + Tier 0+) | Dynamic SSR + Client React Query |
| `/dashboard/wallet` | Multi-Currency Balances & Ledger | Authenticated (`INVESTOR` + Tier 0+) | Dynamic SSR (`cache: 'no-store'`) |
| `/dashboard/investments` | Active Investments & Daily Yield | Authenticated (`INVESTOR` + Tier 0+) | Dynamic SSR + Real-time SSE |
| `/dashboard/deposit` | Multi-Gateway Deposit Wizard | Authenticated (`INVESTOR` + Tier 0+) | Dynamic CSR |
| `/dashboard/withdraw` | Withdrawal & MFA Verification Form | Authenticated (`INVESTOR` + Tier 1+) | Dynamic CSR (`MFA Required`) |
| `/dashboard/referrals` | Affiliate Trees & Commission Logs | Authenticated (`INVESTOR` / `AFFILIATE`)| Dynamic SSR |
| `/dashboard/kyc` | Tier Verification Upload Wizard | Authenticated (`INVESTOR`) | Dynamic CSR (`Private Uploads`) |
| `/dashboard/support` | Support Ticket Desk & Chat | Authenticated (`INVESTOR`) | Dynamic SSR |
| `/dashboard/settings` | Profile, Security & MFA Toggles | Authenticated (`INVESTOR`) | Dynamic CSR (`MFA Required`) |
| `/admin` | Enterprise Executive Overview | Protected (`SUPER_ADMIN` / `COMPLIANCE` / `FINANCE`) | Dynamic SSR (`cache: 'no-store'`) |
| `/admin/users` | User & Role Management Table | Protected (`SUPER_ADMIN`) | Dynamic SSR + Cursor Pagination |
| `/admin/kyc` | Compliance Document Review Desk | Protected (`COMPLIANCE_OFFICER` / `SUPER_ADMIN`) | Dynamic SSR (`Secure Signed URLs`) |
| `/admin/investments`| Global Plan Management & Accrual Logs| Protected (`SUPER_ADMIN` / `FINANCE_MANAGER`) | Dynamic SSR |
| `/admin/withdrawals`| Multi-Sig Withdrawal Approval Queue| Protected (`FINANCE_MANAGER` / `SUPER_ADMIN`) | Dynamic SSR (`TOTP MFA Required`)|
| `/admin/audit-logs` | Immutable System Activity Ledger | Protected (`SUPER_ADMIN`) | Dynamic SSR + Cursor Pagination |
