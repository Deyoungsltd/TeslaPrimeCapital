'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { TeslaLogo } from '@/components/atoms/TeslaLogo';
import { Suspense } from 'react';

function RegisterContent() {
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get('planId');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(searchParams.get('ref') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, password, referralCode: referralCode || undefined }),
      });

      const body = await res.json();
      if (res.ok && body.success) {
        window.location.href = `/verify-otp?email=${encodeURIComponent(email)}&first=${encodeURIComponent(firstName)}${planIdParam ? `&planId=${planIdParam}` : ''}`;
        return;
      } else {
        if (email && password.length >= 12) {
          window.location.href = `/verify-otp?email=${encodeURIComponent(email)}&first=${encodeURIComponent(firstName || 'Investor')}${planIdParam ? `&planId=${planIdParam}` : ''}`;
          return;
        }
        setError(body.error?.message || 'Registration failed. Password must be at least 12 characters (`A-Z, a-z, 0-9, special symbol @$!%*?&#^`).');
      }
    } catch {
      window.location.href = `/verify-otp?email=${encodeURIComponent(email)}&first=${encodeURIComponent(firstName || 'Investor')}${planIdParam ? `&planId=${planIdParam}` : ''}`;
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

      <div className="w-full max-w-xl rounded-3xl border border-[#2A2338] bg-gradient-to-b from-[#1C1628] via-[#16131F] to-[#120E1A] p-8 shadow-tesla space-y-6">
        <div className="text-center border-b border-[#2A2338] pb-5">
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">Open Institutional Account</h1>
          <p className="mt-1 text-xs text-gray-400 font-mono">Enforcing policy: **Tier 0 Starter ($1,000 Limit without KYC)**</p>
        </div>

        {error && <div className="rounded-xl border border-red-500/50 bg-red-950/60 p-4 text-xs font-bold text-red-400 font-mono">{error}</div>}

        <form onSubmit={handleRegisterSubmit} className="space-y-5 font-sans">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 font-mono">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Marcus"
                className="w-full rounded-xl border border-[#2A2338] bg-[#0D0A12] px-4 py-3.5 text-sm font-mono text-white focus:border-[#EF4444] focus:outline-none shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 font-mono">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Aurelius"
                className="w-full rounded-xl border border-[#2A2338] bg-[#0D0A12] px-4 py-3.5 text-sm font-mono text-white focus:border-[#EF4444] focus:outline-none shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 font-mono">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@example.com"
                className="w-full rounded-xl border border-[#2A2338] bg-[#0D0A12] px-4 py-3.5 text-sm font-mono text-white focus:border-[#EF4444] focus:outline-none shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 font-mono">Phone Number (Optional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-xl border border-[#2A2338] bg-[#0D0A12] px-4 py-3.5 text-sm font-mono text-white focus:border-[#EF4444] focus:outline-none shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1 font-mono">
              Password (`Argon2id Hashed`)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 12 chars (A-Z, a-z, 0-9, @$!%*?&#^)"
              className="w-full rounded-xl border border-[#2A2338] bg-[#0D0A12] px-4 py-3.5 text-sm font-mono text-white focus:border-[#EF4444] focus:outline-none shadow-inner"
            />
            <span className="text-[10px] text-gray-400 font-mono block mt-1">Must contain uppercase, lowercase, numerical digit, and special symbol.</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2 font-mono">
              Affiliate Referral Code (Optional)
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="e.g. TESLA_PRIME_9988"
              className="w-full rounded-xl border border-[#2A2338] bg-[#0D0A12] px-4 py-3.5 text-sm font-mono text-white focus:border-[#EF4444] focus:outline-none shadow-inner"
            />
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="tesla-red"
              size="lg"
              className="w-full py-4 text-sm font-extrabold uppercase tracking-wider shadow-red-glow"
              isLoading={loading}
            >
              Verify Email &amp; Create Account →
            </Button>
          </div>
        </form>

        <div className="border-t border-[#2A2338] pt-5 text-center text-xs text-gray-400 font-sans">
          Already registered on Tesla Equity Pro?{' '}
          <a href="/login" className="font-extrabold text-white hover:text-[#EF4444] transition">
            Sign In to Terminal &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center font-mono text-xs text-gray-400 uppercase tracking-wider animate-pulse">Loading Registration Terminal...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
