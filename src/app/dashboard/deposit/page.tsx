'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';
import { QrCodeImage } from '@/components/atoms/QrCodeImage';
import { authedApiFetch } from '@/lib/authed-api';

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

  const [copiedAt, setCopiedAt] = useState<number | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentAddress);
      setCopiedAt(Date.now());
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
      await authedApiFetch('/api/v1/wallet/deposit', {
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
      <form onSubmit={handleDepositSubmit} className="rounded-2xl border border-[#1E2433] bg-[#111520] p-6 shadow-tesla space-y-5">
        <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">Deposit</h1>

        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1.5 font-sans">Wallet</label>
          <select
            value={walletType}
            onChange={(e) => setWalletType(e.target.value)}
            className="w-full rounded-lg border border-[#2C354C] bg-[#080A0F] px-4 py-3 text-sm font-sans text-gray-200 focus:border-red-500 focus:outline-none mb-2.5"
          >
            <option value="BTC">Select a wallet address — Bitcoin (BTC)</option>
            <option value="ETH">Select a wallet address — Ethereum (ETH)</option>
            <option value="USDT">Select a wallet address — Tether (USDT)</option>
            <option value="SOLANA">Select a wallet address — Solana (SOL)</option>
          </select>

          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-2">
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
                  className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-lg border border-[#2C354C] bg-[#181D2D] text-gray-300 transition hover:border-white hover:text-white"
                  title="Copy Address"
                  aria-label="Copy treasury address to clipboard"
                >
                  {copiedAt && Date.now() - copiedAt < 2500 ? (
                    <svg className="h-[18px] w-[18px] text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="9" y="9" width="12" height="12" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-500">
                Send only <span className="font-semibold text-gray-300">{walletType === 'SOLANA' ? 'SOL' : walletType}</span> to this address.
                Assets sent on the wrong network cannot be recovered by the treasury.
              </p>
            </div>
            <div className="hidden flex-col items-center gap-1.5 sm:flex">
              <QrCodeImage text={currentAddress} size={104} label={`${walletType} treasury deposit address as QR code`} />
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gray-600">Scan to send</span>
            </div>
          </div>
          <div className="mt-3 flex flex-col items-start gap-1.5 sm:hidden">
            <QrCodeImage text={currentAddress} size={104} label={`${walletType} treasury deposit address as QR code`} />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gray-600">Scan to send</span>
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
        <div className="pt-6 border-t border-[#1E2433]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#1E2433] text-left font-mono">
              <thead>
                <tr>
                  <th className="py-3 pr-4 text-xs font-bold uppercase text-gray-400 font-sans">S/N</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-gray-400 font-sans">Wallet</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-gray-400 font-sans">Amount</th>
                  <th className="py-3 pl-4 text-xs font-bold uppercase text-gray-400 font-sans">Transac</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2433]/60 text-xs">
                {depositsList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#181D2D]/60 transition">
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
