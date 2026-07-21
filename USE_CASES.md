# TeslaPrimeCapital — Formal System Use Case Specifications

---

## 1. Critical Operational Use Case Specifications

### UC-01: Automated Daily Yield Accrual Execution Engine
- **Primary Actor:** System Background Worker (`BullMQ` Cron Engine).
- **Preconditions:** At least one `ActiveInvestment` exists with `status = 'ACTIVE'` and `nextAccrualAt <= NOW()`.
- **Main Success Scenario:**
  1. At 00:00 UTC, the cron engine pushes job `EXECUTE_DAILY_ACCRUAL` to Redis `accruals-queue`.
  2. The worker picks up the job and queries `ActiveInvestment` records where `status = 'ACTIVE' AND nextAccrualAt <= NOW()`, paginated in chunks of 500 records.
  3. For each investment, the worker acquires a `Redlock` distributed mutex (`lock:accrual:inv_{ID}`).
  4. The worker calculates exact yield using `Prisma.Decimal`: $	ext{Accrued} = 	ext{Principal} 	imes 	ext{DailyRate}$.
  5. Inside a single `Prisma.$transaction`:
     - Creates `AccrualLog` record.
     - Creates `Transaction` double-entry ledger debiting system pool and crediting user wallet (`YIELD_PAYOUT`).
     - Updates `Wallet.availableBalance = availableBalance + Accrued`.
     - Updates `ActiveInvestment.totalEarned = totalEarned + Accrued` and `nextAccrualAt = NOW() + 24 Hours`.
  6. Worker pushes a `YIELD_RECEIVED` alert to `notifications-queue` and releases the `Redlock`.
- **Alternate / Error Flows:**
  - *4a. Mutex Acquisition Failure:* If `Redlock` cannot be acquired (another worker is already processing the ID), the worker skips the record and logs a concurrency collision warning.
  - *5a. Database Transaction Deadlock:* If PostgreSQL throws a serialization failure, the worker catches the error, rolls back all changes, and re-queues the individual investment ID with a 5-second backoff delay.

---

### UC-02: Multi-Signature High-Value Withdrawal Disbursement
- **Primary Actors:** Investor, Finance Manager (`FINANCE_MANAGER`), Super Admin (`SUPER_ADMIN`).
- **Preconditions:** Investor has >= $5,000 USD equivalent in `availableBalance` and is verified to `TIER_1` or `TIER_2`.
- **Main Success Scenario:**
  1. Investor submits a withdrawal request for `$15,000.00000000 USD` to their designated bank account/crypto address on `/dashboard/withdraw`.
  2. System verifies MFA/TOTP token, acquires `Redlock` on wallet, moves `$15,000.00000000` from `availableBalance` into `lockedBalance`, creates `Transaction` with `status = 'PENDING'`, and releases the lock.
  3. Because amount >= $5,000, system flags transaction as `REQUIRES_MULTI_SIG_APPROVAL` and dispatches alerts to `FINANCE_MANAGER` and `SUPER_ADMIN`.
  4. `FINANCE_MANAGER` logs into `/admin/withdrawals`, verifies bank wire details, and clicks `Sign Approval 1/2`.
  5. `SUPER_ADMIN` logs in, reviews audit trail, enters their TOTP MFA code, and clicks `Sign Final Approval 2/2 & Disburse`.
  6. System executes payment gateway disbursement API call, deducts `$15,000.00000000` from `lockedBalance`, updates `Transaction.status = 'COMPLETED'`, and sends `Resend` confirmation email.
