'use client';

import React, { useEffect } from 'react';
import { Navbar } from '@/components/organisms/Navbar';
import { Sidebar } from '@/components/organisms/Sidebar';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { PayoutTickerToast } from '@/components/organisms/PayoutTickerToast';
import { SmartsuppChat } from '@/components/organisms/SmartsuppChat';
import { useSessionStore } from '@/lib/store/session.store';

/**
 * Client Terminal Shell — interactive chrome for the authenticated investor
 * experience (navigation rail, live ticker, support chat). The route-level
 * `layout.tsx` wrapper is the server component that owns metadata, keeping
 * the crawler contract (`noindex`) separate from client behavior.
 */
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { setUserAndToken } = useSessionStore();

  useEffect(() => {
    const verifyTerminalSession = async () => {
      try {
        const res = await fetch('/api/v1/auth/refresh', { method: 'POST' });
        if (res.ok) {
          const body = await res.json();
          if (body.success && body.data?.user) {
            setUserAndToken(body.data.user, body.data.accessToken);
            return;
          }
        }
        // No valid refresh session — require sign-in when no client session is held
        const state = useSessionStore.getState();
        if (!state.user || !state.accessToken) {
          window.location.href = '/login?expired=true';
        }
      } catch (err) {
        // Refresh service unreachable — fall back to the locally held session, else sign-in
        const state = useSessionStore.getState();
        if (!state.user || !state.accessToken) {
          window.location.href = '/login?expired=true';
        }
      }
    };
    verifyTerminalSession();
  }, [setUserAndToken]);

  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col bg-brand-dark text-gray-100">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-8">
              {children}
            </div>
          </main>
        </div>
        <PayoutTickerToast />
        <SmartsuppChat />
      </div>
    </QueryProvider>
  );
}
