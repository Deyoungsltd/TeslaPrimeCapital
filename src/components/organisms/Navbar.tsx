'use client';

import React, { useState } from 'react';
import { useSessionStore } from '@/lib/store/session.store';
import { APP_CONFIG } from '@/config/app.config';
import { Badge } from '../atoms/Badge';
import { TeslaLogo } from '../atoms/TeslaLogo';

export const Navbar: React.FC = () => {
  const { user, toggleSidebar, clearSession } = useSessionStore();
  const [unreadCount] = useState(1);

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', body: JSON.stringify({ logoutAllDevices: false }) });
    } finally {
      clearSession();
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#1E2433] bg-[#080A0F]/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu Toggle */}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          className="rounded-lg p-2 text-gray-300 hover:bg-[#111520] hover:text-white transition"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Brand Mark Header */}
        <a href="/dashboard" className="flex items-center">
          <TeslaLogo size="sm" />
        </a>
      </div>

      <div className="flex items-center gap-4">
        {/* Unread Alert Bubble */}
        <button
          aria-label="View System Notifications"
          className="relative rounded-full p-2 text-gray-400 hover:bg-[#111520] hover:text-white transition"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-extrabold text-white shadow font-mono">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile / Status */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-[#111520] border border-[#1E2433] px-3 py-1 text-xs font-semibold text-gray-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue/30 text-[11px] font-bold text-blue-400">
                {user.firstName ? user.firstName.slice(0, 1) : 'U'}
              </span>
              <span className="hidden sm:inline-block truncate max-w-[120px]">{user.firstName} {user.lastName}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="rounded-lg bg-[#EF4444] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#DC2626] shadow-sm"
            >
              Log Out
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="rounded-lg bg-[#EF4444] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#DC2626] shadow-md"
          >
            Login
          </a>
        )}
      </div>
    </header>
  );
};
