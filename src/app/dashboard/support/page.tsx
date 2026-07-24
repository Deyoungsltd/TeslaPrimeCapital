'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSessionStore } from '@/lib/store/session.store';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type TicketCategory = 'GENERAL' | 'DEPOSIT_WITHDRAWAL' | 'INVESTMENT_PLAN' | 'KYC_VERIFICATION' | 'SECURITY_2FA';
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';

interface IThreadMessage {
  messageId: string;
  sender: 'DESK' | 'CLIENT';
  body: string;
  sentAt: string;
}

interface IThread {
  threadId: string;
  ticketNumber: string;
  subject: string;
  category: TicketCategory;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: TicketStatus;
  assignedAgent: { name: string; role: string } | null;
  messages: IThreadMessage[];
  lastActivityAt: string;
  openedAt: string;
}

/* ------------------------------------------------------------------ */
/* Presentation constants                                              */
/* ------------------------------------------------------------------ */

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  GENERAL: 'General',
  DEPOSIT_WITHDRAWAL: 'Deposits & Withdrawals',
  INVESTMENT_PLAN: 'Investment Plans',
  KYC_VERIFICATION: 'KYC Verification',
  SECURITY_2FA: 'Security & 2FA',
};

const DESK_LABELS: Record<TicketCategory, string> = {
  GENERAL: 'Client Services Desk',
  DEPOSIT_WITHDRAWAL: 'Treasury Desk',
  INVESTMENT_PLAN: 'Portfolio Desk',
  KYC_VERIFICATION: 'Compliance Desk',
  SECURITY_2FA: 'Security Desk',
};

const STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  WAITING_FOR_USER: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  RESOLVED: 'bg-gray-500/10 text-gray-300 border-gray-500/30',
  CLOSED: 'bg-gray-600/10 text-gray-400 border-gray-600/30',
};

