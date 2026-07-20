'use client';

import React, { useState } from 'react';
import { useSessionStore } from '@/lib/store/session.store';
import { APP_CONFIG } from '@/config/app.config';
import { Badge } from '../atoms/Badge';

export const Navbar: React.FC = () => {
  const { user, toggleSidebar, clearSession } = useSessionStore();
  const [unreadCount] = useState(2); // Initial simulated alert count until live SSE stream binds

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', body: JSON.stringify({ logoutAllDevices: false }) });
    } finally {
      clearSession();
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-brand-border bg-brand-dark/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <a href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight text-white uppercase sm:text-xl">
            {APP_CONFIG.platformName}
          </span>
          <span className="hidden sm:inline-block rounded border border-brand-gold/40 bg-brand-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-gold">
            Terminal
          </span>
        </a>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell Dropdown Button */}
        <button
          aria-label="View System Notifications"
          className="relative rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-black shadow">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Status Pill & Logout CTA */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <div className="text-xs font-bold text-white">{user.firstName} {user.lastName}</div>
              <div className="text-[10px] text-gray-400">{user.email}</div>
            </div>
            <Badge status={user.kycTier} />
            <button
              onClick={handleLogout}
              className="rounded-md border border-gray-700 bg-gray-800/80 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-red-500/50 hover:bg-red-950/30 hover:text-red-400"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="rounded-md bg-brand-gold px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-brand-goldHover"
          >
            Authenticate
          </a>
        )}
      </div>
    </header>
  );
};
