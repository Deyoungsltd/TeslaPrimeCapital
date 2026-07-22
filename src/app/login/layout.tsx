import React from 'react';
import type { Metadata } from 'next';

/** Sign-in is a transactional entry point — crawlable, but never indexed. */
export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
