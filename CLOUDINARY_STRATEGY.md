# TeslaPrimeCapital — Cloudinary Media & Secure Asset Storage Strategy

---

## 1. Asset Segmentation Architecture: Public vs. Private Assets

**Cloudinary** is configured with a strict two-zone folder segregation architecture to distinguish between high-speed CDN public marketing assets and high-security Know Your Customer (KYC) identity documentation.

### 1.1 Public Asset Zone (`/teslaprime/public/...`)
- **Contents:** Platform logos, user profile avatars, investment plan iconography, marketing banners, and public support ticket screenshots.
- **Delivery Rules:** Served via global Cloudinary Edge CDN utilizing automated format and quality optimization parameters (`/image/upload/f_auto,q_auto/v1/...`).
- **Upload Access:** Authenticated users can upload avatars directly via signed upload presets with strict file type validation (`JPG`, `PNG`, `WEBP` only) and maximum file size limits (`2 MB`).

---

## 2. Secure Private Asset Zone (`/teslaprime/secure/kyc/...`)

- **Contents:** Government-issued identity documents (Passport front/back, National ID, Driver's License), utility bills for proof of address, and liveness check biometric selfies.
- **Strict Storage Type:** All files uploaded to this directory MUST be marked with `type: 'authenticated'` upon upload API invocation.
- **Zero Public CDN Access:** Attempting to access a file in `/teslaprime/secure/kyc/...` via a standard Cloudinary URL returns a `401 Unauthorized` / `404 Not Found` error.
- **Access Protocol via Signed Delivery URLs:**
  1. An authorized `COMPLIANCE_OFFICER` initiates a request to `GET /api/v1/admin/kyc/document/{ID}`.
  2. The Node.js service verifies the admin's session, checks `RBAC_PERMISSIONS`, and queries the database for the document's Cloudinary public ID.
  3. The service calls `cloudinary.utils.url(publicId, { type: 'authenticated', sign_url: true, expires_at: Math.floor(Date.now()/1000) + 300 })`.
  4. The generated ephemeral signed URL is returned to the admin dashboard UI and expires automatically after 5 minutes.

---

## 3. Malware & MIME-Type Verification Hooks

Before any file is accepted into Cloudinary or forwarded to private object storage:
1. **Magic Byte Verification:** The backend reads the first 4-8 header bytes of the uploaded buffer to verify the true cryptographic file signature (`ÿØÿ` for JPEG, `PNG

` for PNG, `%PDF-` for PDF), rejecting disguised executable payloads (`.exe`, `.sh`, `.js` renamed to `.jpg`).
2. **Automated Virus/Malware Scan Hook:** Files uploaded to the secure KYC directory trigger an asynchronous web-hook sent to an integrated scanning engine (e.g., ClamAV or Cloudinary Malware Detection Add-on) before marking `KYCDocument.status = 'PENDING_REVIEW'`.
