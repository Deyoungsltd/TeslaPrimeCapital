# TeslaPrimeCapital — Email Architecture & React Email Design System (`Phase 2`)

---

## 1. Transactional Email Delivery & Templating Architecture

- **Delivery Engine:** **Resend (`resend` SDK)** selected as the primary enterprise delivery gateway due to its RESTful HTTP API, native DKIM/SPF/DMARC authentication, automated bounce suppression, and webhook delivery tracking.
- **Templating Engine:** **React Email (`@react-email/components`)** selected to construct type-safe, modular, responsive email templates inside `src/server/services/templates/`, guaranteeing consistent rendering across Gmail, Outlook, Apple Mail, and mobile viewports.

---

## 2. Reusable React Email Component Inventory (`src/server/services/templates/components/`)

To maintain brand uniformity and eliminate duplicated HTML markup across our 9 core email templates, emails are composed from standardized React Email atoms:
- **`EmailHeader.tsx`:** Renders the responsive TeslaPrimeCapital dark industrial brand bar (`#0B0F19`), high-resolution Cloudinary logo (`q_auto,f_auto`), and security header badge (`SECURE TRANSACTIONAL ALERT`).
- **`EmailButton.tsx`:** Primary CTA button with high-contrast styling (`#D4AF37` gold accent or `#2563EB` royal blue) and bulletproof table-cell padding for Outlook compatibility.
- **`EmailFooter.tsx`:** Legal disclaimer, registered corporate address, automated notification notice (`Please do not reply to this system email`), and GDPR one-click unsubscribe links where applicable.
- **`SecurityAlertBox.tsx`:** Highlighted warning container displaying device fingerprint, IP address (`req.ip`), geographic region, and a direct "Secure My Account / Logout All Devices" emergency link.

---

## 3. Email Queue Processing & Exponential Backoff Retry Strategy (`BullMQ`)

When a service invokes `EmailService.sendEmail(...)`, the payload is dispatched asynchronously to Redis `email-queue` (`src/server/workers/email.worker.ts`):
```typescript
// Technical Architecture Specification for Email Queue Worker
emailQueue.add('send-transactional-email', {
  template: 'TPL_WELCOME_OTP',
  recipient: user.email,
  props: { otpCode: '481923', userName: user.firstName }
}, {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000 // 2s -> 4s -> 8s -> 16s -> 32s
  },
  removeOnComplete: true,
  removeOnFail: { count: 1000 } // Retain last 1000 failed jobs inside Dead Letter Queue (DLQ)
});
```
If the job fails 5 times (e.g., recipient mailbox full or Resend rate limit exceeded), it transitions to the `email-dead-letter-queue` (DLQ) and triggers an automated DevOps notification.
