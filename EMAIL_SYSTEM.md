# TeslaPrimeCapital — Transactional Email & Communication System Specification

---

## 1. Email Service Provider & Templating Architecture

- **Delivery Engine:** **Resend** selected as the primary transactional email delivery gateway due to its developer-first HTTP API, high inbox deliverability rates, native DKIM/SPF/DMARC authentication support, and real-time webhook delivery tracking.
- **Templating Engine:** **React Email (`@react-email/components`)** selected to construct clean, responsive, client-tested email templates using TypeScript and React server components, guaranteeing consistent rendering across Gmail, Outlook, Apple Mail, and mobile clients.

---

## 2. Transactional Email Inventory & Trigger Rules

Every automated email notification sent by the platform corresponds to a verified template and explicit transactional trigger:

| Email Template ID | Subject Line Template | Trigger Event | Priority & Queue Policy |
| :--- | :--- | :--- | :--- |
| **`TPL_WELCOME_OTP`** | `Your TeslaPrimeCapital Verification Code: {{OTP_CODE}}` | New user registration or email verification request. | High Priority (Instant processing via `email-high-priority` queue). |
| **`TPL_2FA_LOGIN`** | `Login Attempt: Two-Factor Verification Required` | Login attempt from unrecognized IP or device fingerprint. | High Priority (`email-high-priority` queue). |
| **`TPL_PWD_RESET`** | `Password Reset Request — Action Required` | User requests password reset via `/forgot-password`. | High Priority (`email-high-priority` queue). |
| **`TPL_LOGIN_ALERT`** | `Security Alert: New Login from {{LOCATION}} ({{IP}})` | Successful login from a new geographical region or device. | Standard Priority (`email-standard` queue). |
| **`TPL_DEP_CONFIRM`** | `Deposit Confirmed: +{{AMOUNT}} {{CURRENCY}} Credited` | Payment gateway / blockchain confirmation of incoming deposit. | Standard Priority (`email-standard` queue). |
| **`TPL_INV_ACCRUAL`** | `Daily Yield Summary: +{{AMOUNT}} {{CURRENCY}} Earned` | Automated daily yield calculation worker completes payout. | Bulk Priority (`email-bulk` batch processing queue). |
| **`TPL_WTH_SUBMIT`** | `Withdrawal Request Submitted: {{AMOUNT}} {{CURRENCY}}` | User submits a withdrawal request (entered `PENDING` state). | Standard Priority (`email-standard` queue). |
| **`TPL_WTH_APPROVED`** | `Withdrawal Processed & Disbursed: {{TX_HASH}}` | Admin multi-sig approval or automated gateway release. | Standard Priority (`email-standard` queue). |
| **`TPL_KYC_STATUS`** | `Compliance Update: KYC Tier {{TIER}} Status {{STATUS}}` | Compliance officer approves or rejects identity verification. | Standard Priority (`email-standard` queue). |

---

## 3. Asynchronous Queue & Retry Architecture (`BullMQ + Redis`)

To prevent email provider API latency or temporary network hiccups from blocking user-facing HTTP requests, all emails must be dispatched asynchronously:

1. **Service Queue Insertion:** When a business event occurs (e.g., OTP request), the service layer pushes a serialized job object (`{ template: 'TPL_WELCOME_OTP', recipient: user.email, props: { otpCode: '481923' } }`) onto the Redis `email-queue`.
2. **Dedicated Email Worker:** A background Node.js worker pulls jobs from the queue at a controlled concurrency limit (`concurrency: 20`) and executes the `resend.emails.send()` API call.
3. **Exponential Backoff Retry Strategy:** If the `Resend` API returns a 4xx rate limit or 5xx server error, `BullMQ` automatically retries the job using an exponential backoff formula:
   $$	ext{Delay} = 	ext{Initial Delay (2000ms)} 	imes 2^{	ext{Attempt Number}}$$
   Maximum retry ceiling: **5 attempts** before routing the failed payload to the `email-dead-letter-queue` (DLQ) and triggering a Slack/PagerDuty alert to the DevOps team.
