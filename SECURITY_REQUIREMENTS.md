# TeslaPrimeCapital — Comprehensive Cybersecurity & Threat Mitigation Specification

---

## 1. Security Constitution & OWASP Top 10 Defenses

**TeslaPrimeCapital** enforces a strict, defense-in-depth cybersecurity posture across all architectural layers. Every API endpoint, background worker, and frontend form must be resilient against OWASP Top 10 vulnerabilities, automated botnets, and internal insider threats.

### 1.1 OWASP Top 10 Mitigation Matrix
| OWASP Vulnerability | Architecture Defense & Mitigation Implementation |
| :--- | :--- |
| **A01: Broken Access Control** | Strict server-side RBAC verification (`checkPermission()`) enforced inside API middleware before controller execution. Direct Object Reference (IDOR) protection using unguessable `UUIDv4` primary keys plus ownership validation checks (`if (resource.userId !== currentUser.id && !isAdmin) throw Forbidden`). |
| **A02: Cryptographic Failures** | Mandatory TLS 1.3 encryption in transit. All user passwords hashed via `Argon2id` (memory-hard, GPU-resistant). All sensitive KYC private keys and webhook secrets encrypted at rest using `AES-256-GCM` with rotating master keys. |
| **A03: Injection (SQL / NoSQL / Command)** | 100% parameterized database queries strictly enforced via `Prisma ORM`. Raw SQL queries (`$queryRaw`) are strictly prohibited unless audited and explicitly type-casted. Strict input validation and sanitization using `Zod` schemas for every incoming JSON payload. |
| **A04: Insecure Design** | Separation of duties across administrative roles (`FINANCE_MANAGER` cannot approve KYC; `COMPLIANCE_OFFICER` cannot disburse withdrawals). Mandatory two-signature approval for high-value financial actions. |
| **A05: Security Misconfiguration** | Automated security header injection (CSP, HSTS, X-Content-Type-Options, X-Frame-Options) via Next.js and Coolify reverse proxy. Docker containers run under non-root user accounts (`USER node`). |
| **A06: Vulnerable & Outdated Components** | Continuous dependency scanning (`npm audit` CI/CD gating). Strict pinning of container base images (`node:20.14.0-alpine3.20`). |
| **A07: Identification & Auth Failures** | Strict rate-limiting on login/OTP endpoints (`Redis` leaky bucket). Account lockout after 5 consecutive failed attempts. Rotating refresh tokens requiring explicit device binding. |
| **A08: Software & Data Integrity Failures** | Cryptographic verification (`HMAC-SHA256`) on all incoming payment gateway webhooks (Stripe, CoinPayments) to prevent spoofed deposit confirmations. |
| **A09: Security Logging & Monitoring Failures** | Immutable, append-only `AuditLog` generation for every sensitive read/write operation. Centralized log forwarding and automated anomaly alerts. |
| **A10: Server-Side Request Forgery (SSRF)** | Strict URL validation and allow-listing for any external webhooks or user-supplied avatar/media fetch URLs. Private internal Docker networks (`172.18.0.0/16`) blocked from user-triggered HTTP requests. |

---

## 2. Rate Limiting & DDoS Protection Hierarchy

To prevent brute-force attacks and resource exhaustion, rate limiting is implemented across three synchronized layers:

### 2.1 Rate Limiting Tier Table
| Endpoint Scope / Route | Rate Limit Rule | Storage Mechanism | Lockout Action |
| :--- | :--- | :--- | :--- |
| **Public API Gateway / Static Edge** | 100 requests per minute per IP | Coolify Reverse Proxy / Traefik | Temporary 15-minute IP drop (HTTP 429). |
| **Authentication / Login (`POST /api/v1/auth/login`)** | 5 attempts per 15 minutes per IP + User Email | Redis Distributed Counter | Account lock + Warning email dispatched (`Resend`). |
| **OTP Verification (`POST /api/v1/auth/verify-otp`)** | 3 attempts per 10 minutes per OTP Token | Redis Token Counter | OTP invalidated immediately upon 3rd failure. |
| **Password Reset Request (`POST /api/v1/auth/forgot`)** | 3 requests per hour per User Email | Redis Counter | Silently ignored (to prevent email enumeration). |
| **KYC File Upload (`POST /api/v1/kyc/upload`)** | 10 uploads per hour per User | Redis User Counter | HTTP 429 Too Many Requests + Security audit flag. |
| **Financial Transactions (`Deposit / Withdraw / Invest`)** | 20 requests per minute per User | Redis User Counter | HTTP 429 + Temporary 5-minute transaction freeze. |

---

## 3. Fraud Detection, Velocity Checks & Anti-Abuse Hooks

The application layer includes real-time transactional velocity hooks executed prior to balance modifications:
- **Geographic Velocity Check:** If an account logs in or initiates a transaction from an IP address located more than 2,000 miles away from the previous session's IP within a 2-hour window, the system automatically flags the session as `SUSPICIOUS_GEOPHYSICAL_VELOCITY`, requires immediate MFA re-verification, and freezes outgoing withdrawals pending email verification.
- **Structuring Detection Hook:** If a user completes 3 or more deposits within 48 hours where each deposit is between $9,000 and $9,999 (just below the $10,000 regulatory reporting threshold), the system generates an automated `AML_STRUCTURING_ALERT` inside the `COMPLIANCE_OFFICER` review queue.
