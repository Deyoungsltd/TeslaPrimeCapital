'use client';

import React, { useEffect, useState } from 'react';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { BrandLogo } from '@/components/atoms/BrandLogo';
import { ManagedText } from '@/components/atoms/ManagedText';
import { useSessionStore } from '@/lib/store/session.store';
import { usePathname } from 'next/navigation';

/**
 * Governance Console Shell — deliberately SEPARATE chrome from the retail
 * terminal: dedicated iron-and-amber sidebar, governance lockup, and its own
 * session gate (SUPER_ADMIN / COMPLIANCE_OFFICER / FINANCE_MANAGER only —
 * retail users are bounced to /dashboard, unauthenticated to /login). The
 * route-level layout owns noindex; this component owns behavior.
 */

const ADMIN_ROLES = ['SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'FINANCE_MANAGER'];

const NAV_SECTIONS = [
  {
    section: 'Command',
    items: [
      { label: 'Executive Overview', href: '/admin', roles: ADMIN_ROLES, icon: 'M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-4H4v4Zm10-11h6V4h-6v5Z' },
    ],
  },
  {
    section: 'Governance',
    items: [
      { label: 'User & Roles', href: '/admin/users', roles: ['SUPER_ADMIN'], icon: 'M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 0a4 4 0 1 0-4-4M2 21a8 8 0 0 1 12 0m6-10a4 4 0 0 1 0 5.6M14 21a8 8 0 0 1 8 0' },
      { label: 'KYC Review Desk', href: '/admin/kyc', roles: ['SUPER_ADMIN', 'COMPLIANCE_OFFICER'], icon: 'M9 12l2 2 4-4m1-3H8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2ZM9 7V5a3 3 0 0 1 6 0v2' },
      { label: 'Deposit Desk', href: '/admin/deposits', roles: ['SUPER_ADMIN', 'FINANCE_MANAGER'], icon: 'M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2' },
      { label: 'Treasury Queue', href: '/admin/withdrawals', roles: ['SUPER_ADMIN', 'FINANCE_MANAGER'], icon: 'M12 8c-2.2 0-4 1.12-4 2.5S9.8 13 12 13s4 1.12 4 2.5S14.2 18 12 18m0-10V6m0 12v2m6-8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z' },
    ],
  },
  {
    section: 'Stewardship',
    items: [
      { label: 'Broadcast Center', href: '/admin/broadcast', roles: ['SUPER_ADMIN'], icon: 'M15.5 4.7 21 2l-2.7 5.5M21 2 11.6 11.4M10.2 12.6 7.5 21l2.4-5.9M10.2 12.6 3 10.3l5.9-2.4' },
      { label: 'Brand Library', href: '/admin/media', roles: ['SUPER_ADMIN'], icon: 'M4 5h16v11H4zM4 5V3m16 2V3M8 21h8m-9-5 2.5-3 2 2.4L14 13l3 3' },
      { label: 'Audit Ledger', href: '/admin/audit-logs', roles: ADMIN_ROLES, icon: 'M9 5h6M9 9h6M9 13h4M7 3h10a2 2 0 0 1 2 2v14l-3-2-2.5 2L11 17l-2 2-2-2V5a2 2 0 0 1 2-2Z' },
    ],
  },
];

function NavIcon({ path }: { path: string }) {
  return (
    <svg className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export default function AdminPortalShell({ children }: { children: React.ReactNode }) {
  const { user, setUserAndToken } = useSessionStore();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const verifyExecutiveSession = async () => {
      const bounce = (u: any) => {
        if (!u) window.location.href = '/login?admin_auth_required=true';
        else if (!ADMIN_ROLES.includes(u.role)) window.location.href = '/dashboard';
      };
      try {
        const res = await fetch('/api/v1/auth/refresh', { method: 'POST' });
        if (res.ok) {
          const body = await res.json();
          if (body.success && body.data?.user) {
            if (!ADMIN_ROLES.includes(body.data.user.role)) {
              window.location.href = '/dashboard';
              return;
            }
            setUserAndToken(body.data.user, body.data.accessToken);
            return;
          }
        }
        bounce(useSessionStore.getState().user && useSessionStore.getState().accessToken ? useSessionStore.getState().user : null);
      } catch {
        bounce(useSessionStore.getState().user && useSessionStore.getState().accessToken ? useSessionStore.getState().user : null);
      }
    };
    verifyExecutiveSession();
  }, [setUserAndToken]);

  const renderNav = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-7">
      {NAV_SECTIONS.map((section) => {
        const items = section.items.filter((t) => !user || t.roles.includes(user.role));
        if (items.length === 0) return null;
        return (
          <div key={section.section}>
            <div className="px-4 pb-2 font-mono text-[9px] font-extrabold uppercase tracking-[0.28em] text-amber-500/70">
              {section.section}
            </div>
            <div className="flex flex-col gap-1">
              {items.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <a
                    key={tab.href}
                    href={tab.href}
                    onClick={onNavigate}
                    className={`group flex items-center gap-3 rounded-lg border-l-2 px-4 py-2.5 text-[12px] font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-transparent text-gray-400 hover:border-amber-500/40 hover:bg-white/[0.03] hover:text-white'
                    }`}
                  >
                    <NavIcon path={tab.icon} />
                    {tab.label}
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-[#07090D] text-gray-100">
        {/* ───────── Desktop sidebar ───────── */}
        <aside className="sticky top-0 hidden h-screen w-[264px] flex-shrink-0 flex-col justify-between border-r border-white/5 bg-[#090C12] px-5 py-7 lg:flex">
          <div className="space-y-9">
            <div>
              <BrandLogo size="sm" />
              <div className="mt-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.3em] text-amber-500">
                  Governance Console
                </span>
              </div>
            </div>
            {renderNav()}
          </div>

          <div className="space-y-4">
            <a
              href="/dashboard"
              className="block rounded-lg border border-white/10 px-4 py-3 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-400 transition-colors hover:border-white/25 hover:text-white"
            >
              &larr; Retail Terminal
            </a>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="truncate text-[12px] font-semibold text-white">{user?.email ?? '—'}</div>
              <div className="mt-1 font-mono text-[8.5px] font-bold uppercase tracking-[0.22em] text-amber-500/80">
                {user?.role ?? 'Verifying clearance…'}
              </div>
            </div>
          </div>
        </aside>

        {/* ───────── Mobile top bar + drawer ───────── */}
        <div className="flex min-h-screen flex-1 flex-col">
          <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-[#090C12]/95 px-5 backdrop-blur-md lg:hidden">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen((v) => !v)}
                aria-label={drawerOpen ? 'Close governance menu' : 'Open governance menu'}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-300"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {drawerOpen ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
                </svg>
              </button>
              <BrandLogo size="sm" />
            </div>
            <a href="/dashboard" className="font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-400">
              &larr; Retail
            </a>
          </div>
          {drawerOpen && (
            <div className="border-b border-white/5 bg-[#090C12] px-5 py-6 lg:hidden">
              {renderNav(() => setDrawerOpen(false))}
            </div>
          )}

          {/* ───────── Console top ruler (desktop) ───────── */}
          <div className="hidden items-center justify-between border-b border-white/5 bg-[#07090D] px-8 py-3.5 lg:flex">
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.3em] text-gray-500">
              <ManagedText slotKey="brand.displayName" /> · Governance Console
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-amber-500/80">
              {user?.role ? `Clearance: ${user.role}` : 'Verifying clearance…'}
            </span>
          </div>

          <main className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}
