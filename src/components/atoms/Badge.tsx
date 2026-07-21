import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IBadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<IBadgeProps> = ({ status, className }) => {
  const normalized = status.toUpperCase();

  let colorStyles = 'bg-[#161B29] text-gray-300 border-[#252D3F]';
  if (['ACTIVE', 'COMPLETED', 'APPROVED', 'CREDITED'].includes(normalized)) {
    colorStyles = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 font-mono font-bold';
  } else if (['PENDING_REVIEW', 'PENDING_VERIFICATION', 'PROCESSING', 'PENDING_VESTING'].includes(normalized)) {
    colorStyles = 'bg-amber-950/60 text-amber-400 border-amber-500/40 animate-pulse font-mono font-bold';
  } else if (['REJECTED', 'FAILED', 'SUSPENDED', 'LOCKED', 'CLAWED_BACK', 'CANCELLED'].includes(normalized)) {
    colorStyles = 'bg-rose-950/60 text-rose-400 border-rose-500/40 font-mono font-bold';
  } else if (['TIER_1', 'TIER_2', 'SUPER_ADMIN', 'FINANCE_MANAGER', 'COMPLIANCE_OFFICER'].includes(normalized)) {
    colorStyles = 'bg-blue-950/60 text-blue-400 border-blue-500/40 font-mono font-bold';
  } else if (['BASE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'].includes(normalized)) {
    colorStyles = 'bg-[#1C2234] text-gray-200 border-[#2F374F] font-mono font-bold';
  }

  return (
    <span className={twMerge(clsx('inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase backdrop-blur-sm select-none', colorStyles, className))}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
