import React from 'react';
import type { Metadata } from 'next';
import { buildMarketingMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMarketingMetadata(
  'Platform Status',
  'Live operational telemetry for TeslaPrimeCapital: API, ledger database, and real-time cache — read from the same health probes our monitors consult every ten seconds.',
  '/status',
);

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
