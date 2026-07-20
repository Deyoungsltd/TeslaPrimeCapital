'use client';

import React from 'react';
import { useSessionStore } from '@/lib/store/session.store';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, user } = useSessionStore();
  const pathname = usePathname();

  const navItems = [
    { label: 'Terminal Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Multi-Currency Wallet', href: '/dashboard/wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { label: 'Structured Portfolios', href: '/dashboard/investments', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { label: 'Initiate Deposit', href: '/dashboard/deposit', icon: 'M12 4v16m8-8H4' },
    { label: 'Withdrawal Portal', href: '/dashboard/withdraw', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
    { label: 'Affiliate Commissions', href: '/dashboard/referrals', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { label: 'KYC & Compliance', href: '/dashboard/kyc', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { label: 'Support Terminal', href: '/dashboard/support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
  ];

  const isAdmin = user?.role && ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_MANAGER'].includes(user.role);

  if (!isSidebarOpen) return null;

  return (
    <aside aria-label="Main Terminal Navigation" className="w-64 flex-shrink-0 border-r border-brand-border bg-black/90 p-4 transition-all duration-200">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 ${
                isActive
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-gray-400 hover:bg-[#18181b] hover:text-white'
              }`}
            >
              <svg className="h-4 w-4 flex-shrink-0 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </a>
          );
        })}

        {isAdmin && (
          <div className="pt-6 mt-6 border-t border-[#18181b]">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-brand-blue">
              Executive Governance
            </span>
            <a
              href="/admin"
              className={`mt-2 flex items-center gap-3 rounded-md px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                pathname?.startsWith('/admin')
                  ? 'bg-brand-blue text-white shadow-md'
                  : 'text-gray-300 hover:bg-[#18181b] hover:text-white'
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
    </aside>
  );
};
