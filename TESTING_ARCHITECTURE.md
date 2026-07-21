# TeslaPrimeCapital — Quality Assurance & Test Pyramid Technical Design (`Phase 2`)

---

## 1. Test Pyramid & Automation Suite Allocation

Quality assurance is structurally integrated into the development lifecycle. Merges into `arena/019f8047-teslaprimecapital` or `main` are blocked unless the test suite achieves **100% pass rates** across the test pyramid:

### 1.1 Test Suite Breakdown & Architectural Scope
| Test Tier & Framework | % of Total Suite | Target Execution Speed | Technical Scope & Verification Criteria |
| :--- | :--- | :--- | :--- |
| **Unit Tests (`Vitest` / `Jest`)** | **70%** | `< 15 seconds` | Exact mathematical calculation verification (`Decimal.add/sub/mul`), Zod validation schemas (`src/server/validators/*`), RBAC permission matrices (`checkPermission`), and pure helper functions (`decimal.util.ts`). |
| **Integration Tests (`Supertest` + `Testcontainers`)** | **20%** | `< 90 seconds` | End-to-end HTTP controller execution (`src/server/controllers/*`) against real, ephemeral Dockerized instances of `PostgreSQL 16` and `Redis 7`. Verifies exact database double-entry ledger balancing (`Sum of Debits === Sum of Credits`). |
| **End-to-End Tests (`Playwright`)** | **10%** | `< 4 minutes` | Automated browser navigation across desktop and mobile viewports testing critical user flows: Registration -> Email OTP -> KYC Upload -> Deposit -> Plan Allocation -> Multi-Sig Withdrawal Review. |

---

## 2. Specialized Concurrency & Financial Precision Testing

- **Floating-Point Drift Regression Suite:** Unit tests must assert that `new Decimal('0.1').add(new Decimal('0.2')).equals(new Decimal('0.3'))` evaluates to `true` across 100,000 randomized financial compounding iterations (`src/tests/unit/decimal.test.ts`).
- **Race Condition & Double-Spend Stress Test (`k6` / `Artillery`):** Integration testing must simulate 50 simultaneous HTTP requests hitting `POST /api/v1/wallet/withdraw` for `$1,000` against a user wallet containing exactly `$1,000` in `availableBalance`. The test passes if and only if **exactly 1 request returns `201 Created`** and the remaining 49 requests are cleanly rejected with `429 Too Many Requests` or `400 ERR_INSUFFICIENT_FUNDS` via our `Redlock` mutex architecture.
