import React from 'react';
import type { Metadata } from 'next';

/** OTP verification carries session-sensitive query state — never indexed. */
export const metadata: Metadata = {
  title: 'Verify Identity',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function VerifyOtpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
