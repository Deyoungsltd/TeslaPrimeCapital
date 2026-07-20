'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { APP_CONFIG } from '@/config/app.config';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';

export default function DepositPortalPage() {
  const [amount, setAmount] = useState('1000.00');
  const [currency, setCurrency] = useState('USD');
  const [gateway, setGateway] = useState<'STRIPE' | 'COINPAYMENTS' | 'BANK_WIRE'>('STRIPE');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/v1/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, gateway }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.data);
      } else {
        setError(data.error?.message || 'Failed to initiate deposit checkout session.');
      }
    } catch (err: any) {
      setError(err.message || 'Network exception encountered during deposit initiation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white">Initiate Multi-Gateway Deposit</h1>
        <p className="mt-1 text-xs text-gray-400">
          Enforcing approved policy: **Tier 0 Starter ($1,000 Limit without KYC)**. Top up your ledger via Stripe cards, Crypto, or Bank Wire.
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-extrabold uppercase tracking-wider">Deposit Session Created</h3>
          </div>
          <div className="space-y-2 text-xs text-gray-300 bg-gray-900/80 p-4 rounded-lg border border-gray-800 font-mono">
            <div><strong>Transaction Reference:</strong> {result.transactionId}</div>
            <div><strong>Ledger Status:</strong> {result.status}</div>
            <div><strong>Amount:</strong> <CurrencyDisplay amount={result.amount} currency={result.currency} /></div>
            <div><strong>Payment Gateway:</strong> {result.gateway}</div>
          </div>
          {result.checkoutUrl && (
            <div className="pt-2">
              <a href={`https://${result.checkoutUrl}`} target="_blank" rel="noreferrer">
                <Button variant="primary" size="md" className="w-full">Proceed to Stripe Encrypted Gateway &rarr;</Button>
              </a>
            </div>
          )}
          {result.cryptoDepositAddress && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">Deterministic Crypto Deposit Address:</span>
              <div className="rounded bg-black p-3 font-mono text-sm text-emerald-400 select-all border border-gray-800 text-center">
                {result.cryptoDepositAddress}
              </div>
              <p className="text-[11px] text-gray-400 text-center">Send exact confirmation amount. Crediting occurs automatically upon network confirmation threshold.</p>
            </div>
          )}
          <button onClick={() => setResult(null)} className="w-full text-center text-xs text-gray-400 hover:text-white pt-2 block font-semibold">
            &larr; Initiate Another Deposit
          </button>
        </div>
      ) : (
        <form onSubmit={handleDepositSubmit} className="rounded-xl border border-brand-border bg-brand-card p-6 shadow-2xl space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Select Currency Unit</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-2 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              {APP_CONFIG.supportedCurrencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name} (Min: ${c.minDeposit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Exact Deposit Amount (`NUMERIC(20,8)`)</label>
            <input
              type="text"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000.00000000"
              className="mt-2 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm font-mono text-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Select Payment Gateway</label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {(['STRIPE', 'COINPAYMENTS', 'BANK_WIRE'] as const).map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGateway(g)}
                  className={`rounded-md border p-3 text-center text-xs font-bold uppercase tracking-wider transition ${
                    gateway === g
                      ? 'border-brand-gold bg-brand-gold/15 text-brand-gold shadow'
                      : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {g.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
            Lock &amp; Generate Gateway Reference
          </Button>
        </form>
      )}
    </div>
  );
}
