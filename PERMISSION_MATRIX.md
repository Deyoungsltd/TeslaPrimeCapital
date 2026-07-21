# TeslaPrimeCapital — Granular Role & Permission CRUD Matrix

---

## 1. Domain Permission Mapping Matrix

Every operational action inside the API and UI is mapped explicitly against the 6 enterprise system roles using granular `resource:action` scopes:

| Permission Scope / Action | `SUPER_ADMIN` | `COMPLIANCE_OFFICER` | `FINANCE_MANAGER` | `SUPPORT_AGENT` | `AFFILIATE_PARTNER` | `INVESTOR` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`users:read_basic`** | ✅ | ✅ | ✅ | ✅ | ❌ | Self Only |
| **`users:read_pii`** | ✅ | ✅ | ❌ | ❌ | ❌ | Self Only |
| **`users:manage_roles`** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **`kyc:review_docs`** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **`kyc:approve_reject`**| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **`plans:create_update`**| ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **`investments:allocate`**| ✅ (Admin)| ❌ | ❌ | ❌ | ❌ | ✅ |
| **`accrual:trigger_worker`**| ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **`wallet:deposit`** | ✅ (Manual)| ❌ | ❌ | ❌ | ❌ | ✅ |
| **`wallet:withdraw_req`**| ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **`withdrawals:approve`**| ✅ (Co-Sign)| ❌ | ✅ (Co-Sign) | ❌ | ❌ | ❌ |
| **`referrals:read_all`**| ✅ | ❌ | ❌ | ❌ | ✅ (Own Tree)| Self Only |
| **`audit_logs:read`** | ✅ | ✅ (KYC Logs)| ✅ (Fin Logs)| ❌ | ❌ | ❌ |
