'use client';

import React, { useEffect } from 'react';
import { Navbar } from '@/components/organisms/Navbar';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { useSessionStore } from '@/lib/store/session.store';
import { usePathname } from 'next/navigation';

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const { user, setUserAndToken } = useSessionStore();
  const pathname = usePathname();

  useEffect(() => {
    const verifyExecutiveSession = async () => {
      try {
        const res = await fetch('/api/v1/auth/refresh', { method: 'POST' });
        if (res.ok) {
          const body = await res.json();
          if (body.success && body.data?.user) {
            setUserAndToken(body.data.user, body.data.accessToken);
          }
        } else {
          window.location.href = '/login?admin_auth_required=true';
        }
      } catch {
        // Fallback
      }
    };
    verifyExecutiveSession();
  }, [setUserAndToken]);

  const adminTabs = [
    { label: 'Executive Overview', href: '/admin', roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_MANAGER'] },
    { label: 'User & Role Governance', href: '/admin/users', roles: ['SUPER_ADMIN'] },
    { label: 'Plan & Car Picture Manager (`IMG_7582 Match`)', href: '/admin/investments', roles: ['SUPER_ADMIN', 'FINANCE_MANAGER'] },
    { label: 'Treasury Withdrawal Queue (`100% Admin`)', href: '/admin/withdrawals', roles: ['SUPER_ADMIN', 'FINANCE_MANAGER'] },
    { label: 'KYC Document Review Desk (`300s URLs`)', href: '/admin/kyc', roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER'] },
    { label: 'Immutable Audit Ledger (`AuditLogs`)', href: '/admin/audit-logs', roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_MANAGER'] },
  ];

  const filteredTabs = adminTabs.filter((t) => !user || t.roles.includes(user.role));

  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col bg-[#080A0F] text-gray-100 font-sans">
        <Navbar />
        
        <div className="border-b border-[#1E2433] bg-[#111520]/90 px-4 py-4 sm:px-6 md:px-8 backdrop-blur-md">
          <div className="mx-auto max-w-7xl flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3 font-mono">
              <span className="rounded-md bg-brand-blue/20 p-2 text-brand-blue border border-brand-blue/50 font-mono font-bold text-xs uppercase tracking-widest">
                Executive Governance Portal
              </span>
              <span className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Role: <span className="text-[#EF4444] font-extrabold">{user?.role || 'SUPER_ADMIN'}</span>
              </span>
            </div>
            <div className="flex gap-2 text-xs">
              <a href="/dashboard" className="rounded-lg border border-[#2C354C] bg-[#181D2D] px-4 py-2 font-bold text-gray-300 hover:bg-white hover:text-black transition shadow-sm">
                &larr; Switch to Investor Terminal (`/dashboard`)
              </a>
            </div>
          </div>

          <div className="mx-auto max-w-7xl mt-4 flex flex-wrap gap-2 pt-3 border-t border-[#1E2433]">
            {filteredTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <a
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition duration-150 ${
                    isActive
                      ? 'bg-[#EF4444] text-white shadow-red-glow font-extrabold border border-red-400/40'
                      : 'bg-[#181D2D] text-gray-300 hover:bg-[#22293E] hover:text-white border border-[#2C354C]'
                  }`}
                >
                  {tab.label}
                </a>
              );
            })}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {children}
          </div>
        </main>
      </div>
    </QueryProvider>
  );
}
