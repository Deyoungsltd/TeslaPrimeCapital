# TeslaPrimeCapital — Cloudinary Media Asset & Secure KYC Storage Architecture (`Phase 2`)

---

## 1. Asset Segmentation Architecture: Public vs. Private Assets

Our media architecture enforces strict two-zone folder segregation inside **Cloudinary (`cloudinary.v2`)** to separate high-speed public CDN assets from high-security Know Your Customer (KYC) identity documentation.

### 1.1 Public Asset Zone (`/teslaprime/public/...`)
- **Contents:** Platform brand logos, user profile avatars, investment plan iconography, and marketing graphic banners.
- **Delivery Protocol:** Served globally via Cloudinary Edge CDN utilizing automated format selection (`f_auto` -> WebP/AVIF) and dynamic quality compression (`q_auto:good`).
- **Naming & Organization Strategy:** `/teslaprime/public/avatars/{USER_ID}_avatar.webp`; `/teslaprime/public/plans/{PLAN_ID}_banner.jpg`.

---

## 2. Secure Private Asset Zone (`/teslaprime/secure/kyc/...`)

- **Contents:** Government identity documents (Passport front/back, National ID, Driver's License), utility bills for proof of address, and liveness biometric selfies.
- **Strict Storage Type Enforcement:** Every upload hitting `POST /api/v1/kyc/upload` MUST pass `type: 'authenticated'` within the Cloudinary upload API options (`cloudinary.v2.uploader.upload(stream, { folder: 'teslaprime/secure/kyc/...', type: 'authenticated' })`).
- **Zero Public Access Guarantee:** Accessing a file inside `/teslaprime/secure/kyc/...` via a standard Cloudinary CDN URL returns a `401 Unauthorized` / `404 Not Found` response at the Edge.

### 2.1 Signed Ephemeral Access URL Generation Protocol (`src/server/services/kyc.service.ts`)
When an authorized `COMPLIANCE_OFFICER` initiates a request to view a document (`GET /api/v1/admin/kyc/document/{ID}`):
1. The backend verifies RBAC permissions (`checkPermission(user.role, 'kyc:review_docs')`).
2. Queries PostgreSQL for `KYCDocument.cloudinaryPublicId`.
3. Calls the Cloudinary SDK to generate a time-limited signed URL expiring in exactly **300 seconds (5 minutes)**:
   ```typescript
   const signedUrl = cloudinary.v2.url(document.cloudinaryPublicId, {
     type: 'authenticated',
     sign_url: true,
     secure: true,
     expires_at: Math.floor(Date.now() / 1000) + 300, // 5 minute hard ceiling
     transformation: [
       { quality: 'auto', fetch_format: 'auto' },
       { overlay: { font_family: 'Arial', font_size: 24, text: `CONFIDENTIAL - VIEWED BY ADMIN ${adminUser.id}` }, gravity: 'south', opacity: 60 }
     ]
   });
   ```
4. Returns `signedUrl` to the compliance review UI, while writing an immutable entry to `AuditLog`.
