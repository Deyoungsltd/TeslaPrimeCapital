'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';

export default function DepositPortalPage() {
  const [walletType, setWalletType] = useState('BTC');
  const [amount, setAmount] = useState('0');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const walletAddresses: Record<string, string> = {
    BTC: 'bc1qqgkafu3y20a8wdfx5l74kpn8kld3z45v6z789q',
    ETH: '0x71C8823901823901823018230182301823998877',
    USDT: 'TU571H890a8wdfx5l74kpn8kld3z45v6z789q0011',
    SOLANA: 'D7vkh7pfGBiehrhyzUdYBm3y20a8wdfx5l74kpn8kl',
  };

  const currentAddress = walletAddresses[walletType] || walletAddresses.BTC;

  const [depositsList, setDepositsList] = useState([
    { sn: 1, wallet: 'BTC bc1qqgkafu...', amount: '$ 278,000', transac: 'TU571H8' },
    { sn: 2, wallet: 'BTC bc1qqgkafu...', amount: '$ 300,000', transac: 'Thais78l' },
    { sn: 3, wallet: 'SOLANA D7vkh7pfG...', amount: '$ 1,000', transac: 'BTC' },
  ]);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(currentAddress);
      alert('Copied wallet address to clipboard!');
    } catch {}
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) <= 0 || !txHash) {
      alert('Please enter a valid deposit amount and transaction hash.');
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await fetch('/api/v1/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: `${amount}.00000000`, currency: walletType === 'SOLANA' ? 'USDT' : walletType, gateway: 'COINPAYMENTS' }),
      });

      setDepositsList((prev) => [
        { sn: prev.length + 1, wallet: `${walletType} ${currentAddress.slice(0, 10)}...`, amount: `$ ${parseFloat(amount).toLocaleString()}`, transac: txHash.slice(0, 8) },
        ...prev,
      ]);
      setMsg(`Deposit of $${amount} submitted successfully! Placed in verification queue (` + `status: PENDING_REVIEW).`);
      setAmount('0');
      setTxHash('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {msg && <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-400 font-mono">{msg}</div>}

      {/* Exact Deposit Form Card (`IMG_7569`, `IMG_7570`, `IMG_7571` match) */}
      <form onSubmit={handleDepositSubmit} className="rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla space-y-5">
        <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">Deposit</h1>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1.5 font-sans">Wallet</label>
          <select
            value={walletType}
            onChange={(e) => setWalletType(e.target.value)}
            className="w-full rounded-lg border border-[#2C354C] bg-[#0D0A12] px-4 py-3 text-sm font-sans text-gray-200 focus:border-red-500 focus:outline-none mb-2.5"
          >
            <option value="BTC">Select a wallet address — Bitcoin (BTC)</option>
            <option value="ETH">Select a wallet address — Ethereum (ETH)</option>
            <option value="USDT">Select a wallet address — Tether (USDT)</option>
            <option value="SOLANA">Select a wallet address — Solana (SOL)</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentAddress}
              className="w-full rounded-lg border border-[#2C354C] bg-black px-4 py-3 text-xs font-mono text-gray-300 select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="flex-shrink-0 rounded-lg border border-[#2C354C] bg-[#201A2C] px-3.5 py-3 text-gray-300 hover:border-white hover:text-white transition shadow-sm"
              title="Copy Address"
            >
              📋
            </button>
          </div>
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
          <label className="block text-xs font-bold text-gray-300 mb-1.5 font-sans">Transaction Hash</label>
          <input
            type="text"
            required
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="Enter exact payment reference or hash..."
            className="w-full rounded-lg border border-[#2C354C] bg-black px-4 py-3 text-sm font-mono text-white focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[#EF4444] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#DC2626] shadow-red-glow"
          >
            {loading ? 'Processing...' : 'Deposit'}
          </button>
        </div>

        {/* Exact Ledger Table (`S/N | Wallet | Amount | Transac` match) */}
        <div className="pt-6 border-t border-[#2A2338]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2A2338] text-left font-mono">
              <thead>
                <tr>
                  <th className="py-3 pr-4 text-xs font-bold uppercase text-gray-400 font-sans">S/N</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-gray-400 font-sans">Wallet</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-gray-400 font-sans">Amount</th>
                  <th className="py-3 pl-4 text-xs font-bold uppercase text-gray-400 font-sans">Transac</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2338]/60 text-xs">
                {depositsList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#201A2C]/60 transition">
                    <td className="py-4 pr-4 font-bold text-gray-300">{row.sn}</td>
                    <td className="py-4 px-4 text-white font-medium">{row.wallet}</td>
                    <td className="py-4 px-4 font-bold text-white">{row.amount}</td>
                    <td className="py-4 pl-4 text-gray-400">{row.transac}</td>
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
