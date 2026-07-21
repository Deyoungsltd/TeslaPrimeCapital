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
            if (!['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_MANAGER'].includes(body.data.user.role)) {
              window.location.href = '/dashboard';
            }
            return;
          }
        }
        const state = useSessionStore.getState();
        if (!state.user || !state.accessToken) {
          window.location.href = '/login?admin_auth_required=true';
        } else if (!['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_MANAGER'].includes(state.user.role)) {
          window.location.href = '/dashboard';
        }
      } catch {
        const state = useSessionStore.getState();
        if (!state.user || !state.accessToken) {
          window.location.href = '/login?admin_auth_required=true';
        } else if (!['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_MANAGER'].includes(state.user.role)) {
          window.location.href = '/dashboard';
        }
      }
    };
    verifyExecutiveSession();
  }, [setUserAndToken]);

  const adminTabs = [
    { label: 'Executive Overview', href: '/admin', roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_MANAGER'] },
    { label: 'User & Role Governance', href: '/admin/users', roles: ['SUPER_ADMIN'] },
    { label: 'Treasury Withdrawal Queue (`100% Admin`)', href: '/admin/withdrawals', roles: ['SUPER_ADMIN', 'FINANCE_MANAGER'] },
    { label: 'KYC Document Review Desk (`300s URLs`)', href: '/admin/kyc', roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER'] },
    { label: 'Immutable Audit Ledger (`AuditLogs`)', href: '/admin/audit-logs', roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_MANAGER'] },
  ];

  const filteredTabs = adminTabs.filter((t) => !user || t.roles.includes(user.role));

  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col bg-brand-dark text-gray-100">
        <Navbar />
        
        {/* Executive Header Banner */}
        <div className="border-b border-gray-800 bg-brand-card/90 px-4 py-4 sm:px-6 md:px-8">
          <div className="mx-auto max-w-7xl flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <span className="rounded bg-brand-blue/20 p-2 text-brand-blue border border-brand-blue/50 font-mono font-bold text-xs uppercase tracking-widest">
                Executive Governance Portal
              </span>
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Role: <span className="text-brand-gold">{user?.role || 'SUPER_ADMIN'}</span>
              </span>
            </div>
            <div className="flex gap-2 text-xs">
              <a href="/dashboard" className="rounded border border-gray-700 bg-gray-900 px-3 py-1.5 font-bold text-gray-300 hover:bg-gray-800 transition">
                &larr; Switch to Retail Terminal (`/dashboard`)
              </a>
            </div>
          </div>

          {/* Admin Sub-Navigation Tabs */}
          <div className="mx-auto max-w-7xl mt-4 flex flex-wrap gap-2 pt-2 border-t border-gray-800">
            {filteredTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <a
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    isActive
                      ? 'bg-brand-gold text-black shadow-md'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
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
