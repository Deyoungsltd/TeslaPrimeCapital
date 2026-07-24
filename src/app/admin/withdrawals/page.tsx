'use client';

import React, { useEffect, useState } from 'react';
import { authedApiFetch } from '@/lib/authed-api';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';

export default function AdminWithdrawalsQueuePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [totpCode, setTotpCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await authedApiFetch('/api/v1/admin/withdrawals/queue?page=1&limit=25');
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data?.transactions) setTransactions(body.data.transactions);
      } else {
        setTransactions([]);
        setMsg('The live treasury queue could not be loaded — refresh to retry. No queued requests are affected.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleOpenSignOff = (tx: any, act: 'APPROVE' | 'REJECT') => {
    setSelectedTx(tx);
    setAction(act);
    setTotpCode('');
    setNotes(act === 'APPROVE' ? 'Verified destination bank wire credentials & KYC tier compliance.' : 'Discrepancy intercepted in bank wire details. Returning locked balance to liquid wallet.');
    setMsg(null);
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx || !totpCode) return;
    setIsProcessing(true);
    setMsg(null);
    try {
      const res = await authedApiFetch('/api/v1/admin/withdrawals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: selectedTx.transactionId, action, totpCode, notes }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg(`Withdrawal ${selectedTx.transactionId} successfully ${action === 'APPROVE' ? 'APPROVED & Disbursed' : 'REJECTED (returned to liquid balance)'}. Notification email dispatched.`);
        fetchPending();
        setSelectedTx(null);
      } else {
        setMsg(`Error: ${data.error?.message || 'Action failed.'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-800 pb-6">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Treasury Withdrawal Approval Queue (`100% Mandatory Review`)</h1>
        <p className="mt-1 text-xs text-gray-400">Enforcing approved policy: **Every single withdrawal request must be manually verified and co-signed via Two-Factor (`TOTP`) code by an authorized `FINANCE_MANAGER` or `SUPER_ADMIN` before disbursement.**</p>
      </div>

      {msg && <div className="rounded-lg border border-blue-500/40 bg-blue-950/30 p-4 text-xs font-bold text-blue-400">{msg}</div>}

      {selectedTx && (
        <form onSubmit={handleDecisionSubmit} className="rounded-xl border border-brand-gold/50 bg-brand-card p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className={`text-base font-extrabold uppercase tracking-wider ${action === 'APPROVE' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {action === 'APPROVE' ? 'Authorize Treasury Disbursement' : 'Reject Withdrawal & Return Funds'}
            </h3>
            <button type="button" onClick={() => setSelectedTx(null)} className="text-xs font-bold text-gray-400 hover:text-white">✕ Close</button>
          </div>

          <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-800 font-mono text-xs space-y-2">
            <div><strong>Reference ID:</strong> {selectedTx.transactionId}</div>
            <div><strong>Investor:</strong> {selectedTx.user?.firstName} {selectedTx.user?.lastName} ({selectedTx.user?.email})</div>
            <div><strong>Exact Amount:</strong> <CurrencyDisplay amount={selectedTx.amount} currency={selectedTx.currency} className="text-brand-gold font-bold" /></div>
            <div><strong>Destination Bank/Crypto:</strong> {selectedTx.metadata?.destinationAddressOrBank || 'N/A'}</div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">Compliance / Treasury Review Notes</label>
            <input
              type="text"
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-white focus:border-brand-gold"
            />
          </div>

          <div className="border-t border-gray-800 pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-gold">Enter Your 6-Digit Admin 2FA Authenticator Code (`TOTP`)</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="6-digit authenticator code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className="mt-2 w-full rounded border border-brand-gold/60 bg-gray-900 px-3 py-2.5 text-center font-mono text-base font-bold tracking-[0.5em] text-white focus:border-brand-gold"
            />
          </div>

          <Button type="submit" variant={action === 'APPROVE' ? 'primary' : 'danger'} size="md" className="w-full" isLoading={isProcessing}>
            Confirm {action === 'APPROVE' ? 'Disbursement Release' : 'Rejection & Return'} &rarr;
          </Button>
        </form>
      )}

      {transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-800 bg-brand-card/40 p-16 text-center text-xs text-gray-400">
          No withdrawal requests currently waiting in the treasury queue. All ledgers settled cleanly.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-border bg-brand-card shadow-xl">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider text-gray-400 font-mono">Transaction ID</th>
                <th className="px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider text-gray-400">Investor Identity</th>
                <th className="px-4 py-3.5 text-right text-xs font-extrabold uppercase tracking-wider text-gray-400">Exact Amount</th>
                <th className="px-4 py-3.5 text-left text-xs font-extrabold uppercase tracking-wider text-gray-400">Destination Account</th>
                <th className="px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-gray-400">Verified Tier</th>
                <th className="px-4 py-3.5 text-right text-xs font-extrabold uppercase tracking-wider text-gray-400">Sign-Off Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="transition-colors hover:bg-gray-800/30">
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-gray-300">{tx.transactionId}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="text-xs font-bold text-white">{tx.user?.firstName} {tx.user?.lastName}</div>
                    <div className="text-[11px] font-mono text-gray-400">{tx.user?.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-sm font-extrabold text-brand-gold">
                    <CurrencyDisplay amount={tx.amount} currency={tx.currency} />
                  </td>
                  <td className="px-4 py-4 text-xs font-mono text-gray-300 max-w-xs truncate">{tx.metadata?.destinationAddressOrBank || 'N/A'}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-center"><Badge status={tx.user?.kycTier || 'TIER_1'} /></td>
                  <td className="whitespace-nowrap px-4 py-4 text-right space-x-2">
                    <Button variant="primary" size="sm" onClick={() => handleOpenSignOff(tx, 'APPROVE')}>Approve (`2FA`)</Button>
                    <Button variant="danger" size="sm" onClick={() => handleOpenSignOff(tx, 'REJECT')}>Reject</Button>
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
