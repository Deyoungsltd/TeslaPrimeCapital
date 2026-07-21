'use client';

import React, { useState } from 'react';
import { useSessionStore } from '@/lib/store/session.store';
import { APP_CONFIG } from '@/config/app.config';
import { Badge } from '../atoms/Badge';

export const Navbar: React.FC = () => {
  const { user, toggleSidebar, clearSession } = useSessionStore();
  const [unreadCount] = useState(2);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', body: JSON.stringify({ logoutAllDevices: false }) });
    } finally {
      clearSession();
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-white/10 bg-black/90 px-6 backdrop-blur-xl transition-all">
      <div className="flex items-center gap-5">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          className="rounded-lg border border-white/10 bg-[#14141c] p-2.5 text-gray-300 hover:border-brand-blue hover:text-white transition"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <a href="/dashboard" className="flex items-center gap-3">
          <span className="text-xl font-extrabold tracking-tight text-white uppercase sm:text-2xl font-sans bg-gradient-to-r from-white via-gray-200 to-brand-blue bg-clip-text text-transparent">
            {APP_CONFIG.platformName}
          </span>
          <span className="hidden sm:inline-block rounded-full border border-brand-blue/60 bg-brand-blue/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-blue-glow font-mono">
            Terminal access v2.0
          </span>
        </a>
      </div>

      <div className="flex items-center gap-5">
        {/* Live Market Ticker Pill */}
        <div className="hidden xl:flex items-center gap-4 rounded-full border border-white/10 bg-[#14141c] px-4 py-1.5 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            BTC $64,516.12
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-brand-blue font-bold">ETH $3,508.77</span>
          <span className="text-gray-600">|</span>
          <span className="text-white font-bold">EUR €1.087</span>
        </div>

        <button
          aria-label="View System Notifications"
          className="relative rounded-xl border border-white/10 bg-[#14141c] p-2.5 text-gray-300 hover:border-brand-blue hover:text-white transition"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[10px] font-extrabold text-white shadow-blue-glow font-mono">
              {unreadCount}
            </span>
          )}
        </button>

        {user ? (
          <div className="flex items-center gap-4 border-l border-white/10 pl-4">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-bold text-white tracking-wide">{user.firstName} {user.lastName}</div>
              <div className="text-[10px] text-gray-400 font-mono truncate max-w-[140px]">{user.email}</div>
            </div>
            <Badge status={user.kycTier} />
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/20 bg-brand-rose/20 px-3.5 py-2 text-xs font-bold text-rose-300 transition hover:bg-brand-rose hover:text-white"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="rounded-lg bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-gray-200 shadow-md"
          >
            Authenticate
          </a>
        )}
      </div>
    </header>
  );
};
