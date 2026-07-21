# TeslaPrimeCapital — Authentication & Identity Management Specification

---

## 1. Architectural Trade-off Analysis: JWT vs. Secure Sessions

Our senior engineering panel conducted a thorough architectural trade-off review to select the most secure, high-performance authentication mechanism for the platform.

### 1.1 Option A: Pure Stateless JSON Web Tokens (JWT)
- **Mechanism:** User receives a signed JWT containing user ID and roles upon login. Every API request validates the token signature locally using the secret key without checking the database or Redis.
- **Advantages:** Zero server-side memory footprint; sub-millisecond validation; infinite horizontal scaling without sticky sessions.
- **Fatal Enterprise Flaw:** Once issued, a stateless JWT cannot be revoked or invalidated before its natural expiration time without introducing a complex centralized blacklist (which defeats the statelessness). If a user changes their password, gets banned by an admin, or has their device stolen, the attacker retains full access until the token expires.

### 1.2 Option B: Pure Stateful Redis Sessions
- **Mechanism:** User receives a secure, random 64-character session ID stored inside an `httpOnly`, `Secure` cookie. Every single API request performs a Redis network query (`GET session:{session_id}`) to verify validity, fetch roles, and check session expiration.
- **Advantages:** Instantaneous revocation; absolute control over active devices; zero risk of JWT secret key leakage.
- **Disadvantages:** Introduces a network round-trip to Redis on every single high-frequency API request (`GET /api/v1/investments/plans`, `GET /api/v1/wallet/balance`), creating potential Redis bottlenecking at 10,000+ concurrent requests per second.

### 1.3 Option C (Selected & Recommended): Hybrid Rotating Token Architecture
We recommend and specify a **Hybrid Rotating Token Architecture** that captures the speed of stateless tokens while guaranteeing the absolute security and revocation capabilities of stateful sessions:
1. **Short-Lived Stateless Access Token (JWT):** Issued with a strict **15-minute expiration (`900s`)**. Stored in application memory (or secure short-lived cookie) and used to authorize 95% of standard read/write API endpoints.
2. **Stateful Rotating Refresh Token:** Issued with a **7-day expiration (`604800s`)** and stored inside a strict `httpOnly`, `Secure`, `SameSite=Strict` cookie AND persisted directly inside **Redis** and the **`Session` PostgreSQL table** linked to the user's device fingerprint and IP address.
3. **Automatic Silent Rotation:** When the 15-minute JWT expires, the Next.js frontend automatically hits `POST /api/v1/auth/refresh`. The backend checks Redis for the refresh token. If valid, it immediately **deletes/rotates** the old refresh token, issues a brand new 7-day refresh token in Redis, and returns a new 15-minute JWT access token.
4. **Instant Revocation Guarantee:** If a `SUPER_ADMIN` bans a user, or a user clicks "Log out of all devices", the backend deletes the user's refresh tokens from Redis (`DEL session:*`). Within a maximum of 15 minutes (or instantly upon next token refresh attempt), all access across all devices is permanently terminated.

---

## 2. Multi-Factor Authentication (MFA) & OTP Verification

- **Email OTP Verification:** Upon initial registration and login from unrecognized device fingerprints, the system generates a 6-digit cryptographic random OTP (`crypto.randomInt(100000, 999999)`), stores a salted hash (`SHA-256`) of the OTP inside Redis (`otp:user_{ID}`, TTL 600s), and dispatches the code via `Resend`.
- **MFA / TOTP Authenticator Integration:**
  - Users can enable Time-based One-Time Password (TOTP) utilizing standard RFC 6238 algorithms (`otplib`).
  - When enabled, the secret key is encrypted (`AES-256-GCM`) before storage inside `User.twoFactorSecret`.
  - The system generates 10 single-use emergency backup recovery codes, hashed via `Argon2id` and stored inside `User.backupCodes`.
  - **Strict Enforcement Rule:** MFA/TOTP confirmation is **mandatory** for any user attempting to:
    1. Submit a withdrawal request exceeding $1,000 equivalent.
    2. Change their login email address or account password.
    3. Modify their designated payout bank account or crypto withdrawal destination addresses.
