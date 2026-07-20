import React from 'react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-dark px-4 text-center text-white">
      <h1 className="text-7xl font-extrabold text-brand-gold tracking-tight">404</h1>
      <h2 className="mt-4 text-2xl font-bold tracking-wide uppercase">Route Not Found</h2>
      <p className="mt-2 max-w-md text-sm text-gray-400">
        The requested financial terminal endpoint or application screen does not exist on this server.
      </p>
      <a
        href="/"
        className="mt-8 inline-flex items-center rounded-md bg-brand-gold px-6 py-3 text-sm font-bold text-black transition hover:bg-brand-goldHover"
      >
        Return to Terminal Overview
      </a>
    </div>
  );
}
