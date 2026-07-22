import React from 'react';
import type { Metadata } from 'next';

/**
 * Registration is the referral conversion endpoint. A canonical tag on the
 * page itself collapses every `/register?ref=...` partner URL onto the clean
 * route, and noindex keeps the transactional form out of search results.
 */
export const metadata: Metadata = {
  title: 'Create Account',
  alternates: { canonical: '/register' },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
