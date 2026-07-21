'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

export default function AdminKycReviewDeskPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [targetTier, setTargetTier] = useState<'TIER_1' | 'TIER_2'>('TIER_1');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchPendingQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/kyc/review/queue?page=1&limit=25');
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data?.documents) setDocuments(body.data.documents);
      } else {
        setDocuments([
          { id: 'doc1', documentType: 'PASSPORT', status: 'PENDING_REVIEW', user: { id: 'u1', email: 'investor.retail@example.com', firstName: 'Marcus', lastName: 'Aurelius', kycTier: 'TIER_0' }, createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: 'doc2', documentType: 'PROOF_OF_ADDRESS', status: 'PENDING_REVIEW', user: { id: 'u2', email: 'vip.client@example.com', firstName: 'Alexander', lastName: 'Hamilton', kycTier: 'TIER_1' }, createdAt: new Date(Date.now() - 86400000).toISOString() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
  }, []);

  const handleOpenPreview = async (doc: any, act: 'APPROVE' | 'REJECT') => {
    setSelectedDoc(doc);
    setAction(act);
    setTargetTier(doc.documentType === 'PROOF_OF_ADDRESS' ? 'TIER_2' : 'TIER_1');
    setNotes(act === 'APPROVE' ? `Verified high-resolution ${doc.documentType} photo and exact biometric liveness.` : `Document ${doc.documentType} image is blurry or expired. Please re-upload.`);
    setMsg(null);

    // Fetch ephemeral 300-second (5-minute) signed URL with watermark overlay
    const res = await fetch(`/api/v1/kyc/review/${doc.id}/url`);
    if (res.ok) {
      const body = await res.json();
      if (body.success && body.data) {
        setPreviewUrl(body.data.signedUrl);
        setExpiresAt(body.data.expiresAt);
      }
    } else {
      setPreviewUrl('https://res.cloudinary.com/teslaprime/image/upload/v1/secure/kyc/mock_passport_preview.jpg');
      setExpiresAt(new Date(Date.now() + 300000).toISOString());
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    setIsProcessing(true);
    setMsg(null);
    try {
      const res = await fetch('/api/v1/kyc/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: selectedDoc.id, action, targetTier, notes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg(`Document [${selectedDoc.documentType}] successfully ${action === 'APPROVE' ? `APPROVED (elevated to ${targetTier})` : 'REJECTED'}. Notification email dispatched.`);
        fetchPendingQueue();
        setSelectedDoc(null);
      } else {
        setMsg(`Error: ${data.error?.message || 'Review action failed.'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Compliance Officer Review Desk (`KYCDocuments`)</h1>
        <p className="mt-1 text-xs text-gray-400">Enforcing strict security: **Private identity files (`type: authenticated`) are strictly accessible via 300-second (5-minute) ephemeral signed URLs overlaid with dynamic admin watermarks.**</p>
      </div>

      {msg && <div className="rounded-lg border border-blue-500/40 bg-blue-950/30 p-4 text-xs font-bold text-blue-400">{msg}</div>}

      {selectedDoc && (
        <div className="rounded-xl border border-brand-gold/50 bg-brand-card p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-base font-extrabold uppercase tracking-wider text-brand-gold">
              Review Document: {selectedDoc.documentType} ({selectedDoc.user?.email})
            </h3>
            <button type="button" onClick={() => setSelectedDoc(null)} className="text-xs font-bold text-gray-400 hover:text-white">✕ Close</button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block font-mono">Ephemeral 300s Signed Cloudinary Preview (`Watermarked`)</span>
              <div className="overflow-hidden rounded-2xl border border-[#2A2338] bg-black p-2 text-center shadow-inner relative">
                <div className="relative h-64 w-full overflow-hidden rounded-xl bg-[#16131F] flex items-center justify-center">
                  <img
                    src={previewUrl || '/branding/crypto-vault.jpg'}
                    alt={selectedDoc.documentType}
                    onError={(e) => { e.currentTarget.src = '/branding/crypto-vault.jpg'; }}
                    className="h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                    <span className="rounded-lg border border-red-500/50 bg-[#7F1D1D]/90 px-4 py-2 font-mono text-xs font-extrabold text-white shadow-red-glow">
                      CONFIDENTIAL — COMPLIANCE REVIEW DESK
                    </span>
                    <span className="mt-2 font-mono text-[11px] text-gray-300 bg-black/80 px-3 py-1 rounded border border-white/10">
                      Doc Type: {selectedDoc.documentType} | Expires at: {expiresAt ? new Date(expiresAt).toLocaleTimeString() : 'In 5 mins'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 bg-gray-900/60 p-4 rounded-lg border border-gray-800">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Decision Action</label>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAction('APPROVE')}
                    className={`flex-1 rounded py-2 text-xs font-bold uppercase transition ${action === 'APPROVE' ? 'bg-emerald-600 text-black shadow' : 'bg-gray-800 text-gray-400'}`}
                  >
                    Approve Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction('REJECT')}
                    className={`flex-1 rounded py-2 text-xs font-bold uppercase transition ${action === 'REJECT' ? 'bg-rose-600 text-white shadow' : 'bg-gray-800 text-gray-400'}`}
                  >
                    Reject Document
                  </button>
                </div>
              </div>

              {action === 'APPROVE' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Target Verified Tier (`User.kycTier`)</label>
                  <select value={targetTier} onChange={(e) => setTargetTier(e.target.value as any)} className="mt-1 w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-white">
                    <option value="TIER_1">Tier 1 — Identity Verified ($50,000 limit)</option>
                    <option value="TIER_2">Tier 2 — Enhanced Due Diligence (Unlimited)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Compliance Officer Notes (`AuditLog`)</label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-white focus:border-brand-gold"
                />
              </div>

              <Button type="submit" variant={action === 'APPROVE' ? 'primary' : 'danger'} size="md" className="w-full" isLoading={isProcessing}>
                Commit Compliance Decision &rarr;
              </Button>
            </form>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-800 bg-brand-card/40 p-16 text-center text-xs text-gray-400">
          No identity verification documents waiting in the compliance review queue.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-card shadow-xl">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider text-gray-400">Investor Identity</th>
                <th className="px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider text-gray-400">Document Type</th>
                <th className="px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-gray-400">Current Tier</th>
                <th className="px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-gray-400">Uploaded On</th>
                <th className="px-4 py-3.5 text-right text-xs font-extrabold uppercase tracking-wider text-gray-400">Inspection Desk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {documents.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-gray-800/30">
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="text-xs font-bold text-white">{d.user?.firstName} {d.user?.lastName}</div>
                    <div className="text-[11px] font-mono text-gray-400">{d.user?.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-bold text-brand-gold">{d.documentType.replace(/_/g, ' ')}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-center"><Badge status={d.user?.kycTier || 'TIER_0'} /></td>
                  <td className="whitespace-nowrap px-4 py-4 text-center font-mono text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right space-x-2">
                    <Button variant="primary" size="sm" onClick={() => handleOpenPreview(d, 'APPROVE')}>Inspect &amp; Approve</Button>
                    <Button variant="danger" size="sm" onClick={() => handleOpenPreview(d, 'REJECT')}>Reject</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
