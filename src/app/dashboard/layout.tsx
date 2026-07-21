'use client';

import React, { useEffect } from 'react';
import { Navbar } from '@/components/organisms/Navbar';
import { Sidebar } from '@/components/organisms/Sidebar';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { useSessionStore } from '@/lib/store/session.store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { setUserAndToken } = useSessionStore();

  useEffect(() => {
    const verifyTerminalSession = async () => {
      try {
        const res = await fetch('/api/v1/auth/refresh', { method: 'POST' });
        if (res.ok) {
          const body = await res.json();
          if (body.success && body.data?.user) {
            setUserAndToken(body.data.user, body.data.accessToken);
          }
        } else if (res.status === 401) {
          window.location.href = '/login?expired=true';
        }
      } catch (err) {
        // Fallback or offline simulation
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
      </div>
    </QueryProvider>
  );
}
