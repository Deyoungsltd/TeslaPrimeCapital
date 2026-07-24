'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MarketingHeader } from '@/components/organisms/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/organisms/marketing/MarketingFooter';

interface IHealthReport {
  status: 'ok' | 'degraded';
  db: boolean;
  redis: boolean;
  durationMs: number;
  meta: { timestamp: string; version: string };
}

const POLL_INTERVAL_MS = 30_000;

function StatusRow(props: { label: string; detail: string; healthy: boolean | null }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#1E2433]/70 px-6 py-5 last:border-0">
      <div>
        <p className="text-[13px] font-semibold text-gray-100">{props.label}</p>
        <p className="mt-0.5 text-[11px] text-gray-500">{props.detail}</p>
      </div>
      <span
        className={`flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
          props.healthy === null
            ? 'border-gray-600/40 bg-gray-600/10 text-gray-400'
            : props.healthy
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-[#EF4444]/40 bg-[#EF4444]/10 text-red-300'
        }`}
      >
        <span
          className={`relative flex h-2 w-2 ${
            props.healthy === null
              ? 'text-gray-500'
              : props.healthy
                ? 'text-emerald-400'
                : 'text-[#EF4444]'
          }`}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
        {props.healthy === null ? 'Checking' : props.healthy ? 'Operational' : 'Degraded'}
      </span>
    </div>
  );
}

export default function PlatformStatusPage() {
  const [report, setReport] = useState<IHealthReport | null>(null);
  const [reachable, setReachable] = useState<boolean | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

  const check = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/healthz', { cache: 'no-store' });
      const body = (await res.json()) as IHealthReport;
      setReport(body);
      setReachable(true);
    } catch {
      setReport(null);
      setReachable(false);
    } finally {
      setLastCheckedAt(new Date().toISOString());
    }
  }, []);

  useEffect(() => {
    check();
    const timer = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [check]);

  const allGreen = reachable === true && report?.db === true && report?.redis === true;

  return (
    <div className="flex min-h-screen flex-col bg-[#080A0F] text-gray-200">
      <MarketingHeader activePath="/status" />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-8 sm:py-24">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#EF4444]">Infrastructure</p>
        <h1 className="mt-3 font-display text-[34px] font-semibold tracking-tight text-white sm:text-[42px]">
          Platform Status
        </h1>
        <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-gray-400">
          Live readings from the same health probes our infrastructure monitors consult every ten seconds —
          nothing is staged or cached. This page refreshes automatically every 30 seconds.
        </p>

        {/* Overall banner */}
        <div
          className={`mt-10 flex items-center gap-4 rounded-lg border px-6 py-5 ${
            allGreen
              ? 'border-emerald-500/30 bg-emerald-500/[0.06]'
              : 'border-amber-500/30 bg-amber-500/[0.06]'
          }`}
        >
          <span className={`relative flex h-3 w-3 ${allGreen ? 'text-emerald-400' : 'text-amber-400'}`}>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-current" />
          </span>
          <div>
            <p className="text-[14px] font-semibold text-white">
              {allGreen ? 'All systems operational' : 'Some systems reporting degraded telemetry'}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">
              {lastCheckedAt
                ? `Last probe ${new Date(lastCheckedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : 'Contacting probes…'}
              {report ? ` · response ${report.durationMs} ms · build ${report.meta.version}` : ''}
            </p>
          </div>
        </div>

        {/* Component rows */}
        <div className="mt-6 rounded-lg border border-[#1E2433] bg-[#111520]">
          <StatusRow
            label="Client API"
            detail="HTTPS request serving — you are reading this page through it"
            healthy={reachable}
          />
          <StatusRow
            label="Primary Ledger Database"
            detail="PostgreSQL connection pool — balances, allocations, audit trail"
            healthy={report ? report.db : null}
          />
          <StatusRow
            label="Real-Time Cache & Session Grid"
            detail="Redis — instant balances, unread badges, rate-limit and mutex fabric"
            healthy={report ? report.redis : null}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[#1E2433] bg-[#111520] p-5">
            <h2 className="text-[12px] font-semibold text-gray-200">During a degraded reading</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-gray-500">
              Your ledger entries are safe: custody operations run inside atomic database
              transactions guarded by distributed locks, so a partial outage stalls —
              never corrupts — a deposit, withdrawal, or allocation. Retry once telemetry returns green.
            </p>
          </div>
          <div className="rounded-lg border border-[#1E2433] bg-[#111520] p-5">
            <h2 className="text-[12px] font-semibold text-gray-200">Need an answer now?</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-gray-500">
              Signed-in clients can open a conversation straight with a desk officer from the{' '}
              <a href="/dashboard/support" className="font-semibold text-[#EF4444] hover:underline">
                Support Desk
              </a>{' '}
              — messages land in a permanent, auditable thread under your account.
            </p>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
