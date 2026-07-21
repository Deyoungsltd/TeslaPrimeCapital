# TeslaPrimeCapital — Know Your Customer (KYC) & AML Verification Specification

---

## 1. Compliance Tiers & Operational Limits

To balance user acquisition friction with strict international anti-money laundering (AML) compliance, the platform implements a 3-tier verification structure:

### 1.1 Verification Tiers Summary Table
| Tier Level | Required Verification Steps | Cumulative Deposit Limit | Monthly Withdrawal Limit | Available Investment Plans |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 0 (Unverified)** | Verified Email + Phone Number OTP confirmation. | Up to $1,000 USD equivalent. | **$0.00 (Withdrawals Disabled)** | Starter Fixed Yield Plans ONLY. |
| **Tier 1 (Identity Verified)** | Government ID upload (Passport / ID / Driver's License) + Biometric Selfie check. | Up to $50,000 USD equivalent. | Up to $25,000 USD equivalent. | All Standard & Prime Growth Plans. |
| **Tier 2 (Enhanced Due Diligence)** | Proof of Residential Address (Utility Bill < 3 mo) + Source of Funds Declaration. | **Unlimited** | **Unlimited** (Subject to multi-sig review > $5k). | All Plans + Institutional Apex Tiers. |

---

## 2. Secure Private File Storage & Access Control Strategy

Government-issued identity documents represent high-risk Personally Identifiable Information (PII). A breach of KYC files constitutes a catastrophic enterprise failure. Therefore, strict storage architecture rules apply:

### 2.1 Storage & Delivery Rules
1. **No Public Cloudinary Folders:** KYC identity files must NEVER be uploaded to standard public cloud storage containers or default Cloudinary public directories.
2. **Authenticated Private Folders:** Documents uploaded via the client must be directed to a secure, restricted private cloud bucket (`/teslaprime/secure/kyc/{USER_ID}/`) with access type set to `type: 'authenticated'` or `type: 'private'`.
3. **Time-Limited Signed Access URLs:** When a `COMPLIANCE_OFFICER` opens the review dashboard (`/admin/kyc`), the backend verifies their RBAC permissions and generates a ephemeral, signed cloud delivery URL with a strict **5-minute expiration (`300s`)**:
   ```javascript
   // Cloudinary Secure Signed URL Architecture Example
   const secureUrl = cloudinary.url(`secure/kyc/${userId}/passport_front.jpg`, {
     type: 'authenticated',
     sign_url: true,
     expires_at: Math.floor(Date.now() / 1000) + 300 // 5 minutes
   });
   ```
4. **Watermarking & Audit Tracking:** Any document viewed inside the admin portal automatically overlays a dynamic digital watermark (`CONFIDENTIAL — VIEWED BY ADMIN_ID ON TIMESTAMP`) and creates an immutable entry in the `AuditLog` table recording which officer accessed the file.
