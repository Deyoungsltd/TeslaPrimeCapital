import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IBadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<IBadgeProps> = ({ status, className }) => {
  const normalized = status.toUpperCase();

  let colorStyles = 'bg-[#18181b] text-gray-300 border-[#27272a]';
  if (['ACTIVE', 'COMPLETED', 'APPROVED', 'CREDITED'].includes(normalized)) {
    colorStyles = 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';
  } else if (['PENDING_REVIEW', 'PENDING_VERIFICATION', 'PROCESSING', 'PENDING_VESTING'].includes(normalized)) {
    colorStyles = 'bg-amber-950/40 text-amber-400 border-amber-800/60 animate-pulse';
  } else if (['REJECTED', 'FAILED', 'SUSPENDED', 'LOCKED', 'CLAWED_BACK', 'CANCELLED'].includes(normalized)) {
    colorStyles = 'bg-rose-950/40 text-rose-400 border-rose-800/60';
  } else if (['TIER_1', 'TIER_2', 'SUPER_ADMIN', 'FINANCE_MANAGER', 'COMPLIANCE_OFFICER'].includes(normalized)) {
    colorStyles = 'bg-blue-950/40 text-blue-400 border-blue-800/60';
  }

  return (
    <span className={twMerge(clsx('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase', colorStyles, className))}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