const DESK_ICON_PATH =
  'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SupportDeskPage() {
  const { accessToken } = useSessionStore();

  const [threads, setThreads] = useState<IThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [composer, setComposer] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; body: string } | null>(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState<{ category: TicketCategory; subject: string; message: string }>({
    category: 'GENERAL',
    subject: '',
    message: '',
  });
  const messageEndRef = useRef<HTMLDivElement>(null);

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

  const loadThreads = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await authedFetch('/api/v1/support/threads');
      const body = await res.json();
      if (res.ok && body.success && body.data) {
        const list: IThread[] = body.data.threads ?? [];
        setThreads(list);
        setActiveThreadId((prev) => (prev && list.some((t) => t.threadId === prev) ? prev : list[0]?.threadId ?? null));
        setNotice(null);
      } else {
        setNotice({ kind: 'error', body: body?.error?.message ?? 'The Support Desk could not be reached. Please retry.' });
      }
    } catch {
      setNotice({ kind: 'error', body: 'Network interruption while contacting the Support Desk. Please retry.' });
    } finally {
      setLoading(false);
    }
  }, [authedFetch, accessToken]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const activeThread = useMemo(
    () => threads.find((t) => t.threadId === activeThreadId) ?? null,
    [threads, activeThreadId],
  );

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeThread?.messages.length, activeThreadId]);

  /* --------------------------- actions ---------------------------- */

  const handleReply = async () => {
    const body = composer.trim();
    if (!activeThreadId || body.length < 2 || sending) return;
    setSending(true);
    setNotice(null);
    try {
      const res = await authedFetch('/api/v1/support/reply', {
        method: 'POST',
        body: JSON.stringify({ threadId: activeThreadId, message: body }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        setNotice({ kind: 'error', body: payload?.error?.message ?? 'Your reply could not be delivered. Please retry.' });
        return;
      }
      setComposer('');
      setNotice({ kind: 'success', body: 'Message delivered to the desk. An officer replies directly in this thread.' });
      await loadThreads();
    } catch {
      setNotice({ kind: 'error', body: 'Network interruption while sending. Please retry.' });
    } finally {
      setSending(false);
    }
  };

  const handleOpenThread = async () => {
    const subject = newThread.subject.trim();
    const message = newThread.message.trim();
    if (subject.length < 4 || message.length < 2 || sending) return;
    setSending(true);
    setNotice(null);
    try {
      const res = await authedFetch('/api/v1/support/threads', {
        method: 'POST',
        body: JSON.stringify({ category: newThread.category, subject, message }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        setNotice({ kind: 'error', body: payload?.error?.message ?? 'The conversation could not be opened. Please retry.' });
        return;
      }
      setShowNewThread(false);
      setNewThread({ category: 'GENERAL', subject: '', message: '' });
      setNotice({ kind: 'success', body: `Conversation ${payload.data.ticketNumber} opened with the desk.` });
      await loadThreads();
    } catch {
      setNotice({ kind: 'error', body: 'Network interruption while opening the conversation. Please retry.' });
    } finally {
      setSending(false);
    }
  };

  /* ---------------------------- render ----------------------------- */

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <svg className="h-[18px] w-[18px] text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={DESK_ICON_PATH} />
            </svg>
            <h1 className="font-display text-[22px] font-semibold tracking-tight text-white">Support Desk</h1>
          </div>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-gray-400">
            Every governance decision — KYC verdicts, deposit confirmations, withdrawal disbursements —
            arrives here as a signed message from the responsible desk officer. Reply directly inside the thread.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewThread((v) => !v)}
          className="rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          {showNewThread ? 'Cancel' : 'New Conversation'}
        </button>
      </div>

      {/* Notice banner */}
      {notice && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-[13px] ${
            notice.kind === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-[#EF4444]/30 bg-[#EF4444]/10 text-red-200'
          }`}
        >
          {notice.body}
        </div>
      )}

      {/* New conversation composer */}
      {showNewThread && (
        <div className="rounded-lg border border-[#1E2433] bg-[#111520] p-5">
          <h2 className="text-sm font-semibold text-gray-200">Open a conversation with the desk</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">Desk</span>
              <select
                value={newThread.category}
                onChange={(e) => setNewThread((v) => ({ ...v, category: e.target.value as TicketCategory }))}
                className="w-full rounded-lg border border-[#2C354C] bg-[#080A0F] px-3 py-2.5 text-[13px] text-gray-200 outline-none focus:border-[#EF4444]"
              >
                {(Object.keys(CATEGORY_LABELS) as TicketCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {DESK_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">Subject</span>
              <input
                value={newThread.subject}
                onChange={(e) => setNewThread((v) => ({ ...v, subject: e.target.value }))}
                maxLength={120}
                placeholder="e.g. Question about my withdrawal reference"
                className="w-full rounded-lg border border-[#2C354C] bg-[#080A0F] px-3 py-2.5 text-[13px] text-gray-200 outline-none placeholder:text-gray-600 focus:border-[#EF4444]"
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">Message</span>
            <textarea
              value={newThread.message}
              onChange={(e) => setNewThread((v) => ({ ...v, message: e.target.value }))}
              rows={4}
              maxLength={1200}
              placeholder="Write your message for the desk officer…"
              className="w-full rounded-lg border border-[#2C354C] bg-[#080A0F] px-3 py-2.5 text-[13px] leading-relaxed text-gray-200 outline-none placeholder:text-gray-600 focus:border-[#EF4444]"
            />
          </label>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              disabled={sending || newThread.subject.trim().length < 4 || newThread.message.trim().length < 2}
              onClick={handleOpenThread}
              className="rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? 'Opening…' : 'Open Conversation'}
            </button>
          </div>
        </div>
      )}

      {/* Main desk panel */}
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Thread list */}
        <div className="rounded-lg border border-[#1E2433] bg-[#111520]">
          <div className="border-b border-[#1E2433] px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">Conversations</span>
          </div>
          {loading ? (
            <div className="space-y-3 p-4" aria-label="Loading conversations">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-[#080A0F]" />
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="p-5 text-center">
              <p className="text-[13px] text-gray-400">No conversations yet.</p>
              <p className="mt-1 text-[12px] text-gray-600">
                Desk decisions will appear here automatically — or open a conversation above.
              </p>
            </div>
          ) : (
            <ul className="max-h-[480px] divide-y divide-[#1E2433] overflow-y-auto">
              {threads.map((t) => {
                const last = t.messages[t.messages.length - 1];
                const isActive = t.threadId === activeThreadId;
                return (
                  <li key={t.threadId}>
                    <button
                      type="button"
                      onClick={() => setActiveThreadId(t.threadId)}
                      className={`block w-full px-4 py-3 text-left transition-colors ${
                        isActive ? 'bg-[#080A0F] ring-1 ring-inset ring-[#EF4444]/40' : 'hover:bg-[#080A0F]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-semibold text-gray-200">{t.subject}</span>
                        <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[t.status]}`}>
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[12px] text-gray-500">
                        {last ? last.body : 'No messages yet'}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-600">
                        <span>{DESK_LABELS[t.category]}</span>
                        <span>{formatTime(t.lastActivityAt)}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Active conversation */}
        <div className="flex min-h-[480px] flex-col rounded-lg border border-[#1E2433] bg-[#111520]">
          {!activeThread ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <svg className="h-8 w-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={DESK_ICON_PATH} />
              </svg>
              <p className="mt-3 text-[13px] text-gray-400">Select a conversation to read the desk&apos;s messages.</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2433] px-5 py-4">
                <div>
                  <h2 className="text-[14px] font-semibold text-gray-100">{activeThread.subject}</h2>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-gray-500">
                    {DESK_LABELS[activeThread.category]}
                    {activeThread.assignedAgent ? ` · Officer ${activeThread.assignedAgent.name}` : ''} · {activeThread.ticketNumber}
                  </p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLES[activeThread.status]}`}>
                  {activeThread.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5" style={{ maxHeight: '56vh' }}>
                {activeThread.messages.length === 0 ? (
                  <p className="text-center text-[13px] text-gray-500">This conversation is queued for a desk officer.</p>
                ) : (
                  activeThread.messages.map((m) =>
                    m.sender === 'DESK' ? (
                      <div key={m.messageId} className="flex justify-start">
                        <div className="max-w-[85%] rounded-lg border border-[#1E2433] border-l-2 border-l-[#EF4444] bg-[#080A0F] px-4 py-3">
                          <div className="mb-1 flex items-center gap-2">
                            <svg className="h-[18px] w-[18px] text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#EF4444]">
                              {DESK_LABELS[activeThread.category]}
                            </span>
                          </div>
                          <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-200">{m.body}</p>
                          <p className="mt-2 text-[10px] uppercase tracking-wider text-gray-600">{formatTime(m.sentAt)}</p>
                        </div>
                      </div>
                    ) : (
                      <div key={m.messageId} className="flex justify-end">
                        <div className="max-w-[85%] rounded-lg border border-[#2C354C] bg-[#141A28] px-4 py-3">
                          <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-100">{m.body}</p>
                          <p className="mt-2 text-right text-[10px] uppercase tracking-wider text-gray-600">
                            You · {formatTime(m.sentAt)}
                          </p>
                        </div>
                      </div>
                    ),
                  )
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Composer */}
              <div className="border-t border-[#1E2433] px-5 py-4">
                <div className="flex items-end gap-3">
                  <textarea
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    rows={2}
                    maxLength={1200}
                    placeholder={`Reply to the ${DESK_LABELS[activeThread.category].toLowerCase()}…`}
                    className="min-h-[52px] flex-1 resize-none rounded-lg border border-[#2C354C] bg-[#080A0F] px-3 py-2.5 text-[13px] leading-relaxed text-gray-100 outline-none placeholder:text-gray-600 focus:border-[#EF4444]"
                  />
                  <button
                    type="button"
                    disabled={sending || composer.trim().length < 2}
                    onClick={handleReply}
                    className="rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending ? 'Sending…' : 'Send'}
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-gray-600">
                  Messages are permanently recorded under ticket {activeThread.ticketNumber} for audit and dispute resolution.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
