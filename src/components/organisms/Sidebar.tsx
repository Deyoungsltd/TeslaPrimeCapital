'use client';

import React from 'react';
import { useSessionStore } from '@/lib/store/session.store';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, user, clearSession } = useSessionStore();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', body: JSON.stringify({ logoutAllDevices: false }) });
    } finally {
      clearSession();
      window.location.href = '/login';
    }
  };

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Invest', href: '/dashboard/investments', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Deposit', href: '/dashboard/deposit', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { label: 'Withdraw', href: '/dashboard/withdraw', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { label: 'Investments', href: '/dashboard/wallet', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    { label: 'Affiliate Referrals', href: '/dashboard/referrals', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { label: 'KYC Verification', href: '/dashboard/kyc', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { label: 'Settings', href: '/dashboard/support', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const isAdmin = user?.role && ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_MANAGER'].includes(user.role);

  if (!isSidebarOpen) return null;

  return (
    <aside aria-label="Main Terminal Navigation" className="w-64 flex-shrink-0 border-r border-[#1E2433] bg-[#080A0F] p-5 flex flex-col justify-between transition-all duration-200">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-semibold tracking-wide transition-all duration-150 ${
                isActive
                  ? 'bg-[#111520] text-white border-l-4 border-[#EF4444] font-bold shadow-sm'
                  : 'text-gray-400 hover:bg-[#111520]/60 hover:text-white border-l-4 border-transparent'
              }`}
            >
              <svg className="h-5 w-5 flex-shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </a>
          );
        })}

        {isAdmin && (
          <div className="pt-6 mt-6 border-t border-[#1E2433] space-y-1.5">
            <span className="px-4 text-[10px] font-extrabold uppercase tracking-widest text-brand-blue font-mono block">
              Executive Governance
            </span>
            <a
              href="/admin"
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                pathname?.startsWith('/admin')
                  ? 'bg-gradient-to-r from-[#EF4444]/20 to-black text-white border-l-4 border-[#EF4444]'
                  : 'text-gray-300 hover:bg-[#111520] hover:text-white border-l-4 border-transparent'
              }`}
            >
              <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Admin Portal</span>
            </a>
          </div>
        )}
      </nav>

      {/* Red [ -> Log Out ] Button at bottom of drawer (`IMG_7550` match) */}
      <div className="pt-6 border-t border-[#1E2433]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#EF4444] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#DC2626] shadow-red-glow"
        >
          <svg className="h-4 w-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
          </svg>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
