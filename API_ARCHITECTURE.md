# TeslaPrimeCapital — REST API Architecture & Endpoint Specification (`Phase 2`)

---

## 1. REST API Governance & Versioning Strategy

All platform data exchange occurs via strict HTTPS RESTful endpoints following OpenAPI 3.1 standards.
- **Base Route Structure:** `/api/v1/{domain}/{resource}`
- **Versioning Policy:** Major structural updates are versioned via the URI path (`/v1/`, `/v2/`). Minor non-breaking additions (new optional response fields) are additive within `/v1/`. Deprecated endpoints emit `Deprecation: @epoch` and `Link: <https://.../api/v2/...>; rel="successor-version"` HTTP headers with a 6-month sunset window.

---

## 2. Standardized JSON Request & Response Envelopes (`contracts/api.envelope.ts`)

To ensure predictable data consumption across React server actions and client-side queries (`React Query`), every single endpoint MUST return the standardized envelope structure:

### 2.1 Standard Success Envelope (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "inv_8f7e6d5c4b3a",
    "planId": "plan_prime_growth",
    "principalAmount": "5000.00000000",
    "currentAccruedYield": "41.09589041",
    "status": "ACTIVE",
    "payoutPolicy": "LUMP_SUM_MATURITY",
    "maturityDate": "2026-10-18T16:00:00Z"
  },
  "meta": {
    "timestamp": "2026-07-20T16:00:00Z",
    "requestId": "req_a1b2c3d4e5f6",
    "pagination": {
      "cursor": "inv_8f7e6d5c4b3a",
      "hasNextPage": false
    }
  }
}
```

### 2.2 Standard Error Envelope (`400`, `401`, `403`, `429`, `500`)
```json
{
  "success": false,
  "error": {
    "code": "ERR_WITHDRAWAL_REVIEW_REQUIRED",
    "message": "Per platform treasury rules, all withdrawal requests must undergo mandatory manual Admin inspection before disbursement.",
    "details": [
      {
        "field": "status",
        "issue": "Transaction placed in PENDING_REVIEW queue for compliance verification."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-20T16:00:00Z",
    "requestId": "req_a1b2c3d4e5f6"
  }
}
```

---

## 3. Comprehensive REST API Endpoint Matrix

| HTTP Verb | Endpoint Path | Authentication & RBAC Scope | Request Body / Query Params | Response Summary & Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | Public (Unauthenticated) | `{ email, password, firstName, lastName, referralCode? }` | `201 Created` — Dispatches OTP verification email (`Resend`). |
| **POST** | `/api/v1/auth/login` | Public (Rate-Limited: 5/15m) | `{ email, password, totpCode? }` | `200 OK` — Returns 15m JWT + sets 7d rotating `httpOnly` refresh cookie. |
| **POST** | `/api/v1/auth/verify-otp` | Authenticated (`PENDING_VERIF`) | `{ otpCode: "481923" }` | `200 OK` — Elevates user status to `ACTIVE`, returns full access token. |
| **POST** | `/api/v1/auth/refresh` | Cookie (`refreshToken`) | *Empty Body* | `200 OK` — Rotates Redis refresh token, returns fresh 15m JWT. |
| **POST** | `/api/v1/auth/logout` | Authenticated (Any Role) | `{ logoutAllDevices?: boolean }` | `200 OK` — Deletes Redis refresh session key (`session:{ID}`), clears cookie. |
| **GET** | `/api/v1/wallet/balances` | Authenticated (`INVESTOR`+) | `?currency=USD,BTC` | `200 OK` — Returns exact `NUMERIC(20,8)` segregated wallet sub-balances. |
| **POST** | `/api/v1/wallet/deposit` | Authenticated (`INVESTOR`+) | `{ amount: "1000.00", currency: "USD", gateway: "STRIPE" }` | `200 OK` — Returns gateway checkout session URL / crypto address. |
| **POST** | `/api/v1/wallet/withdraw` | Authenticated (`TIER_1` + MFA) | `{ amount: "5000.00", currency: "USD", destination: "..." }` | `201 Created` — Locks balance, sets `status: 'PENDING_REVIEW'` (100% Admin rule). |
| **GET** | `/api/v1/investments/plans` | Public (Edge Cached) | `?isActive=true` | `200 OK` — Returns active investment plan catalog. |
| **POST** | `/api/v1/investments/allocate` | Authenticated (`INVESTOR`+) | `{ planId: "uuid", amount: "5000.00000000" }` | `201 Created` — Acquires Redlock, debits wallet, creates `ActiveInvestment`. |
| **GET** | `/api/v1/investments/active` | Authenticated (`INVESTOR`+) | `?cursor=uuid&limit=20` | `200 OK` — Returns paginated list of user active allocations and accrued yield. |
| **POST** | `/api/v1/kyc/upload` | Authenticated (`INVESTOR`) | `FormData` (Private file buffer, `documentType`) | `201 Created` — Streams directly to Cloudinary `type: 'authenticated'`. |
| **GET** | `/api/v1/admin/withdrawals` | Protected (`FINANCE_MANAGER`+) | `?status=PENDING_REVIEW&page=1`| `200 OK` — Returns pending withdrawal queue requiring manual review. |
| **POST** | `/api/v1/admin/withdrawals/{id}/approve` | Protected (`FINANCE_MANAGER`+) | `{ totpCode: "123456", notes: "Verified KYC & bank wire" }` | `200 OK` — Executes disbursement gateway call, updates ledger status to `COMPLETED`. |
| **GET** | `/api/v1/admin/kyc/document/{id}` | Protected (`COMPLIANCE_OFFICER`+) | *Empty Body* | `200 OK` — Returns ephemeral 5-minute signed Cloudinary delivery URL. |
