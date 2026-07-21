# TeslaPrimeCapital — Comprehensive Security Architecture (`Phase 2`)

---

## 1. Authentication & Session State Security Architecture

Our security architecture enforces the approved **Hybrid Rotating Token Architecture** to eliminate the revocation vulnerabilities of stateless JWTs while preserving API gateway throughput:

### 1.1 Token Rotation Protocol Specification
```
[ Next.js Frontend ]                     [ Node.js API Gateway ]                   [ Redis Cluster ]
         │                                          │                                      │
         ├─ 1. API Request + JWT Access Token ─────►│                                      │
         │     (Authorization: Bearer <15m_jwt>)    │                                      │
         │◄─ 2. HTTP 401 Unauthorized (Expired) ────┤                                      │
         │                                          │                                      │
         ├─ 3. POST /api/v1/auth/refresh ──────────►│                                      │
         │     (Cookie: refreshToken=<7d_hash>)     ├─ 4. GET session:{sessionId} ────────►│
         │                                          │◄─ 5. Return Session Valid + IP check─┤
         │                                          ├─ 6. DEL session:{oldId} ────────────►│ (Instant Revocation)
         │                                          ├─ 7. HSET session:{newId} ───────────►│ (Store New Token)
         │◄─ 8. Set-Cookie: refreshToken=<new_hash>─┤                                      │
         │     Return New 15m JWT Access Token      │                                      │
```

### 1.2 Cryptographic Hashing Standards
- **Password Storage:** **Argon2id** (`argon2.hash(password, { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 })`). Memory-hard and GPU-resistant.
- **OTP Hashing:** 6-digit verification codes are never stored in plain text. When generated, a salted `SHA-256` hash (`crypto.createHash('sha256').update(otp + userId).digest('hex')`) is saved in Redis (`otp:user_{ID}`, TTL 600s).
- **MFA Secrets:** Time-based One-Time Password (`TOTP`) secrets (`User.twoFactorSecret`) are encrypted at rest using **AES-256-GCM** with unique initialization vectors (`IV`) stored alongside the ciphertext.

---

## 2. Comprehensive Rate Limiting & Anti-Abuse Hierarchy

To protect endpoints against credential stuffing, brute-force enumeration, and volumetric denial-of-service, multi-layer rate limiting is enforced via Redis leaky-bucket sliding window counters (`src/server/middlewares/rate-limit.middleware.ts`):

### 2.1 Complete Rate Limit Boundary Matrix
| Endpoint Route / Scope | Rate Limit Rule | Storage Mechanism | Lockout & Remediation Action |
| :--- | :--- | :--- | :--- |
| **Global Edge Reverse Proxy (`/*`)** | 100 requests / minute / IP | Coolify Traefik / Nginx | HTTP 429 Too Many Requests (15-minute IP drop). |
| **POST `/api/v1/auth/login`** | 5 attempts / 15 mins / IP + Email | Redis Counter (`rate:login:{IP}:{Email}`) | Account temporary lockout + Login alert email dispatched (`Resend`). |
| **POST `/api/v1/auth/register`** | 3 attempts / hour / IP | Redis Counter (`rate:reg:{IP}`) | HTTP 429 + CAPTCHA challenge requirement. |
| **POST `/api/v1/auth/verify-otp`** | 3 attempts / 10 mins / User ID | Redis Counter (`rate:otp:{ID}`) | OTP token invalidated immediately upon 3rd failed guess. |
| **POST `/api/v1/auth/forgot-password`**| 3 requests / hour / Email | Redis Counter (`rate:forgot:{Email}`) | Silently ignored (prevents account existence enumeration). |
| **POST `/api/v1/kyc/upload`** | 10 uploads / hour / User ID | Redis Counter (`rate:kyc:{ID}`) | HTTP 429 + Automated compliance velocity alert flag. |
| **POST `/api/v1/wallet/*` (Deposit/Withdraw/Invest)**| 20 requests / minute / User ID | Redis Counter (`rate:wallet:{ID}`)| HTTP 429 + Temporary 5-minute financial transaction freeze. |
| **POST `/api/v1/webhooks/*` (Payment Gateways)** | 300 requests / minute / Gateway IP | Redis Whitelist + Counter | HTTP 429 + Immediate security escalation alert to DevOps. |

---

## 3. Web Security Defenses & Output Encoding

- **Cross-Site Scripting (XSS):** All dynamic user inputs rendered in React (`User.firstName`, `SupportTicket.message`) rely strictly on React's native auto-escaping (`{data}`). Dangerous attributes (`dangerouslySetInnerHTML`) are strictly prohibited across the codebase.
- **Cross-Site Request Forgery (CSRF):** Because API state modifications utilize `Bearer <JWT>` headers alongside `SameSite=Strict` cookies, standard CSRF vectors are neutralized by browser origin policies. For cookie-based token refreshes, an anti-CSRF custom header (`X-Requested-With: XMLHttpRequest`) is required.
- **SQL Injection Prevention:** 100% of database access is encapsulated by **Prisma ORM** parameterized queries. Raw SQL execution (`$queryRawUnsafe`) is forbidden by the Development Constitution.
- **Security Headers (`next.config.mjs` & Coolify Traefik):**
  - `Content-Security-Policy`: `default-src 'self'; img-src 'self' https://res.cloudinary.com data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'`
  - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options`: `nosniff`
  - `X-Frame-Options`: `DENY`

---

## 4. KYC File Security & Private Object Storage Strategy

Government identity documents represent high-risk PII. The following multi-tiered access control strategy governs all KYC file handling:
1. **No Public Directory Uploads:** All client uploads hitting `POST /api/v1/kyc/upload` are validated (`MIME: image/jpeg, image/png, application/pdf`, max 5MB) and streamed directly to **Cloudinary Authenticated Private Folders (`type: 'authenticated'`)** under path `/teslaprime/secure/kyc/{USER_ID}/`.
2. **Strict Time-Limited Signed Access:** When a `COMPLIANCE_OFFICER` requests document review (`GET /api/v1/admin/kyc/document/{id}`), the backend generates an ephemeral signed URL valid for exactly **300 seconds (5 minutes)** (`cloudinary.url(publicId, { type: 'authenticated', sign_url: true, expires_at: Math.floor(Date.now()/1000)+300 })`).
3. **Audit Watermarking & Logging:** Every single viewing event creates an append-only entry in `AuditLog` recording `actorRole: 'COMPLIANCE_OFFICER'`, `actionType: 'VIEW_KYC_DOCUMENT'`, and `resourceId`.
