import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'electric';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<IButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black rounded-md disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-white text-black hover:bg-gray-200 shadow-sm font-bold',
    electric: 'bg-brand-blue text-white hover:bg-brand-blueHover shadow-md font-bold',
    secondary: 'bg-[#18181b] text-gray-200 border border-[#27272a] hover:bg-[#222226] hover:border-gray-500 shadow-sm',
    outline: 'border border-gray-600 bg-transparent text-white hover:border-white hover:bg-white/10 tracking-wide',
    danger: 'bg-brand-rose text-white hover:bg-red-700 shadow-md',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
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
