# TeslaPrimeCapital — Role Behavioral & Operational Profile Specification

---

## 1. Role Operational Enforcement Policies

In addition to static permission scopes (`PERMISSION_MATRIX.md`), each system role is bound by strict behavioral and session governance thresholds:

| Role Identifier | Session Expiration (Access / Refresh) | Mandatory MFA Enforcement | IP Whitelist Optionality | Rate-Limit Threshold (API) | Dashboard UI Portal Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`SUPER_ADMIN`** | 15 Mins / 12 Hours (No 7-Day) | Strictly Mandatory (`TOTP`) | Recommended / Supported | 300 requests / minute | `/admin` (Full Executive View) |
| **`COMPLIANCE_OFFICER`**| 15 Mins / 24 Hours | Strictly Mandatory (`TOTP`) | Recommended / Supported | 200 requests / minute | `/admin/kyc` (Compliance View)|
| **`FINANCE_MANAGER`** | 15 Mins / 24 Hours | Strictly Mandatory (`TOTP`) | Recommended / Supported | 200 requests / minute | `/admin/withdrawals` (Treasury) |
| **`SUPPORT_AGENT`** | 15 Mins / 24 Hours | Mandatory | Not Required | 150 requests / minute | `/admin/support` (Helpdesk View) |
| **`AFFILIATE_PARTNER`** | 15 Mins / 7 Days | Recommended | Not Required | 100 requests / minute | `/dashboard/referrals` (Partner)|
| **`INVESTOR`** | 15 Mins / 7 Days | Mandatory for Withdrawals >= $1k | Not Required | 100 requests / minute | `/dashboard` (Retail Terminal) |
