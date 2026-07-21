import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IBadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<IBadgeProps> = ({ status, className }) => {
  const normalized = status.toUpperCase();

  let colorStyles = 'bg-[#18181f] text-gray-300 border-[#262630]';
  if (['ACTIVE', 'COMPLETED', 'APPROVED', 'CREDITED'].includes(normalized)) {
    colorStyles = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)] font-mono';
  } else if (['PENDING_REVIEW', 'PENDING_VERIFICATION', 'PROCESSING', 'PENDING_VESTING'].includes(normalized)) {
    colorStyles = 'bg-amber-950/60 text-amber-400 border-amber-500/50 animate-pulse font-mono';
  } else if (['REJECTED', 'FAILED', 'SUSPENDED', 'LOCKED', 'CLAWED_BACK', 'CANCELLED'].includes(normalized)) {
    colorStyles = 'bg-rose-950/60 text-rose-400 border-rose-500/50 font-mono';
  } else if (['TIER_1', 'TIER_2', 'SUPER_ADMIN', 'FINANCE_MANAGER', 'COMPLIANCE_OFFICER'].includes(normalized)) {
    colorStyles = 'bg-blue-950/60 text-brand-blue border-brand-blue/50 shadow-[0_0_10px_rgba(62,106,225,0.2)] font-mono';
  }

  return (
    <span className={twMerge(clsx('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase backdrop-blur-sm select-none', colorStyles, className))}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
