import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'tesla-red' | 'primary' | 'electric' | 'emerald' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass-white';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<IButtonProps> = ({
  children,
  variant = 'tesla-red',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-extrabold tracking-[0.15em] uppercase transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#080A0F] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] shadow-md hover:-translate-y-0.5';

  const variants = {
    'tesla-red': 'bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] hover:from-[#DC2626] hover:via-[#B91C1C] hover:to-[#991B1B] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] border border-red-400/40 font-mono',
    primary: 'bg-gradient-to-r from-[#EF4444] via-[#E53E3E] to-[#DC2626] hover:from-[#DC2626] hover:via-[#B91C1C] hover:to-[#991B1B] text-white shadow-[0_4px_25px_rgba(239,68,68,0.4)] hover:shadow-[0_8px_35px_rgba(239,68,68,0.7)] border border-red-400/40 font-mono',
    'glass-white': 'bg-white/95 hover:bg-white text-black shadow-lg hover:shadow-2xl border border-white/80 font-sans tracking-[0.12em]',
    electric: 'bg-gradient-to-r from-[#3E6AE1] to-[#2563EB] hover:from-[#2C52C8] hover:to-[#1D4ED8] text-white shadow-[0_4px_25px_rgba(62,106,225,0.4)] hover:shadow-[0_8px_35px_rgba(62,106,225,0.7)] border border-blue-400/40 font-mono',
    emerald: 'bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_35px_rgba(16,185,129,0.7)] border border-emerald-400/40 font-mono',
    secondary: 'bg-[#181D2D] text-gray-200 border border-[#2C354C] hover:bg-[#22293E] hover:border-gray-400 shadow-sm font-sans tracking-[0.1em]',
    outline: 'border border-[#3B476B] bg-black/40 text-gray-200 hover:border-white hover:bg-white/10 tracking-[0.15em] backdrop-blur-md font-mono',
    danger: 'bg-gradient-to-r from-[#EF4444] to-[#B91C1C] text-white hover:bg-red-800 shadow-red-glow border border-red-400/40 font-mono',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 shadow-none tracking-[0.1em]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[11px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
