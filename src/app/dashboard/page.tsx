'use client';

import React, { useEffect, useState } from 'react';
import { useSessionStore } from '@/lib/store/session.store';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';

export default function DashboardOverviewPage() {
  const { user } = useSessionStore();
  const [balances, setBalances] = useState<any[]>([]);
  const [activeCount, setActiveCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(true);

  useEffect(() => {
    const fetchTerminalData = async () => {
      try {
        const balRes = await fetch('/api/v1/wallet/balances');
        if (balRes.ok) {
          const balData = await balRes.json();
          if (balData.success && balData.data) setBalances(balData.data);
        } else {
          setBalances([
            { id: '1', currency: 'USD', availableBalance: '150000.00000000', lockedBalance: '100000.00000000', totalDeposited: '280000.00000000', totalWithdrawn: '415000.00000000' },
          ]);
        }
      } catch {
        // Fallback for clean offline simulation
        setBalances([
          { id: '1', currency: 'USD', availableBalance: '150000.00000000', lockedBalance: '100000.00000000', totalDeposited: '280000.00000000', totalWithdrawn: '415000.00000000' },
        ]);
      }
    };
    fetchTerminalData();
  }, []);

  const usdWallet = balances.find((b) => b.currency === 'USD') || balances[0] || {
    availableBalance: '150000.00000000',
    lockedBalance: '100000.00000000',
    totalDeposited: '280000.00000000',
    totalWithdrawn: '415000.00000000',
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText('https://teslaequitypro.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Live Notification Popup/Card (`Chen Singapore Just received $55,000!` IMG_7553 match) */}
      {showNotificationToast && (
        <div className="mx-auto max-w-sm rounded-2xl bg-[#10B981] p-4 text-white shadow-emerald-glow relative animate-pulse-slow">
          <button
            onClick={() => setShowNotificationToast(false)}
            className="absolute top-3 right-3 text-black/60 hover:text-black font-extrabold text-sm"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-yellow-300 font-bold text-lg">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-extrabold text-black">
                <span>Chen 🇸🇬</span>
                <span className="text-[11px] font-medium text-black/80 font-mono">📍 Singapore</span>
              </div>
              <div className="text-base font-extrabold text-white tracking-tight font-mono">
                Just received $55,000!
              </div>
              <div className="text-[10px] font-mono text-black/70">🕒 12 minutes ago</div>
            </div>
          </div>
          <div className="mt-3 border-t border-black/15 pt-2 text-center text-xs font-bold text-black tracking-wide font-mono">
            $ You could be next!
          </div>
        </div>
      )}

      {/* Exact 4 Stat Cards Grid (`IMG_7552` match) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Account Balance */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Account Balance</span>
            <span className="text-gray-400 font-mono text-base">↗</span>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-white tracking-tight font-mono">
            <CurrencyDisplay amount={usdWallet.availableBalance} currency="USD" />
          </div>
        </div>

        {/* Card 2: Active Investments */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Active Investments</span>
            <span className="text-gray-400 font-mono text-base">↗</span>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-white tracking-tight font-mono">
            <CurrencyDisplay amount={usdWallet.lockedBalance} currency="USD" />
          </div>
          <div className="mt-2 text-xs font-bold text-gray-400 font-mono">
            Profits: <span className="text-emerald-400 font-extrabold">+$89,500</span>
          </div>
        </div>

        {/* Card 3: Withdrawals */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Withdrawals</span>
            <span className="text-gray-400 font-mono text-base">🛡</span>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-white tracking-tight font-mono">
            <CurrencyDisplay amount={usdWallet.totalWithdrawn} currency="USD" />
          </div>
          <div className="mt-2 text-xs font-bold text-gray-400 font-mono">
            Deposits: <span className="text-white font-extrabold">${parseFloat(usdWallet.totalDeposited).toLocaleString()}</span>
          </div>
        </div>

        {/* Card 4: Referrals */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Referrals</span>
            <span className="text-gray-400 font-mono text-base">🛡</span>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-white tracking-tight font-mono">
            $0
          </div>
          <div className="mt-2 text-xs font-bold text-gray-400 font-mono">
            Referrals: <span className="text-white font-extrabold">0</span>
          </div>
        </div>
      </div>

      {/* Referral Link Box (`IMG_7556` exact match) */}
      <div className="rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla max-w-2xl">
        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 font-sans">
          Referral Link
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value="https://teslaequitypro.com"
            className="w-full rounded-lg border border-[#2C354C] bg-black px-4 py-3 text-sm font-mono text-white select-all focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="flex-shrink-0 rounded-lg border border-[#2C354C] bg-[#161B29] p-3 text-gray-300 hover:border-white hover:text-white transition shadow-sm"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </div>

      {/* Embedded TradingView Stock Chart (`T NASDAQ:TSLA` IMG_7556 / IMG_7557 match) */}
      <div className="rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A2338] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EF4444] text-white font-extrabold font-mono text-base">
              T
            </span>
            <div>
              <span className="text-base font-extrabold text-white font-mono tracking-wide">NASDAQ:TSLA</span>
              <span className="ml-2 text-xs font-mono font-bold text-rose-400">430.60 (-2.05% / -9.02)</span>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">TradingView Real-Time Feed</span>
        </div>

        {/* Live TradingView Widget Embed */}
        <div className="h-[450px] w-full rounded-xl overflow-hidden border border-[#2A2338] bg-black">
          <iframe
            src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_tsla&symbol=NASDAQ%3ATSLA&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=teslaequitypro.com&utm_medium=widget&utm_campaign=chart&utm_term=NASDAQ%3ATSLA"
            style={{ width: '100%', height: '100%', border: '0' }}
            allowFullScreen
            title="TradingView NASDAQ:TSLA Real-Time Stock Chart"
          />
        </div>
      </div>
    </div>
  );
}
