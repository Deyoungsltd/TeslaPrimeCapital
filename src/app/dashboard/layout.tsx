import React from 'react';
import type { Metadata } from 'next';
import DashboardShell from './DashboardShell';

/**
 * Client Terminal segment layout (server component).
 *
 * The entire /dashboard/* tree is an authenticated application surface: it
 * must never appear in search indexes (its pages are personalized shells and
 * indexing them would leak route structure for zero organic value). The
 * metadata contract lives here; interactive chrome lives in DashboardShell.
 */
export const metadata: Metadata = {
  title: 'Client Terminal',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
