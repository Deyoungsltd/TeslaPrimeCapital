'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay';

export default function AdminPlansAndCarPicturesPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Form states
  const [planId, setPlanId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minDepositUsd, setMinDepositUsd] = useState('1000.00000000');
  const [maxDepositUsd, setMaxDepositUsd] = useState('8000.00000000');
  const [termDays, setTermDays] = useState(24);
  const [dailyRateNumeric, setDailyRateNumeric] = useState('0.01666667');
  const [annualPercentageRate, setAnnualPercentageRate] = useState('608.33%');
  const [profitText, setProfitText] = useState('40% Profit');
  const [imageUrl, setImageUrl] = useState('/branding/car-bronze.jpg');
  const [featuresStr, setFeaturesStr] = useState('Portfolio Access, Investment Dashboard, Email Support, Daily Accrual Tracking');
  const [isActive, setIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/plans');
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) setPlans(body.data);
      } else {
        // Fallback simulation
        setPlans([
          { id: '1', planId: 'plan-bronze', name: 'Bronze (BASE)', description: 'Perfect for getting started with Tesla investment.', minDepositUsd: '1000.00000000', maxDepositUsd: '8000.00000000', termDays: 24, dailyRateNumeric: '0.01666667', annualPercentageRate: '608.33%', profitText: '40% Profit', imageUrl: '/branding/car-bronze.jpg', features: ['Portfolio Access', 'Investment Dashboard', 'Email Support', 'Daily Accrual Tracking'], isActive: true },
          { id: '2', planId: 'plan-silver', name: 'Silver', description: 'Enhanced returns for serious investors.', minDepositUsd: '5000.00000000', maxDepositUsd: '14999.00000000', termDays: 3, dailyRateNumeric: '0.21666667', annualPercentageRate: '7908.33%', profitText: '65% Profit', imageUrl: '/branding/car-silver.jpg', features: ['Portfolio Access', 'Investment Dashboard', 'Email Support', 'Priority Liquidity Release'], isActive: true },
          { id: '3', planId: 'plan-gold', name: 'Gold', description: 'Premium investment with exclusive benefits.', minDepositUsd: '10000.00000000', maxDepositUsd: '50000.00000000', termDays: 7, dailyRateNumeric: '0.11428571', annualPercentageRate: '4171.43%', profitText: '80% Profit', imageUrl: '/branding/car-gold.jpg', features: ['Portfolio Access', 'Investment Dashboard', 'Email Support', 'Dedicated Account Manager'], isActive: true },
          { id: '4', planId: 'plan-diamond', name: 'Diamond (Platinum)', description: 'Elite flagship capital management pool.', minDepositUsd: '50000.00000000', maxDepositUsd: '1000000.00000000', termDays: 14, dailyRateNumeric: '0.07071429', annualPercentageRate: '2581.07%', profitText: '99% Profit', imageUrl: '/branding/car-diamond.jpg', features: ['Portfolio Access', 'Investment Dashboard', '24/7 VIP Phone Support', 'Instant Multi-Sig Release'], isActive: true },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenEdit = (plan: any) => {
    setIsNew(false);
    setSelectedPlan(plan);
    setPlanId(plan.planId);
    setName(plan.name);
    setDescription(plan.description);
    setMinDepositUsd(plan.minDepositUsd);
    setMaxDepositUsd(plan.maxDepositUsd);
    setTermDays(plan.termDays);
    setDailyRateNumeric(plan.dailyRateNumeric);
    setAnnualPercentageRate(plan.annualPercentageRate);
    setProfitText(plan.profitText || '40% Profit');
    setImageUrl(plan.imageUrl || '/branding/car-bronze.jpg');
    setFeaturesStr((plan.features && Array.isArray(plan.features) ? plan.features.join(', ') : 'Portfolio Access, Investment Dashboard, Email Support'));
    setIsActive(plan.isActive !== false);
    setMsg(null);
  };

  const handleOpenCreate = () => {
    setIsNew(true);
    setSelectedPlan({ id: 'new' });
    setPlanId(`plan_${Date.now()}`);
    setName('New Tesla Package');
    setDescription('Custom structured allocation package.');
    setMinDepositUsd('1000.00000000');
    setMaxDepositUsd('10000.00000000');
    setTermDays(30);
    setDailyRateNumeric('0.00500000');
    setAnnualPercentageRate('180%');
    setProfitText('50% Profit');
    setImageUrl('/branding/car-bronze.jpg');
    setFeaturesStr('Portfolio Access, Investment Dashboard, Email Support');
    setIsActive(true);
    setMsg(null);
  };

  const handleCarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingImage(true);
    setMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/v1/admin/plans/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.imageUrl) {
        setImageUrl(data.data.imageUrl);
        setMsg(`Car image (${file.name}) uploaded successfully from device and encoded cleanly!`);
      } else {
        alert(data.error?.message || 'Image upload failed.');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
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
        setMsg(`Plan [${name}] saved cleanly! Car picture & features instantly updated across Landing Page and Investor Dashboard.`);
        fetchPlans();
        setSelectedPlan(null);
      } else {
        setMsg(`Error: ${data.error?.message || 'Save failed.'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-xs text-gray-400 uppercase tracking-wider animate-pulse">
        <span>Loading Admin Plan &amp; Car Picture Governance Center...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-[#1E2433] pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl font-sans tracking-tight">
            Plan &amp; Car Picture Governance (`Admin`)
          </h1>
          <p className="mt-1.5 text-xs text-gray-400 font-sans">
            Enforcing approved policy: **Full Dynamic Admin Customization (`IMG_7582.jpeg` match)**. Edit name, profit text, duration, checkmark features, and **upload car pictures directly from your device!**
          </p>
        </div>
        <div>
          <Button variant="electric" size="md" onClick={handleOpenCreate}>
            + Create New Package &amp; Car Picture
          </Button>
        </div>
      </div>

      {msg && <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-400 font-mono">{msg}</div>}

      {/* Editor Modal Popup */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={handleSavePlan} className="w-full max-w-3xl rounded-2xl border border-[#2C354C] bg-[#111520] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-[#1E2433] pb-4">
              <h3 className="text-lg font-extrabold text-white">
                {isNew ? 'Create New Investment Plan' : `Edit Plan & Car Picture: ${name}`}
              </h3>
              <button type="button" onClick={() => setSelectedPlan(null)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
              {/* Left Column: Car Picture Upload & Preview (`IMG_7582.jpeg` match!) */}
              <div className="space-y-4 rounded-xl border border-[#1E2433] bg-black/60 p-4">
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block font-mono">
                  Featured Car Image Banner (`IMG_7582.jpeg` Match)
                </span>
                <div className="h-44 w-full rounded-xl overflow-hidden border border-[#2C354C] bg-black">
                  <img src={imageUrl} alt="Car Preview" className="h-full w-full object-cover" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">
                    Upload New Car Picture from Device 📂
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCarImageUpload}
                    disabled={uploadingImage}
                    className="block w-full text-xs text-gray-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[#EF4444] file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-[#DC2626] cursor-pointer bg-[#181D2D] rounded-lg border border-[#2C354C] transition"
                  />
                  {uploadingImage && <span className="text-[10px] font-mono text-emerald-400 block mt-1 animate-pulse">Encoding car image from device...</span>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1 font-mono">Or Enter Image URL (`/branding/car-bronze.jpg` / `https://...`)</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-lg border border-[#2C354C] bg-black px-3 py-2 text-xs font-mono text-white focus:border-brand-blue focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column: Plan Specifications & Checkmarks */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">Package Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-[#2C354C] bg-black px-3 py-2 text-xs text-white focus:border-brand-blue" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">Profit Badge Text</label>
                    <input type="text" required value={profitText} onChange={(e) => setProfitText(e.target.value)} placeholder="40% Profit / $1,000 min" className="w-full rounded-lg border border-[#2C354C] bg-black px-3 py-2 text-xs text-white focus:border-brand-blue" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">Min Deposit (USD)</label>
                    <input type="text" required value={minDepositUsd} onChange={(e) => setMinDepositUsd(e.target.value)} className="w-full rounded-lg border border-[#2C354C] bg-black px-3 py-2 text-xs text-white focus:border-brand-blue" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">Max Deposit (USD)</label>
                    <input type="text" required value={maxDepositUsd} onChange={(e) => setMaxDepositUsd(e.target.value)} className="w-full rounded-lg border border-[#2C354C] bg-black px-3 py-2 text-xs text-white focus:border-brand-blue" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">Duration (Days)</label>
                    <input type="number" required value={termDays} onChange={(e) => setTermDays(parseInt(e.target.value || '1', 10))} className="w-full rounded-lg border border-[#2C354C] bg-black px-3 py-2 text-xs text-white focus:border-brand-blue" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">Target APR (`608.33%`)</label>
                    <input type="text" required value={annualPercentageRate} onChange={(e) => setAnnualPercentageRate(e.target.value)} className="w-full rounded-lg border border-[#2C354C] bg-black px-3 py-2 text-xs text-white focus:border-brand-blue" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">Description</label>
                  <textarea rows={2} required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-[#2C354C] bg-black px-3 py-2 text-xs text-white focus:border-brand-blue" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1 font-sans">Checkmark Features (comma separated)</label>
                  <input type="text" required value={featuresStr} onChange={(e) => setFeaturesStr(e.target.value)} className="w-full rounded-lg border border-[#2C354C] bg-black px-3 py-2 text-xs font-mono text-white focus:border-brand-blue" />
                  <span className="text-[10px] text-gray-400 font-mono block mt-0.5">e.g. Portfolio Access, Investment Dashboard, Email Support</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-[#1E2433]">
              <Button type="submit" variant="electric" size="md" className="flex-1" isLoading={saving}>
                Commit &amp; Save Plan Specifications &rarr;
              </Button>
              <Button type="button" variant="secondary" size="md" onClick={() => setSelectedPlan(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Table of Active Plans (`Admin Governance`) */}
      <div className="overflow-x-auto rounded-2xl border border-[#1E2433] bg-[#111520] shadow-tesla font-sans">
        <table className="min-w-full divide-y divide-[#1E2433]">
          <thead className="bg-[#181D2D]">
            <tr>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Featured Car</th>
              <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Package Name</th>
              <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Profit Badge</th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Range (`USD`)</th>
              <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">Duration</th>
              <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2433]/60">
            {plans.map((p) => (
              <tr key={p.id} className="hover:bg-[#181D2D]/60 transition">
                <td className="px-5 py-4">
                  <div className="h-14 w-24 rounded-lg overflow-hidden border border-[#2C354C] bg-black">
                    <img src={p.imageUrl || '/branding/car-bronze.jpg'} alt={p.name} className="h-full w-full object-cover" />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm font-extrabold text-white">{p.name}</div>
                  <div className="text-xs text-gray-400 font-mono truncate max-w-[180px]">{p.description}</div>
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="rounded-md border border-[#2F374F] bg-[#1E2433] px-2.5 py-1 font-mono text-xs font-bold text-gray-200">
                    {p.profitText || '40% Profit'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-mono text-xs text-white font-bold">
                  ${parseFloat(p.minDepositUsd).toLocaleString()} - ${parseFloat(p.maxDepositUsd).toLocaleString()}
                </td>
                <td className="px-5 py-4 text-center font-mono text-xs text-gray-300 font-bold">
                  {p.termDays} Days
                </td>
                <td className="px-5 py-4 text-center">
                  <Badge status={p.isActive ? 'ACTIVE' : 'SUSPENDED'} />
                </td>
                <td className="px-5 py-4 text-right">
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(p)}>
                    ✏️ Edit Plan &amp; Car Picture
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
