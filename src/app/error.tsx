'use client';

import React, { useEffect } from 'react';
import { logger } from '@/utils/logger.util';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Unhandled runtime exception intercepted by GlobalErrorBoundary:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-dark px-4 text-center text-white">
      <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-8 max-w-lg shadow-2xl">
        <h1 className="text-3xl font-extrabold text-red-500 tracking-tight">System Interruption</h1>
        <p className="mt-4 text-sm text-gray-300 leading-relaxed">
          An unexpected runtime exception was intercepted while rendering the application terminal. The error has been logged directly to the enterprise audit trace.
        </p>
        {error.digest && (
          <p className="mt-2 rounded bg-black/40 py-1 px-3 font-mono text-xs text-gray-400">
            Diagnostic ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded-md bg-brand-gold px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-brand-goldHover"
          >
            Attempt Recovery
          </button>
          <a
            href="/"
            className="rounded-md border border-gray-700 bg-brand-card px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-300 transition hover:bg-gray-800"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
