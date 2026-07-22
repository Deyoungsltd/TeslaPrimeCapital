'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '@/config/app.config';

interface ISettledPayout {
  name: string;      // Privacy-masked beneficiary, e.g. `Jonathan D.`
  amount: string;    // NUMERIC(20,8) string
  currency: string;
  occurredAt: string; // ISO timestamp
}

const ROTATION_INTERVAL_MS = 8000;

/**
 * Settlement Ticker Toast (`PayoutTickerToast`).
 *
 * Cycles REAL recently-settled transactions (completed yield payouts and
 * withdrawals) streamed from `/api/v1/notifications/recent-payouts`. Each
 * entry rotates on an 8-second timer with a live "minutes ago" counter and
 * can be dismissed for the session. When no settlements exist yet the
 * component renders nothing — it never invents beneficiaries.
 */
export const PayoutTickerToast: React.FC = () => {
  const [payouts, setPayouts] = useState<ISettledPayout[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadSettlements = async () => {
      try {
        const res = await fetch('/api/v1/notifications/recent-payouts');
        if (res.ok) {
          const body = await res.json();
          if (isMounted && body.success && Array.isArray(body.data?.payouts)) {
            setPayouts(body.data.payouts);
          }
        }
      } catch {
        // Feed unreachable — render nothing rather than fabricate activity
      }
    };
    loadSettlements();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (payouts.length < 2 || dismissed) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % payouts.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [payouts.length, dismissed]);

  const activePayout = payouts[activeIndex];

  const formattedAmount = useMemo(() => {
    if (!activePayout) return '';
    const currency = APP_CONFIG.supportedCurrencies.find((c) => c.code === activePayout.currency);
    const numeric = parseFloat(activePayout.amount);
    const fractionDigits = currency && currency.decimals <= 2 ? 2 : 4;
    return `${currency?.symbol ?? ''}${numeric.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: fractionDigits })}`;
  }, [activePayout]);

  const minutesAgo = useMemo(() => {
    if (!activePayout) return 0;
    return Math.max(1, Math.floor((Date.now() - new Date(activePayout.occurredAt).getTime()) / 60000));
  }, [activePayout]);

  if (dismissed || payouts.length === 0 || !activePayout) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-40 w-[calc(100%-2rem)] max-w-[330px] rounded-2xl border border-emerald-500/30 bg-[#0A0F0C]/95 p-4 shadow-emerald-glow backdrop-blur-xl"
    >
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss settlement notification"
        className="absolute top-3 right-3 text-gray-500 hover:text-white transition font-extrabold text-xs"
      >
        ✕
      </button>

      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white font-sans">{activePayout.name}</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ago`}
            </span>
          </div>
          <div className="text-sm font-extrabold font-mono tracking-tight text-emerald-400">
            Just settled {formattedAmount} {activePayout.currency}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-emerald-500/15 pt-2.5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/80">
          Verified settlement
        </span>
        <a href="/register" className="font-mono text-[10px] font-extrabold uppercase tracking-[0.2em] text-white hover:text-emerald-400 transition">
          Your turn next
        </a>
      </div>
    </div>
  );
};
