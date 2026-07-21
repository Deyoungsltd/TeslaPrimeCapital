'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { APP_CONFIG } from '@/config/app.config';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';

export default function ExchangePortalPage() {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BTC');
  const [amount, setAmount] = useState('1000.00');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/v1/wallet/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromCurrency, toCurrency, amount }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.data);
      } else {
        setError(data.error?.message || 'Failed to execute multi-currency exchange.');
      }
    } catch (err: any) {
      setError(err.message || 'Network exception encountered during exchange.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white">Instant Multi-Currency Exchange</h1>
        <p className="mt-1 text-xs text-gray-400">
          Convert between fiat (`USD`, `EUR`) and digital assets (`BTC`, `ETH`, `USDT`) with exact double-entry ledger settlement (`NUMERIC(20,8)`).
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-xs font-semibold text-red-400">
          {error}
        </div>
      )}

      {result ? (
        <div className="rounded-xl border border-emerald-500/50 bg-brand-card p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3 text-emerald-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-lg font-extrabold uppercase tracking-wider">Exchange Settled Cleanly</h3>
          </div>
          <div className="space-y-2 text-xs text-gray-300 bg-gray-900/80 p-4 rounded-lg border border-gray-800 font-mono">
            <div><strong>Reference ID:</strong> {result.transactionId}</div>
            <div><strong>Debited:</strong> <CurrencyDisplay amount={result.fromAmount} currency={result.fromCurrency} /></div>
            <div><strong>Credited:</strong> <CurrencyDisplay amount={result.toAmount} currency={result.toCurrency} className="text-emerald-400" /></div>
            <div><strong>Execution Rate:</strong> {result.exchangeRate} (Spread fee included)</div>
          </div>
          <a href="/dashboard/wallet">
            <Button variant="primary" size="md" className="w-full mt-4">Return to Multi-Currency Ledger &rarr;</Button>
          </a>
        </div>
      ) : (
        <form onSubmit={handleExchangeSubmit} className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-2xl space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">From Currency</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
              >
                {APP_CONFIG.supportedCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">To Currency</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
              >
                {APP_CONFIG.supportedCurrencies.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Source Amount (`NUMERIC(20,8)`)</label>
            <input
              type="text"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000.00"
              className="mt-2 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm font-mono text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            Execute Exact Fixed-Point Exchange
          </Button>
        </form>
      )}
    </div>
  );
}
