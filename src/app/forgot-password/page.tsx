'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { APP_CONFIG } from '@/config/app.config';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-dark px-4 py-12 text-white font-sans selection:bg-[#EF4444] selection:text-white">
      <div className="mb-8 text-center">
        <a href="/" className="inline-flex items-center gap-3">
          <span className="rounded-lg bg-[#F59E0B] px-3 py-1 text-xs font-mono font-extrabold text-black shadow-amber-glow uppercase tracking-wider">
            LOGO
          </span>
          <span className="text-2xl font-extrabold tracking-[0.3em] text-white uppercase font-sans">
            {APP_CONFIG.platformName}
          </span>
        </a>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-[#2A2338] bg-gradient-to-b from-[#1C1628] via-[#16131F] to-[#120E1A] p-8 shadow-tesla space-y-6 text-center">
        <div className="border-b border-[#2A2338] pb-5">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Reset Terminal Credentials</h1>
          <p className="mt-1 text-xs text-gray-400 font-mono">Cryptographic Password Recovery</p>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/40 p-6 shadow-lg space-y-4 font-sans">
            <div className="text-3xl">📧</div>
            <h3 className="text-lg font-bold text-white">Recovery Link Dispatched</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              If <strong className="text-white font-mono">{email}</strong> matches an active verified identity, you will receive a secure password reset link within 60 seconds.
            </p>
            <a href="/login">
              <Button variant="secondary" size="md" className="w-full mt-2">Return to Terminal Sign In &rarr;</Button>
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 font-sans text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 font-mono">
                Registered Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@example.com"
                className="w-full rounded-xl border border-[#2A2338] bg-[#0D0A12] px-4 py-3.5 text-sm font-mono text-white focus:border-[#EF4444] focus:outline-none shadow-inner"
              />
            </div>

            <Button
              type="submit"
              variant="tesla-red"
              size="lg"
              className="w-full py-4 text-sm font-extrabold uppercase tracking-wider shadow-red-glow"
            >
              Send Cryptographic Reset Token →
            </Button>
          </form>
        )}

        <div className="border-t border-[#2A2338] pt-5 text-center text-xs text-gray-400">
          Remembered your password?{' '}
          <a href="/login" className="font-extrabold text-white hover:text-[#EF4444] transition">
            Sign In &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
