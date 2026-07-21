import React from 'react';

export const TeslaLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; showTag?: boolean }> = ({ size = 'md', showTag = true }) => {
  const sizes = {
    sm: 'text-lg tracking-[0.3em]',
    md: 'text-2xl tracking-[0.35em]',
    lg: 'text-3xl tracking-[0.4em]',
  };

  return (
    <div className="inline-flex items-center gap-3 select-none">
      {/* Sleek Red Tesla Emblem Icon */}
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EF4444] text-white shadow-red-glow font-mono font-extrabold text-base">
        T
      </div>
      <div className="flex items-center gap-2">
        <span className={`${sizes[size]} font-extrabold text-white uppercase font-sans`}>
          T E S L A
        </span>
        {showTag && (
          <span className="rounded border border-[#2A2338] bg-[#16131F] px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-gray-300 shadow-sm">
            Equity Pro
          </span>
        )}
      </div>
    </div>
  );
};
