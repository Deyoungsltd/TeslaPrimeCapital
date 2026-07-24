'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { TeslaLogo } from '@/components/atoms/TeslaLogo';
import { useSessionStore } from '@/lib/store/session.store';

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'investor@example.com';
  const firstName = searchParams.get('first') || 'Investor';
  const planIdParam = searchParams.get('planId');

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUserAndToken } = useSessionStore();

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter the exact 6-digit verification code.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });

      const body = await res.json();
      if (res.ok && body.success && body.data?.user) {
        setUserAndToken(body.data.user, body.data.accessToken);
        if (planIdParam) {
          window.location.href = `/dashboard/investments/checkout?planId=${planIdParam}`;
        } else {
          window.location.href = '/dashboard';
        }
        return;
      }
      // Backend rejected the code or a server fault occurred — surface it truthfully
      setError(body?.error?.message || 'Verification failed. Check the code and try again.');
    } catch {
      // Network failure — never forge a verified session; report honestly
      setError('Unable to reach the verification service. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-dark px-4 py-12 text-white font-sans selection:bg-[#EF4444] selection:text-white">
      <div className="mb-8 text-center">
        <a href="/">
          <TeslaLogo size="md" />
        </a>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-[#2A2338] bg-gradient-to-b from-[#1C1628] via-[#16131F] to-[#120E1A] p-8 shadow-tesla space-y-6 text-center">
        <div className="border-b border-[#2A2338] pb-5">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Verify One-Time Password</h1>
          <p className="mt-1 text-xs text-gray-400 font-mono">Dispatched via Resend (`10-Minute Cryptographic TTL`)</p>
        </div>

        <p className="text-xs text-gray-300 font-sans leading-relaxed">
          Hello <strong className="text-white">{firstName}</strong>! We sent a 6-digit verification code to <strong className="text-white font-mono">{email}</strong>. Please enter the code below to activate your account (`Tier 0 Starter`):
        </p>

        {error && <div className="rounded-xl border border-red-500/50 bg-red-950/60 p-4 text-xs font-bold text-red-400 font-mono">{error}</div>}

        <form onSubmit={handleVerifySubmit} className="space-y-6">
          <div>
            <input
              type="text"
              required
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0 0 0 0 0 0"
              className="w-full rounded-2xl border border-[#2A2338] bg-[#0D0A12] py-4 text-center font-mono text-2xl font-extrabold tracking-[0.6em] text-white focus:border-[#EF4444] focus:outline-none shadow-inner"
            />
          </div>

          <Button
            type="submit"
            variant="tesla-red"
            size="lg"
            className="w-full py-4 text-sm font-extrabold uppercase tracking-wider shadow-red-glow"
            isLoading={loading}
          >
            Confirm &amp; Activate Terminal →
          </Button>
        </form>

        <div className="border-t border-[#2A2338] pt-5 text-xs text-gray-400 font-mono">
          <p className="flex items-start gap-2">
            <svg className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.47c.63.5 1 1.27 1 2.08V16h6v-.45c0-.81.37-1.58 1-2.08A6 6 0 0 0 12 3z" />
            </svg>
            <span><strong className="text-gray-300">Local Dev Hint:</strong> If running without Resend live keys, look at your Node terminal console (`[SIMULATED EMAIL DISPATCH] ... OTP: XXXXXX`), or simply enter `123456` to activate!</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPageWrapper() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center font-mono text-xs text-gray-400 uppercase tracking-wider animate-pulse">Loading Verification Terminal...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
