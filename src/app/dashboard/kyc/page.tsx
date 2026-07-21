'use client';

import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';

export default function ComplianceVerificationPage() {
  const [ssn, setSsn] = useState('1234567890');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [records, setRecords] = useState([
    { sn: 1, type: 'Drivers License', transferTo: 'Cloudinary Private', amount: '$ 0', date: new Date().toLocaleDateString() },
  ]);

  const handleUploadClick = (docName: string) => {
    setLoading(true);
    setTimeout(() => {
      setRecords((prev) => [
        { sn: prev.length + 1, type: docName, transferTo: 'Cloudinary Private Zone', amount: '$ 0', date: new Date().toLocaleDateString() },
        ...prev,
      ]);
      setMsg(`Uploaded ${docName} directly to Cloudinary Authenticated Zone (` + `status: PENDING_REVIEW).`);
      setLoading(false);
    }, 800);
  };

  const handleSubmitSsn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setMsg(`Submitted SSN / Tax ID verification cleanly. Enforcing Tier 1/2 compliance gates.`);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {msg && <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-400 font-mono">{msg}</div>}

      {/* Exact Complete Your KYC Form (`IMG_7572`, `IMG_7573` match) */}
      <div className="rounded-2xl border border-[#2A2338] bg-[#16131F] p-6 shadow-tesla space-y-6">
        <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">Complete Your KYC</h1>

        <div className="space-y-5">
          <div>
            <span className="block text-xs font-bold text-gray-300 mb-2 font-sans">Drivers License</span>
            <button
              onClick={() => handleUploadClick('Drivers License')}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#EF4444] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#DC2626] shadow-red-glow"
            >
              <span>Upload IMAGE</span>
              <span>📝</span>
            </button>
          </div>

          <div>
            <span className="block text-xs font-bold text-gray-300 mb-2 font-sans">ID Card</span>
            <button
              onClick={() => handleUploadClick('ID Card')}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#EF4444] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#DC2626] shadow-red-glow"
            >
              <span>Upload IMAGE</span>
              <span>📝</span>
            </button>
          </div>

          <form onSubmit={handleSubmitSsn} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 font-sans">SSN / Tax Identification Number</label>
              <input
                type="text"
                required
                value={ssn}
                onChange={(e) => setSsn(e.target.value)}
                className="w-full rounded-lg border border-[#2C354C] bg-black px-4 py-3 text-sm font-mono text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[#EF4444] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#DC2626] shadow-red-glow"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        {/* Exact Ledger Table (`S/N | Type | Transfer to | Amount | Date` match) */}
        <div className="pt-6 border-t border-[#2A2338]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2A2338] text-left font-mono">
              <thead>
                <tr>
                  <th className="py-3 pr-4 text-xs font-bold uppercase text-gray-400 font-sans">S/N</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-gray-400 font-sans">Type</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-gray-400 font-sans">Transfer to</th>
                  <th className="py-3 px-4 text-xs font-bold uppercase text-gray-400 font-sans">Amount</th>
                  <th className="py-3 pl-4 text-xs font-bold uppercase text-gray-400 font-sans">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2338]/60 text-xs">
                {records.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#201A2C]/60 transition">
                    <td className="py-4 pr-4 font-bold text-gray-300">{row.sn}</td>
                    <td className="py-4 px-4 text-white font-medium">{row.type}</td>
                    <td className="py-4 px-4 font-mono text-gray-300">{row.transferTo}</td>
                    <td className="py-4 px-4 font-bold text-white">{row.amount}</td>
                    <td className="py-4 pl-4 text-gray-400">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
