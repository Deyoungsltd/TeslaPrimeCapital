import React from 'react';
import type { Metadata } from 'next';
import AdminPortalShell from './AdminPortalShell';

/**
 * Executive Governance Portal segment layout (server component).
 *
 * The entire /admin/* tree is a privileged operations surface: it must never
 * be indexed or enumerated by search engines. `noindex` + `noimageindex` is
 * belt-and-braces alongside the robots.txt disallow fence; interactive
 * behavior is delegated to AdminPortalShell.
 */
export const metadata: Metadata = {
  title: 'Executive Governance Portal',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return <AdminPortalShell>{children}</AdminPortalShell>;
}
