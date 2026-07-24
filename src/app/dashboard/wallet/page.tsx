'use client';

import React, { useEffect, useState } from 'react';
import { authedApiFetch } from '@/lib/authed-api';
import { WalletSummary } from '@/components/organisms/WalletSummary';
import { DataTable } from '@/components/organisms/DataTable';

export default function MultiCurrencyWalletPage() {
  const [balances, setBalances] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statementState, setStatementState] = useState<'idle' | 'generating' | 'error'>('idle');

  const handleDownloadStatement = async () => {
    if (statementState === 'generating') return;
    setStatementState('generating');
    try {
      const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const to = new Date().toISOString().slice(0, 10);
      const res = await authedApiFetch(`/api/v1/reporting/export/statement.pdf?from=${from}&to=${to}`);
      if (!res.ok) throw new Error('statement_unavailable');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `teslaprime_statement_${to}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      setStatementState('idle');
    } catch {
      setStatementState('error');
    }
  };

  useEffect(() => {
    const fetchWalletData = async () => {
      setLoading(true);
      try {
        const [balRes, txRes] = await Promise.all([
          authedApiFetch('/api/v1/wallet/balances'),
          authedApiFetch(`/api/v1/wallet/transactions?page=${currentPage}&limit=15`),
        ]);

        if (balRes.ok) {
          const balData = await balRes.json();
          if (balData.success && balData.data) setBalances(balData.data);
        }

        if (txRes.ok) {
          const txData = await txRes.json();
          if (txData.success && txData.data) {
            setAllTransactions(txData.data);
            setTotalCount(txData.meta?.pagination?.totalCount || txData.data.length);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-brand-gold" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-xs font-mono uppercase tracking-wider text-gray-400">Loading Exact Double-Entry Ledger Balances...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-800 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
            Multi-Currency Wealth Ledger (`Wallets`)
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Segregated sub-balances for fiat (`USD`, `EUR`, `GBP`, `JPY`) and crypto (`BTC`, `ETH`, `USDT`, `USDC`) assets.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownloadStatement}
            disabled={statementState === 'generating'}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:opacity-90 shadow-lg disabled:opacity-50"
          >
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            {statementState === 'generating' ? 'Generating PDF…' : statementState === 'error' ? 'Retry Statement' : 'Statement (PDF)'}
          </button>
          <a href="/dashboard/deposit">
            <button className="rounded-md bg-brand-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-brand-goldHover shadow-lg">
              + Initiate Deposit
            </button>
          </a>
          <a href="/dashboard/withdraw">
            <button className="rounded-md border border-gray-700 bg-brand-card px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-200 transition hover:bg-gray-800 shadow-sm">
              Withdraw Funds
            </button>
          </a>
        </div>
      </div>

      {/* Main Segregated Balances Card */}
      <WalletSummary balances={balances} />

      {/* Complete Ledger Accounting Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-wider text-white">
              Complete Double-Entry Ledger History
            </h2>
            <p className="text-xs text-gray-400">
              Every deposit, withdrawal, investment lock, and commission is immutably linked with exact `NUMERIC(20,8)` precision.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded border border-gray-700 bg-gray-800 px-3 py-1 text-gray-300 disabled:opacity-50"
            >
              &larr; Prev
            </button>
            <span className="rounded bg-gray-900 px-3 py-1 font-mono font-bold text-brand-gold border border-gray-800">
              Page {currentPage}
            </span>
            <button
              disabled={currentPage * 15 >= totalCount}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="rounded border border-gray-700 bg-gray-800 px-3 py-1 text-gray-300 disabled:opacity-50"
            >
              Next &rarr;
            </button>
          </div>
        </div>

        <DataTable transactions={allTransactions} totalCount={totalCount} />
      </section>
    </div>
  );
}
