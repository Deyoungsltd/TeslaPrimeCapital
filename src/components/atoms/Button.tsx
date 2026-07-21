import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'electric' | 'emerald' | 'tesla-red';
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
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:ring-offset-2 focus:ring-offset-[#080A0F] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] shadow-md';

  const variants = {
    'tesla-red': 'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-red-glow font-extrabold border border-red-400/30',
    primary: 'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-red-glow font-extrabold border border-red-400/30',
    electric: 'bg-brand-blue text-white hover:bg-brand-blueHover shadow-md font-bold border border-white/10',
    emerald: 'bg-brand-emerald text-white hover:bg-emerald-600 shadow-emerald-glow font-bold border border-emerald-400/30',
    secondary: 'bg-[#161B29] text-gray-200 border border-[#252D3F] hover:bg-[#1C2234] hover:border-gray-400 shadow-sm font-semibold',
    outline: 'border border-[#2C354C] bg-transparent text-gray-300 hover:border-white hover:bg-white/5 font-semibold',
    danger: 'bg-[#EF4444] text-white hover:bg-red-700 shadow-red-glow border border-red-400/30',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 shadow-none',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
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
