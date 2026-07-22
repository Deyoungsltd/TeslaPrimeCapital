import React from 'react';
import type { Metadata } from 'next';

/** Account recovery is a transactional flow — crawlable, but never indexed. */
export const metadata: Metadata = {
  title: 'Recover Access',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
