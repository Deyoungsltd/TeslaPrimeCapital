'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSessionStore } from '@/lib/store/session.store';

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type DocumentType = 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'PROOF_OF_ADDRESS' | 'SELFIE';
type VerificationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

interface IKYCDocument {
  id: string;
  documentType: DocumentType;
  status: VerificationStatus;
  reviewNotes?: string | null;
  createdAt: string;
}

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  PASSPORT: 'Passport',
  NATIONAL_ID: 'National ID Card',
  DRIVERS_LICENSE: "Driver's License",
  SELFIE: 'Selfie Verification',
  PROOF_OF_ADDRESS: 'Proof of Address',
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

type SlotState =
  | { phase: 'idle' }
  | { phase: 'selected'; file: File; previewUrl: string }
  | { phase: 'uploading'; file: File; previewUrl: string; progress: number; stage: 'signing' | 'transferring' | 'recording' }
  | { phase: 'error'; message: string };

interface INotice {
  kind: 'success' | 'error';
  title: string;
  body: string;
  reference?: string;
}

/* ------------------------------------------------------------------ */
/* Atom components (kept local — verification-desk specific)           */
/* ------------------------------------------------------------------ */

const StageLabel: React.FC<{ index: string; title: string; done: boolean }> = ({ index, title, done }) => (
  <div className="flex items-center gap-3">
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-[10px] font-extrabold tracking-widest ${
        done ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]'
      }`}
    >
      {done ? (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        index
      )}
    </span>
    <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.22em] text-gray-400">{title}</span>
  </div>
);

const StatusBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  const styles: Record<VerificationStatus, string> = {
    PENDING_REVIEW: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    APPROVED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    REJECTED: 'border-red-500/40 bg-red-500/10 text-red-400',
  };
  const labels: Record<VerificationStatus, string> = {
    PENDING_REVIEW: 'Pending Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  };
  return (
    <span className={`rounded-md border px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.18em] ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function ComplianceVerificationPage() {
  const { accessToken } = useSessionStore();

  const [notice, setNotice] = useState<INotice | null>(null);
  const [documents, setDocuments] = useState<IKYCDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  // Identity document slot (one type selectable among three)
  const [identityType, setIdentityType] = useState<'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE'>('NATIONAL_ID');
  const [identitySlot, setIdentitySlot] = useState<SlotState>({ phase: 'idle' });
  const [selfieSlot, setSelfieSlot] = useState<SlotState>({ phase: 'idle' });
  const [addressSlot, setAddressSlot] = useState<SlotState>({ phase: 'idle' });

  const identityInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const authedFetch = useCallback(
    (url: string, init?: RequestInit) =>
      fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...(init?.headers ?? {}),
        },
      }),
    [accessToken],
  );

  /* ----------------------- documents ledger ----------------------- */
  const loadDocuments = useCallback(async () => {
    if (!accessToken) {
      setDocumentsLoading(false);
      return;
    }
    setDocumentsLoading(true);
    try {
      const res = await authedFetch('/api/v1/kyc/documents');
      const body = await res.json().catch(() => null);
      if (res.ok && body?.success && Array.isArray(body.data)) {
        setDocuments(body.data);
      }
    } catch {
      /* ledger stays in its loading-resolved empty state; upload path reports its own errors */
    } finally {
      setDocumentsLoading(false);
    }
  }, [authedFetch, accessToken]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  /* -------------------------- file picking ------------------------- */
  const beginPick = (ref: React.RefObject<HTMLInputElement>) => ref.current?.click();

  const handleFileChosen = (
    file: File | null,
    slot: SlotState,
    setSlot: (s: SlotState) => void,
  ): void => {
    if (!file) return;
    setNotice(null);

    // Revoke any previous object URL to avoid leaking previews
    if ((slot.phase === 'selected' || slot.phase === 'uploading') && slot.previewUrl) {
      URL.revokeObjectURL(slot.previewUrl);
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setSlot({ phase: 'error', message: 'Unsupported format. Upload a JPG, PNG, or WEBP image of the document.' });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setSlot({ phase: 'error', message: 'File exceeds the 10 MB ceiling. Compress the image and try again.' });
      return;
    }
    setSlot({ phase: 'selected', file, previewUrl: URL.createObjectURL(file) });
  };

  /* ------------------------- upload pipeline ------------------------ */
  /**
   * Three-stage real transfer: (1) request a short-lived Cloudinary upload
   * signature from our API, (2) POST the file directly into the private
   * authenticated folder (XHR for true byte-level progress), (3) record the
   * returned public ID against the user's compliance ledger.
   */
  const executeUpload = async (
    documentType: DocumentType,
    file: File,
    previewUrl: string,
    setSlot: (s: SlotState) => void,
  ): Promise<void> => {
    if (!accessToken) {
      setNotice({
        kind: 'error',
        title: 'Session required',
        body: 'Your session token is unavailable. Sign in again and retry the upload.',
      });
      return;
    }

    const setProgress = (progress: number, stage: 'signing' | 'transferring' | 'recording') =>
      setSlot({ phase: 'uploading', file, previewUrl, progress, stage });

    try {
      /* Stage 1 — signature */
      setProgress(0, 'signing');
      const sigRes = await authedFetch('/api/v1/kyc/upload-signature', {
        method: 'POST',
        body: JSON.stringify({ documentType }),
      });
      const sigBody = await sigRes.json().catch(() => null);
      if (!sigRes.ok || !sigBody?.success || !sigBody.data) {
        const message =
          sigRes.status === 429
            ? 'Upload rate limit reached — the compliance desk accepts 10 transfers per hour. Please retry shortly.'
            : sigBody?.error?.message ?? 'Failed to authorize the secure upload channel.';
        throw new Error(message);
      }
      const sig = sigBody.data as {
        timestamp: number;
        folder: string;
        signature: string;
        apiKey: string;
        cloudName: string;
        uploadType: string;
      };

      /* Stage 2 — direct authenticated transfer to Cloudinary */
      const cloudResult = await new Promise<{ public_id: string }>((resolve, reject) => {
        const form = new FormData();
        form.append('file', file);
        form.append('api_key', sig.apiKey);
        form.append('timestamp', String(sig.timestamp));
        form.append('signature', sig.signature);
        form.append('folder', sig.folder);
        form.append('type', sig.uploadType);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100), 'transferring');
          }
        };
        xhr.onload = () => {
          try {
            const parsed = JSON.parse(xhr.responseText || '{}');
            if (xhr.status >= 200 && xhr.status < 300 && parsed.public_id) {
              resolve(parsed);
            } else {
              reject(new Error(parsed?.error?.message ?? 'The document vault rejected the transfer. Check that upload credentials are configured on this deployment.'));
            }
          } catch {
            reject(new Error('Unreadable response from the document vault.'));
          }
        };
        xhr.onerror = () => reject(new Error('Network failure reaching the document vault. Check your connection and retry.'));
        xhr.send(form);
      });

      /* Stage 3 — ledger record */
      setProgress(100, 'recording');
      const recordRes = await authedFetch('/api/v1/kyc/record', {
        method: 'POST',
        body: JSON.stringify({ documentType, cloudinaryPublicId: cloudResult.public_id }),
      });
      const recordBody = await recordRes.json().catch(() => null);
      if (!recordRes.ok || !recordBody?.success || !recordBody.data) {
        throw new Error(recordBody?.error?.message ?? 'Document reached the vault but could not be recorded. Contact support.');
      }

      const recorded = recordBody.data as IKYCDocument;
      URL.revokeObjectURL(previewUrl);
      setSlot({ phase: 'idle' });
      setNotice({
        kind: 'success',
        title: `${DOC_TYPE_LABELS[documentType]} received for review`,
        body: 'A compliance officer verifies every document manually against your account details. You will receive an email the moment a decision is recorded — there is nothing further to submit for this document.',
        reference: recorded.id,
      });
      await loadDocuments();
    } catch (err: any) {
      setSlot({ phase: 'error', message: err.message ?? 'Upload failed. Please retry.' });
    } finally {
      xhrRef.current = null;
    }
  };

  /* ------------------------ slot renderer --------------------------- */
  const renderUploader = (
    slot: SlotState,
    setSlot: (s: SlotState) => void,
    inputRef: React.RefObject<HTMLInputElement>,
    documentType: DocumentType,
    hint: string,
  ) => {
    const busy = slot.phase === 'uploading';

    return (
      <div
        className={`rounded-xl border transition-colors ${
          slot.phase === 'error' ? 'border-red-500/40' : 'border-[#2C354C]'
        } bg-[#0A0D14] p-5 space-y-4`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            handleFileChosen(file, slot, setSlot);
            e.target.value = '';
          }}
        />

        {slot.phase === 'idle' && (
          <button
            type="button"
            onClick={() => beginPick(inputRef)}
            className="group flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#2C354C] px-4 py-8 text-center transition hover:border-[#EF4444]/60 hover:bg-[#EF4444]/[0.03]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#2C354C] bg-black text-gray-500 transition group-hover:border-[#EF4444]/50 group-hover:text-[#EF4444]">
              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 16V4m0 0L7 9m5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="space-y-1">
              <span className="block text-xs font-bold text-white">Choose file from this device</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500">{hint}</span>
            </span>
          </button>
        )}

        {slot.phase === 'error' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 text-red-400">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-xs leading-relaxed text-red-300">{slot.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setSlot({ phase: 'idle' })}
              className="h-9 rounded-lg border border-white/15 bg-white/5 px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-white transition hover:bg-white/10 hover:border-white/40"
            >
              Try Again
            </button>
          </div>
        )}

        {(slot.phase === 'selected' || slot.phase === 'uploading') && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slot.previewUrl}
                alt="Selected document preview"
                className="h-16 w-16 rounded-lg border border-[#2C354C] object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">{slot.file.name}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500">
                  {(slot.file.size / 1024 / 1024).toFixed(2)} MB · {slot.file.type.replace('image/', '').toUpperCase()}
                </p>
              </div>
              {!busy && (
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(slot.previewUrl);
                    setSlot({ phase: 'idle' });
                  }}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[#2C354C] text-gray-500 transition hover:border-red-500/50 hover:text-red-400"
                  aria-label="Remove selected file"
                >
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            {slot.phase === 'uploading' && (
              <div className="space-y-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] transition-all duration-300"
                    style={{ width: `${Math.max(slot.progress, slot.stage === 'signing' ? 4 : slot.stage === 'recording' ? 96 : slot.progress)}%` }}
                  />
                </div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500">
                  {slot.stage === 'signing' && 'Authorizing secure channel…'}
                  {slot.stage === 'transferring' && `Transferring to private vault — ${slot.progress}%`}
                  {slot.stage === 'recording' && 'Recording document reference…'}
                </p>
              </div>
            )}

            {slot.phase === 'selected' && (
              <button
                type="button"
                onClick={() => executeUpload(documentType, slot.file, slot.previewUrl, setSlot)}
                className="h-11 w-full rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[11px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.35)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.6)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Confirm Secure Upload
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const hasApproved = (types: DocumentType[]) =>
    documents.some((d) => types.includes(d.documentType) && d.status === 'APPROVED');
  const identityDone = hasApproved(['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE']);
  const selfieDone = hasApproved(['SELFIE']);

  /* ------------------------------ view ------------------------------ */
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-[#EF4444]" />
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.28em] text-[#EF4444]">
            Compliance Desk
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">Identity Verification</h1>
        <p className="max-w-xl text-xs leading-relaxed text-gray-400">
          Tier-1 clearance requires one government-issued identity document plus a selfie match. Files transfer
          directly from your device into an authenticated private vault — only compliance officers can ever
          open them, and every review decision arrives by email.
        </p>
      </div>

      {/* Decision notice (inline panel — replaces the old floating banner) */}
      {notice && (
        <div
          className={`rounded-xl border p-5 ${
            notice.kind === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/[0.06]'
              : 'border-red-500/30 bg-red-500/[0.06]'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${
                  notice.kind === 'success'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    : 'border-red-500/40 bg-red-500/10 text-red-400'
                }`}
              >
                {notice.kind === 'success' ? (
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v5m0 4h.01" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                )}
              </span>
              <div className="space-y-1.5">
                <p className={`text-sm font-extrabold ${notice.kind === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                  {notice.title}
                </p>
                <p className="max-w-lg text-xs leading-relaxed text-gray-400">{notice.body}</p>
                {notice.reference && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="rounded-md border border-[#2C354C] bg-black px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Reference {notice.reference}
                    </span>
                    <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.14em] text-amber-400">
                      Status · Pending Review
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[#2C354C] text-gray-500 transition hover:text-white"
              aria-label="Dismiss notification"
            >
              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload sequence */}
      <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-6 sm:p-8 shadow-tesla space-y-8">
        {/* Step 1 — identity document */}
        <section className="space-y-4">
          <StageLabel index="01" title="Government Identity Document" done={identityDone} />
          <div className="flex flex-wrap gap-2">
            {(['NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setIdentityType(type)}
                className={`h-9 rounded-lg border px-4 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] transition ${
                  identityType === type
                    ? 'border-[#EF4444]/60 bg-[#EF4444]/10 text-[#EF4444]'
                    : 'border-[#2C354C] bg-black text-gray-400 hover:text-white hover:border-white/30'
                }`}
              >
                {DOC_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
          {renderUploader(identitySlot, setIdentitySlot, identityInputRef, identityType, 'Full document visible, all four corners, JPG / PNG / WEBP up to 10 MB')}
        </section>

        {/* Step 2 — selfie */}
        <section className="space-y-4">
          <StageLabel index="02" title="Selfie Match" done={selfieDone} />
          {renderUploader(selfieSlot, setSelfieSlot, selfieInputRef, 'SELFIE', 'Face clearly lit, no filters, holding nothing over your features')}
        </section>

        {/* Step 3 — proof of address (Tier-2) */}
        <section className="space-y-4">
          <StageLabel index="03" title="Proof of Address — Tier 2 (Optional)" done={hasApproved(['PROOF_OF_ADDRESS'])} />
          {renderUploader(addressSlot, setAddressSlot, addressInputRef, 'PROOF_OF_ADDRESS', 'Utility bill or bank statement issued within the last 3 months')}
        </section>
      </div>

      {/* Submitted documents ledger */}
      <div className="rounded-2xl border border-[#1E2433] bg-[#111520] shadow-tesla">
        <div className="flex items-center justify-between border-b border-[#1E2433] px-6 py-4">
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.22em] text-gray-400">
            Submitted Documents
          </span>
          <span className="font-mono text-[10px] font-bold text-gray-600">
            {documentsLoading ? 'SYNCING…' : `${documents.length} RECORD${documents.length === 1 ? '' : 'S'}`}
          </span>
        </div>

        {documentsLoading ? (
          <div className="space-y-px p-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-[#181D2D]/40" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#2C354C] bg-black text-gray-600">
              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="text-xs font-bold text-gray-400">No documents on file yet</p>
            <p className="max-w-xs text-[11px] leading-relaxed text-gray-600">
              Uploads appear here with a live review status the moment they are recorded.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#1E2433]/70">
            {documents.map((doc) => (
              <li key={doc.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">{DOC_TYPE_LABELS[doc.documentType]}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-gray-500">
                    Submitted {new Date(doc.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    {' · Ref '}
                    {doc.id.slice(0, 8)}
                  </p>
                  {doc.status === 'REJECTED' && doc.reviewNotes && (
                    <p className="text-[11px] leading-relaxed text-red-300/90">
                      Reviewer note: {doc.reviewNotes}
                    </p>
                  )}
                </div>
                <StatusBadge status={doc.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Custody note */}
      <p className="font-mono text-[9px] leading-relaxed tracking-[0.08em] text-gray-600 uppercase">
        Documents are stored in an authenticated private zone outside the public CDN. Viewing is restricted to
        compliance officers under watermarked, 5-minute expiring URLs, and every view is written to the immutable
        audit ledger.
      </p>
    </div>
  );
}
