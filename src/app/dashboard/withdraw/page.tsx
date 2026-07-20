'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { APP_CONFIG } from '@/config/app.config';

export default function WithdrawalPortalPage() {
  const [amount, setAmount] = useState('500.00');
  const [currency, setCurrency] = useState('USD');
  const [destination, setDestination] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/v1/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, destinationAddressOrBank: destination, totpCode }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.data);
      } else {
        setError(data.error?.message || 'Failed to submit withdrawal request.');
      }
    } catch (err: any) {
      setError(err.message || 'Network exception encountered during withdrawal request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white">Withdrawal Portal (`Mandatory Admin Review`)</h1>
        <p className="mt-1 text-xs text-gray-400">
          Enforcing approved policy: **100% Mandatory Admin Review for All Withdrawals**. Every request enters `PENDING_REVIEW` queue requiring explicit Admin inspection (`FINANCE_MANAGER`).
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-xs font-semibold text-red-400">
          {error}
        </div>
      )}

      {result ? (
        <div className="rounded-xl border border-amber-500/50 bg-brand-card p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-extrabold uppercase tracking-wider">Withdrawal Locked into Review Queue</h3>
          </div>
          <div className="space-y-2 text-xs text-gray-300 bg-gray-900/80 p-4 rounded-lg border border-gray-800 font-mono">
            <div><strong>Transaction Reference:</strong> {result.transactionId}</div>
            <div><strong>Ledger Status:</strong> {result.status} (`PENDING_REVIEW`)</div>
            <div><strong>Amount Locked:</strong> {result.amount} {result.currency}</div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed bg-amber-950/20 p-3 rounded border border-amber-800/40">
            {result.message}
          </p>
          <a href="/dashboard/wallet">
            <Button variant="primary" size="md" className="w-full mt-4">Return to Multi-Currency Ledger &rarr;</Button>
          </a>
        </div>
      ) : (
        <form onSubmit={handleWithdrawalSubmit} className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-2xl space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Select Asset Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-2 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              {APP_CONFIG.supportedCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Exact Withdrawal Amount (`NUMERIC(20,8)`)</label>
            <input
              type="text"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500.00000000"
              className="mt-2 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm font-mono text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Destination Account / Crypto Wallet Address</label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="IBAN / SWIFT or 0x71C... / bc1..."
              className="mt-2 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm font-mono text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          <div className="border-t border-gray-800 pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-gold">Mandatory 2FA Authenticator Code (`TOTP`)</label>
            <p className="text-[11px] text-gray-400 mb-2">Per security policy, Two-Factor Authentication (TOTP) confirmation is strictly required to authorize withdrawals.</p>
            <input
              type="text"
              required
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              placeholder="6-digit authenticator code"
              className="w-full rounded-md border border-brand-gold/60 bg-gray-900 px-3 py-2.5 text-sm font-mono text-center tracking-[0.5em] text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            Authorize Withdrawal &amp; Submit to Admin Queue
          </Button>
        </form>
      )}
    </div>
  );
}
