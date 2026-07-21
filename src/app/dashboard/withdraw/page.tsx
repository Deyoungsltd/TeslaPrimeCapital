'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';

export default function WithdrawalPortalPage() {
  const [walletType, setWalletType] = useState('Crypto');
  const [addressOrAccount, setAddressOrAccount] = useState('');
  const [amount, setAmount] = useState('0');
  const [totpCode, setTotpCode] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [withdrawalsList, setWithdrawalsList] = useState([
    { sn: 1, type: 'PayPal', transferTo: 'PayPal Not...', amount: '$ 0', date: 'Pending' },
    { sn: 2, type: 'Crypto', transferTo: 'BTC 0xe2f30bFef20c...', amount: '$ 0', date: 'Pending' },
    { sn: 3, type: 'Crypto', transferTo: 'BTC 0xe2f30bFef20c...', amount: '$ 0', date: 'Pending' },
    { sn: 5, type: 'Crypto', transferTo: 'USDT D7vkh7pfGBie...', amount: '$ 0', date: 'Pending' },
  ]);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) <= 0 || !addressOrAccount) {
      alert('Please enter a valid destination address and amount.');
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await fetch('/api/v1/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: `${amount}.00000000`, currency: 'USD', destinationAddressOrBank: `${walletType}: ${addressOrAccount}`, totpCode }),
      });

      setWithdrawalsList((prev) => [
        { sn: prev.length + 1, type: walletType, transferTo: `${walletType} ${addressOrAccount.slice(0, 14)}...`, amount: `$ ${parseFloat(amount).toLocaleString()}`, date: 'Pending Review' },
        ...prev,
      ]);
      setMsg(`Withdrawal of $${amount} submitted successfully! Placed inside treasury queue (` + `100% Mandatory Admin Review rule).`);
      setAmount('0');
      setAddressOrAccount('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {msg && <div className="rounded-xl border border-amber-500/50 bg-amber-950/40 p-4 text-xs font-bold text-amber-400 font-mono">{msg}</div>}

      {/* Exact Withdrawal Form Card (`IMG_7575`, `IMG_7576` match) */}
      <form onSubmit={handleWithdrawSubmit} className="rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla space-y-5">
        <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">Withdraw</h1>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1.5 font-sans">Wallet / Method</label>
          <select
            value={walletType}
            onChange={(e) => setWalletType(e.target.value)}
            className="w-full rounded-lg border border-[#2C354C] bg-[#0D0A12] px-4 py-3 text-sm font-sans text-gray-200 focus:border-red-500 focus:outline-none mb-2.5"
          >
            <option value="Crypto">Select a wallet address — Crypto (BTC / ETH / USDT)</option>
            <option value="PayPal">Select a wallet address — PayPal Account</option>
            <option value="Bank Wire">Select a wallet address — International Bank Wire</option>
          </select>

          <input
            type="text"
            required
            value={addressOrAccount}
            onChange={(e) => setAddressOrAccount(e.target.value)}
            placeholder="Enter exact crypto address or PayPal email..."
            className="w-full rounded-lg border border-[#2C354C] bg-black px-4 py-3 text-sm font-mono text-white focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1.5 font-sans">Amount</label>
          <input
            type="number"
            min="0"
            step="any"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-[#2C354C] bg-black px-4 py-3 text-sm font-mono text-white focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#EF4444] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#DC2626] shadow-red-glow"
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>

        {/* Exact Ledger Table (`S/N | Type | Transfer to | Amount` match) */}
        <div className="pt-6 border-t border-[#2A2338]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2A2338] text-left font-mono">
              <thead>
                <tr>
                  <th className="py-3 pr-4 text-xs font-bold uppercase text-gray-400 font-sans">S/N</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-gray-400 font-sans">Type</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-gray-400 font-sans">Transfer to</th>
                  <th className="py-3 pl-4 text-xs font-bold uppercase text-gray-400 font-sans">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2338]/60 text-xs">
                {withdrawalsList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#201A2C]/60 transition">
                    <td className="py-4 pr-4 font-bold text-gray-300">{row.sn}</td>
                    <td className="py-4 px-4 text-white font-medium">{row.type}</td>
                    <td className="py-4 px-4 font-mono text-gray-300 truncate max-w-[140px]">{row.transferTo}</td>
                    <td className="py-4 pl-4 font-bold text-white">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
}
