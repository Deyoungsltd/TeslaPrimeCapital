'use client';

/**
 * Brand Library — CMS Media Governance Console (`/admin/media`)
 *
 * Phone-first control over every registered image slot on the public site.
 * Upload flow mirrors the KYC vault's proven pattern (short-lived signed
 * payload -> direct browser-to-Cloudinary transfer -> server-side record),
 * except assets land in the PUBLIC site-media folder so they can be served
 * to anonymous visitors. Overrides live in the database, not the repo — they
 * survive every commit, redeploy, and cache purge.
 *
 * Access: `plans:create_update` governance scope (SUPER_ADMIN tier), enforced
 * again server-side on every endpoint.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeImage } from '@/components/atoms/SafeImage';
import { useSessionStore } from '@/lib/store/session.store';
import { useMediaManifest } from '@/components/providers/MediaProvider';
import { TEXT_SLOTS } from '@/content/media-registry';

type TAuthedFetch = (path: string, init?: RequestInit) => Promise<{ res: Response; body: any }>;

/**
 * Leadership Identity panel — name / title / signature lines rendered by the
 * public leadership section. Clearing a field restores the office default
 * (never an invented persona); saving publishes instantly platform-wide.
 */
function LeadershipIdentityPanel({
  authedFetch,
  refreshManifest,
}: {
  authedFetch: TAuthedFetch;
  refreshManifest: () => void;
}) {
  const { texts } = useMediaManifest();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'err'; message: string } | null>(null);

  // Seed drafts from the manifest once it resolves (overrides or defaults).
  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const slot of TEXT_SLOTS) {
        if (next[slot.key] === undefined) {
          next[slot.key] = texts[slot.key]?.value ?? slot.defaultValue;
        }
      }
      return next;
    });
  }, [texts]);

  const publish = async () => {
    setBusy(true);
    setNotice(null);
    try {
      for (const slot of TEXT_SLOTS) {
        const value = (drafts[slot.key] ?? '').trim();
        const endpoint = value === '' ? '/api/v1/admin/media/text/revert' : '/api/v1/admin/media/text';
        const payload = value === '' ? { key: slot.key } : { key: slot.key, value };
        const { res, body } = await authedFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
        if (!res.ok || !body?.success) {
          throw new Error(body?.error?.message ?? `Failed to publish ${slot.label}.`);
        }
      }
      refreshManifest();
      setNotice({ tone: 'ok', message: 'Leadership identity published — live across the site within a minute.' });
    } catch (err: any) {
      setNotice({ tone: 'err', message: err.message || 'Publish failed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mb-10 rounded-2xl border border-[#1E2433] bg-[#111520] p-6 shadow-tesla sm:p-8">
      <div className="flex items-center gap-3">
        <span className="h-px w-10 bg-[#EF4444]" />
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
          Leadership Identity
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-gray-400">
        The name, title, and creed rendered beside the leadership portrait on the homepage and
        About. The portrait itself is the first image slot below. Clear a field to restore the
        office-grade default — the site never ships a fabricated person.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {TEXT_SLOTS.map((slot) => (
          <label key={slot.key} className={slot.key === 'leadership.signature' ? 'md:col-span-2' : ''}>
            <span className="mb-1.5 flex items-center justify-between font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
              {slot.label}
              <span className="text-gray-600">
                {(drafts[slot.key] ?? '').length}/{slot.maxLength}
              </span>
            </span>
            {slot.key === 'leadership.signature' ? (
              <textarea
                rows={2}
                value={drafts[slot.key] ?? ''}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [slot.key]: e.target.value }))}
                maxLength={slot.maxLength}
                className="w-full resize-none rounded-lg border border-[#1E2433] bg-[#0A0D14] px-3 py-2.5 text-[13px] text-gray-200 outline-none transition-colors focus:border-[#EF4444]/60"
              />
            ) : (
              <input
                type="text"
                value={drafts[slot.key] ?? ''}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [slot.key]: e.target.value }))}
                maxLength={slot.maxLength}
                className="h-10 w-full rounded-lg border border-[#1E2433] bg-[#0A0D14] px-3 text-[13px] text-gray-200 outline-none transition-colors focus:border-[#EF4444]/60"
              />
            )}
            <span className="mt-1 block text-[10.5px] leading-relaxed text-gray-600">{slot.description}</span>
          </label>
        ))}
      </div>

      {notice && (
        <p
          className={`mt-4 rounded-lg border px-3 py-2 text-[11px] font-semibold ${
            notice.tone === 'ok'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {notice.message}
        </p>
      )}

      <div className="mt-6">
        <button
          type="button"
          disabled={busy}
          onClick={() => void publish()}
          className="h-10 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] px-8 font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.35)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.6)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Publishing…' : 'Publish identity'}
        </button>
      </div>
    </section>
  );
}

interface ISlotOverride {
  url: string;
  altText: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  updatedAt: string;
}

interface IAdminSlot {
  key: string;
  label: string;
  description: string;
  defaultSrc: string;
  defaultAlt: string;
  aspect: string;
  usedOn: string;
  override: ISlotOverride | null;
}

type TSlotPhase =
  | { state: 'idle' }
  | { state: 'uploading'; progress: number }
  | { state: 'recording' }
  | { state: 'error'; message: string };

export default function AdminMediaLibraryPage() {
  const { accessToken } = useSessionStore();
  const { refresh: refreshManifest } = useMediaManifest();
  const [slots, setSlots] = useState<IAdminSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [phases, setPhases] = useState<Record<string, TSlotPhase>>({});
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const authedFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const res = await fetch(path, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      const body = await res.json().catch(() => null);
      return { res, body };
    },
    [accessToken],
  );

  const loadSlots = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setPageError(null);
    const { res, body } = await authedFetch('/api/v1/admin/media/list');
    if (res.ok && body?.success) {
      setSlots(body.data.assets);
    } else {
      setPageError(body?.error?.message ?? 'Unable to load the brand library.');
    }
    setLoading(false);
  }, [authedFetch, accessToken]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const setPhase = (key: string, phase: TSlotPhase) =>
    setPhases((prev) => ({ ...prev, [key]: phase }));

  const handleFile = async (slot: IAdminSlot, file: File) => {
    setPhase(slot.key, { state: 'uploading', progress: 0 });
    try {
      // 1. Short-lived signature from our server
      const sig = await authedFetch('/api/v1/admin/media/signature', { method: 'POST', body: '{}' });
      if (!sig.res.ok || !sig.body?.success) {
        throw new Error(sig.body?.error?.message ?? 'Could not obtain an upload signature.');
      }
      const { timestamp, folder, signature, apiKey, cloudName } = sig.body.data;

      // 2. Direct browser -> Cloudinary transfer with real progress events
      const cloudJson: any = await new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('file', file);
        form.append('api_key', apiKey);
        form.append('timestamp', String(timestamp));
        form.append('signature', signature);
        form.append('folder', folder);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setPhase(slot.key, { state: 'uploading', progress: Math.round((e.loaded / e.total) * 100) });
          }
        };
        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300 && json.public_id) resolve(json);
            else reject(new Error(json?.error?.message ?? `Cloudinary rejected the upload (HTTP ${xhr.status}).`));
          } catch {
            reject(new Error('Cloudinary returned an unreadable response.'));
          }
        };
        xhr.onerror = () => reject(new Error('Network failure while transferring to Cloudinary.'));
        xhr.send(form);
      });

      // 3. Record the override against this slot
      setPhase(slot.key, { state: 'recording' });
      const rec = await authedFetch('/api/v1/admin/media/record', {
        method: 'POST',
        body: JSON.stringify({
          key: slot.key,
          cloudinaryPublicId: cloudJson.public_id,
          altText: altDrafts[slot.key]?.trim() || undefined,
        }),
      });
      if (!rec.res.ok || !rec.body?.success) {
        throw new Error(rec.body?.error?.message ?? 'The override could not be recorded.');
      }

      setPhase(slot.key, { state: 'idle' });
      await loadSlots();
      refreshManifest();
    } catch (err: any) {
      setPhase(slot.key, { state: 'error', message: err.message || 'Upload failed.' });
    } finally {
      const input = fileInputs.current[slot.key];
      if (input) input.value = '';
    }
  };

  const handleRevert = async (slot: IAdminSlot) => {
    setPhase(slot.key, { state: 'recording' });
    const { res, body } = await authedFetch('/api/v1/admin/media/revert', {
      method: 'POST',
      body: JSON.stringify({ key: slot.key }),
    });
    if (res.ok && body?.success) {
      setPhase(slot.key, { state: 'idle' });
      await loadSlots();
      refreshManifest();
    } else {
      setPhase(slot.key, { state: 'error', message: body?.error?.message ?? 'Revert failed.' });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-1 py-2">
      {/* Console header */}
      <header className="mb-10 space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#EF4444]" />
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.3em] text-[#EF4444]">
            Brand Governance
          </span>
        </div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl">Brand Library</h1>
        <p className="max-w-2xl text-[13px] leading-relaxed text-gray-400">
          Every image the public site renders, in one grid. Replace any slot straight from your
          phone — overrides persist in the database and survive every commit and redeploy.
          Aim for the stated aspect ratio; dark exposures keep headline text legible.
        </p>
      </header>

      {/* ── Leadership Identity ─────────────────────────────────── */}
      <LeadershipIdentityPanel authedFetch={authedFetch} refreshManifest={refreshManifest} />

      {loading && (
        <div className="rounded-2xl border border-[#1E2433] bg-[#111520] p-10 text-center font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
          Loading brand library…
        </div>
      )}
      {pageError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-[12px] font-semibold text-red-300">
          {pageError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        {slots.map((slot) => {
          const phase = phases[slot.key] ?? { state: 'idle' as const };
          const busy = phase.state === 'uploading' || phase.state === 'recording';
          const previewSrc = slot.override?.url ?? slot.defaultSrc;
          return (
            <article key={slot.key} className="overflow-hidden rounded-2xl border border-[#1E2433] bg-[#111520] shadow-tesla">
              {/* Preview */}
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <SafeImage
                  src={previewSrc}
                  alt={slot.override?.altText ?? slot.defaultAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <span
                    className={`rounded-md px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.18em] backdrop-blur-md ${
                      slot.override
                        ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                        : 'border border-white/15 bg-black/70 text-gray-300'
                    }`}
                  >
                    {slot.override ? 'Custom' : 'Default art'}
                  </span>
                  <span className="rounded-md border border-white/15 bg-black/70 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400 backdrop-blur-md">
                    {slot.aspect}
                  </span>
                </div>
                {busy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.25em] text-white">
                      {phase.state === 'uploading' ? `Uploading ${phase.progress}%` : 'Recording override…'}
                    </span>
                  </div>
                )}
                {phase.state === 'uploading' && (
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#EF4444] to-[#DC2626] transition-all duration-300"
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-4 p-6">
                <div>
                  <h2 className="text-[15px] font-semibold tracking-tight text-white">{slot.label}</h2>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-gray-500">{slot.description}</p>
                  <p className="mt-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-gray-600">
                    Used on {slot.usedOn}
                    {slot.override?.updatedAt
                      ? ` · Updated ${new Date(slot.override.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : ''}
                  </p>
                </div>

                <label className="block">
                  <span className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    Alt text (accessibility & SEO)
                  </span>
                  <input
                    type="text"
                    value={altDrafts[slot.key] ?? slot.override?.altText ?? slot.defaultAlt}
                    onChange={(e) => setAltDrafts((prev) => ({ ...prev, [slot.key]: e.target.value }))}
                    maxLength={300}
                    className="h-10 w-full rounded-lg border border-[#1E2433] bg-[#0A0D14] px-3 text-[12px] text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-[#EF4444]/60"
                  />
                </label>

                {phase.state === 'error' && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] font-semibold text-red-300">
                    {phase.message}
                  </p>
                )}

                <div className="flex items-center gap-3">
                  <input
                    ref={(el) => {
                      fileInputs.current[slot.key] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFile(slot, file);
                    }}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileInputs.current[slot.key]?.click()}
                    className="h-10 flex-1 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_4px_25px_rgba(239,68,68,0.35)] transition-all duration-300 hover:shadow-[0_8px_35px_rgba(239,68,68,0.6)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? 'Working…' : slot.override ? 'Replace from device' : 'Upload override'}
                  </button>
                  {slot.override && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleRevert(slot)}
                      className="h-10 rounded-lg border border-[#2C354C] px-5 font-mono text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-300 transition-all duration-300 hover:border-gray-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Revert
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
