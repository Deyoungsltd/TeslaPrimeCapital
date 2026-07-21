'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';

export default function AdminCreatePlanPage() {
  const [planId, setPlanId] = useState(`plan_${Date.now()}`);
  const [name, setName] = useState('New Tesla Package');
  const [description, setDescription] = useState('Custom structured allocation package.');
  const [minDepositUsd, setMinDepositUsd] = useState('1000.00000000');
  const [maxDepositUsd, setMaxDepositUsd] = useState('10000.00000000');
  const [termDays, setTermDays] = useState(30);
  const [dailyRateNumeric, setDailyRateNumeric] = useState('0.00500000');
  const [annualPercentageRate, setAnnualPercentageRate] = useState('180%');
  const [profitText, setProfitText] = useState('50% Profit');
  const [imageUrl, setImageUrl] = useState('/branding/car-bronze.jpg');
  const [featuresStr, setFeaturesStr] = useState('Portfolio Access, Investment Dashboard, Email Support');
  const [isActive, setIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleCarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    setMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/admin/plans/upload-image', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success && data.data?.imageUrl) {
        setImageUrl(data.data.imageUrl);
        setMsg(`Car image (${file.name}) uploaded successfully from device and encoded!`);
      } else {
        alert(data.error?.message || 'Image upload failed.');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const featuresArr = featuresStr.split(',').map((f) => f.trim()).filter(Boolean);
      const res = await fetch('/api/v1/admin/plans/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          name,
          description,
          minDepositUsd,
          maxDepositUsd,
          termDays,
          dailyRateNumeric,
          annualPercentageRate,
          profitText,
          imageUrl,
          features: featuresArr,
          isActive,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg(`Plan [${name}] created cleanly! Redirecting back to Plan Manager...`);
        setTimeout(() => { window.location.href = '/admin/investments'; }, 1200);
      } else {
        setMsg(`Error: ${data.error?.message || 'Create failed.'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-[#20283E] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-blue font-mono">Dedicated Creation Portal</span>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl mt-1 tracking-tight">Create New Investment Package</h1>
        </div>
        <a href="/admin/investments">
          <Button variant="secondary" size="sm">&larr; Back to Packages Table</Button>
        </a>
      </div>

      {msg && <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-400 font-mono">{msg}</div>}

      <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 gap-8 md:grid-cols-2 items-start">
        {/* Left: Car Picture Upload & Preview */}
        <div className="rounded-2xl border border-[#20283E] bg-[#131824] p-6 shadow-tesla space-y-4">
          <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block font-mono">
            Featured Car Image Banner (`IMG_7582 Match`)
          </span>
          <div className="h-56 w-full rounded-xl overflow-hidden border border-[#20283E] bg-black shadow-inner">
            <img src={imageUrl} alt="Car Preview" className="h-full w-full object-cover" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2 font-sans">
              Upload New Car Picture from Device 📂
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCarImageUpload}
              disabled={uploadingImage}
              className="block w-full text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[#EF4444] file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-white hover:file:bg-[#DC2626] cursor-pointer bg-black rounded-lg border border-[#20283E] transition"
            />
            {uploadingImage && <span className="text-[10px] font-mono text-emerald-400 block mt-2 animate-pulse">Encoding car image from device...</span>}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-1 font-mono">Or Enter Image URL (`/branding/car-bronze.jpg` / `https://...`)</label>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full rounded-lg border border-[#20283E] bg-black px-3.5 py-2.5 text-xs font-mono text-white focus:border-brand-blue focus:outline-none" />
          </div>
        </div>

        {/* Right: Plan Specifications */}
        <div className="rounded-2xl border border-[#20283E] bg-[#131824] p-6 shadow-tesla space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Package Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-[#20283E] bg-black px-3.5 py-2.5 text-xs text-white focus:border-brand-blue" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Profit Badge Text</label>
              <input type="text" required value={profitText} onChange={(e) => setProfitText(e.target.value)} placeholder="40% Profit" className="w-full rounded-lg border border-[#20283E] bg-black px-3.5 py-2.5 text-xs text-white focus:border-brand-blue" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">Min Deposit (USD)</label>
              <input type="text" required value={minDepositUsd} onChange={(e) => setMinDepositUsd(e.target.value)} className="w-full rounded-lg border border-[#20283E] bg-black px-3.5 py-2.5 text-xs text-white focus:border-brand-blue" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">Max Deposit (USD)</label>
              <input type="text" required value={maxDepositUsd} onChange={(e) => setMaxDepositUsd(e.target.value)} className="w-full rounded-lg border border-[#20283E] bg-black px-3.5 py-2.5 text-xs text-white focus:border-brand-blue" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">Duration (Days)</label>
              <input type="number" required value={termDays} onChange={(e) => setTermDays(parseInt(e.target.value || '1', 10))} className="w-full rounded-lg border border-[#20283E] bg-black px-3.5 py-2.5 text-xs text-white focus:border-brand-blue" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">Target APR (`608.33%`)</label>
              <input type="text" required value={annualPercentageRate} onChange={(e) => setAnnualPercentageRate(e.target.value)} className="w-full rounded-lg border border-[#20283E] bg-black px-3.5 py-2.5 text-xs text-white focus:border-brand-blue" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Description</label>
            <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-[#20283E] bg-black px-3.5 py-2 text-xs text-white focus:border-brand-blue" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Checkmark Features (comma separated)</label>
            <input type="text" required value={featuresStr} onChange={(e) => setFeaturesStr(e.target.value)} className="w-full rounded-lg border border-[#20283E] bg-black px-3.5 py-2.5 text-xs font-mono text-white focus:border-brand-blue" />
            <span className="text-[10px] text-gray-400 font-mono block mt-1">e.g. Portfolio Access, Investment Dashboard, Email Support</span>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="electric" size="lg" className="w-full py-4 text-sm font-extrabold shadow-blue-glow" isLoading={saving}>
              Commit &amp; Save Plan Specifications &rarr;
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
