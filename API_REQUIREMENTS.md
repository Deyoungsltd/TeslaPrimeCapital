# TeslaPrimeCapital — REST API Governance & Design Specification

---

## 1. RESTful API Architecture Standards

All internal and external backend communication for **TeslaPrimeCapital** is governed by strict RESTful design principles over HTTPS. API endpoints must be predictable, resource-oriented, and adhere to OpenAPI 3.1 specifications.

### 1.1 Base URL & Versioning Strategy
- **Base Route Pattern:** `/api/v1/{domain}/{resource}`
- **Versioning Policy:** Major versioning is strictly embedded within the URL path (`/v1/`). Breaking changes require releasing `/v2/` alongside deprecated `/v1/` routes with a mandatory 6-month sunset period communicated via `Deprecation` HTTP headers (`RFC 8594`).

---

## 2. Standardized JSON Request & Response Envelopes

To ensure seamless integration with Next.js frontend state handling (`React Query` / `SWR`), all API endpoints MUST return a standardized JSON envelope structure without exception:

### 2.1 Standard Success Envelope
```json
{
  "success": true,
  "data": {
    "id": "c39a8b12-4f6b-4f9e-8c1a-2b3c4d5e6f7a",
    "status": "ACTIVE",
    "principalAmount": "5000.00000000",
    "currency": "USD"
  },
  "meta": {
    "timestamp": "2026-07-20T16:00:00Z",
    "requestId": "req_8f7e6d5c4b3a"
  }
}
```

### 2.2 Standard Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERR_INSUFFICIENT_FUNDS",
    "message": "Wallet available balance is lower than the requested withdrawal amount.",
    "details": [
      {
        "field": "amount",
        "issue": "Requested 10000.00000000 USD, available 4500.00000000 USD."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-20T16:00:00Z",
    "requestId": "req_8f7e6d5c4b3a"
  }
}
```

---

## 3. Pagination, Filtering & Sorting Syntax

- **Cursor-Based Pagination (High-Frequency Feeds):** For high-volume tables (`Transaction`, `AuditLog`), endpoints MUST use cursor-based pagination (`?cursor=TXN_ID&limit=50`) to maintain `O(1)` query execution times and prevent deep-offset `OFFSET / LIMIT` performance bottlenecks.
- **Page-Based Pagination (Admin Tables):** For low-volume administrative views (`/api/v1/admin/users`), page/limit parameters (`?page=1&limit=25`) are permitted, returning total count inside `meta.pagination`.
