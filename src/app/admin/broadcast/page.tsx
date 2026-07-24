'use client';

import React, { useMemo, useState } from 'react';
import { authedApiFetch } from '@/lib/authed-api';

type DeskOption = 'Compliance Desk' | 'Treasury Desk' | 'Portfolio Desk' | 'Security Desk' | 'Client Services Desk';
type AudienceOption = 'ALL_INVESTORS' | 'TIER_1_AND_ABOVE' | 'TIER_2_ONLY';

const DESKS: { value: DeskOption; hint: string }[] = [
  { value: 'Client Services Desk', hint: 'General platform announcements' },
  { value: 'Treasury Desk', hint: 'Settlement rails, deposit & withdrawal notices' },
  { value: 'Compliance Desk', hint: 'Verification policy notices' },
  { value: 'Portfolio Desk', hint: 'Plan and allocation communications' },
  { value: 'Security Desk', hint: 'Account protection advisories' },
];

const AUDIENCES: { value: AudienceOption; label: string; detail: string }[] = [
  { value: 'ALL_INVESTORS', label: 'All Active Investors', detail: 'Every ACTIVE retail account' },
  { value: 'TIER_1_AND_ABOVE', label: 'Tier 1 & Tier 2', detail: 'Verified clients only' },
  { value: 'TIER_2_ONLY', label: 'Tier 2 Only', detail: 'Institutional-tier clients' },
];

interface IDispatchResult {
  targetedCount: number;
  deliveredCount: number;
  failureCount: number;
  sendEmail: boolean;
}

export default function AdminBroadcastCenterPage() {
  const [desk, setDesk] = useState<DeskOption>('Client Services Desk');
  const [audience, setAudience] = useState<AudienceOption>('ALL_INVESTORS');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<IDispatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messageLength = message.trim().length;
  const canSubmit = useMemo(
    () => subject.trim().length >= 4 && messageLength >= 10 && messageLength <= 2000 && totpCode.trim().length === 6 && !isSending,
    [subject, messageLength, totpCode, isSending],
  );

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await authedApiFetch('/api/v1/admin/broadcast/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          desk,
          audience,
          subject: subject.trim(),
          message: message.trim(),
          sendEmail,
          totpCode: totpCode.trim(),
        }),
      });
      const body = await res.json();
      if (res.ok && body.success && body.data) {
        setResult(body.data as IDispatchResult);
        setSubject('');
        setMessage('');
        setTotpCode('');
      } else {
        setError(body?.error?.message ?? 'Dispatch failed — no messages were released.');
      }
    } catch {
      setError('Network interruption during dispatch. Check the audit ledger before re-sending.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Broadcast Center</h1>
        <p className="mt-1 text-xs text-gray-400">
          Address every client as a personal message from a named desk. Each dispatch lands in the client&apos;s Support Desk
          thread (reply-capable), triggers a real-time notification, and can optionally include the email letter.
          Every run is signed with your Two-Factor code and written to the audit ledger.
        </p>
      </div>

      {result && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-4 text-xs font-bold text-emerald-300">
          Dispatch complete: {result.deliveredCount} of {result.targetedCount} clients reached
          {result.failureCount > 0 ? ` (${result.failureCount} delivery failures — inspect the audit ledger)` : ''}
          {result.sendEmail ? ' · email letters queued' : ' · in-app channels only'}.
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 p-4 text-xs font-bold text-rose-300">{error}</div>
      )}

      <form onSubmit={handleDispatch} className="rounded-xl border border-brand-gold/40 bg-brand-card p-6 shadow-2xl space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Sending Desk</label>
            <select
              value={desk}
              onChange={(e) => setDesk(e.target.value as DeskOption)}
              className="mt-1 w-full rounded border border-gray-700 bg-gray-900 px-3 py-2.5 text-xs text-white focus:border-brand-gold"
            >
              {DESKS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.value} — {d.hint}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as AudienceOption)}
              className="mt-1 w-full rounded border border-gray-700 bg-gray-900 px-3 py-2.5 text-xs text-white focus:border-brand-gold"
            >
              {AUDIENCES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label} · {a.detail}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300">Subject</label>
            <span className="font-mono text-[10px] text-gray-500">{subject.trim().length}/140</span>
          </div>
          <input
            type="text"
            value={subject}
            maxLength={140}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Scheduled settlement rail maintenance — Sunday 02:00 UTC"
            className="mt-1 w-full rounded border border-gray-700 bg-gray-900 px-3 py-2.5 text-xs text-white focus:border-brand-gold"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300">Message Body</label>
            <span className="font-mono text-[10px] text-gray-500">{messageLength}/2000</span>
          </div>
          <textarea
            value={message}
            maxLength={2000}
            rows={7}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write exactly what each client will read in their Support Desk thread. Sign off as the desk — clients reply directly inside the same thread."
            className="mt-1 w-full rounded border border-gray-700 bg-gray-900 px-3 py-2.5 text-xs leading-relaxed text-white focus:border-brand-gold"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded border border-gray-800 bg-gray-900/60 p-4">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-red-500"
          />
          <span>
            <span className="block text-xs font-bold text-gray-200">Also deliver as email letters</span>
            <span className="mt-0.5 block text-[11px] text-gray-400">
              Sends the same message as a {desk} letter to every recipient&apos;s verified address. Leave off for
              routine notices — the in-app thread and real-time notification always fire.
            </span>
          </span>
        </label>

        <div className="border-t border-gray-800 pt-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-gold">Enter Your 6-Digit Admin 2FA Authenticator Code (`TOTP`)</label>
          <input
            type="text"
            value={totpCode}
            maxLength={6}
            onChange={(e) => setTotpCode(e.target.value)}
            placeholder="6-digit authenticator code"
            className="mt-2 w-full rounded border border-brand-gold/60 bg-gray-900 px-3 py-2.5 text-center font-mono text-base font-bold tracking-[0.5em] text-white focus:border-brand-gold"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending ? 'Dispatching to audience…' : 'Dispatch Broadcast'}
        </button>
      </form>

      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 text-[11px] leading-relaxed text-gray-400">
        <strong className="text-gray-200">Operational notes:</strong> broadcasts fan out in batches of 20 with per-recipient
        isolation — one unreachable mailbox never stalls the run. Clients reply inside the generated thread; replies alert
        the owning desk in real time. The run summary (audience, counts, failures) is permanently recorded in the audit ledger.
      </div>
    </div>
  );
}
