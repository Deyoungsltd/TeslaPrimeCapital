import React from 'react';

/**
 * TeslaPrimeCapital Original Brand Mark (`TeslaLogo`).
 *
 * Upward-pointing winged blade monogram: two angular facets meeting above a
 * grounded stem — deliberately distinct geometry from any third-party
 * trademark while holding the stark aerospace-grade minimalism of the brand
 * system. Rendered as pure inline SVG for pixel-perfect output at any size.
 */
export const TeslaLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; showSub?: boolean }> = ({ size = 'md', showSub = true }) => {
  const scales = {
    sm: { badge: 'h-8 w-8 rounded-lg', icon: 'h-[18px] w-[18px]', word: 'text-sm tracking-[0.35em]', sub: 'text-[7px]' },
    md: { badge: 'h-10 w-10 rounded-xl', icon: 'h-[22px] w-[22px]', word: 'text-lg tracking-[0.38em]', sub: 'text-[8px]' },
    lg: { badge: 'h-12 w-12 rounded-xl', icon: 'h-7 w-7', word: 'text-2xl tracking-[0.4em]', sub: 'text-[9px]' },
  };
  const s = scales[size];

  return (
    <div className="inline-flex items-center gap-3.5 select-none">
      <div className={`flex ${s.badge} items-center justify-center border border-[#2C354C] bg-[#0A0D14] shadow-tesla`}>
        <svg className={s.icon} viewBox="0 0 32 32" fill="none" aria-hidden="true">
          {/* Wing facets */}
          <path d="M4.5 8.5 L16 4 L27.5 8.5 L19.5 11.5 L12.5 11.5 Z" fill="#F87171" />
          {/* Grounded stem */}
          <path d="M12.5 11.5 L19.5 11.5 L19.5 28 L12.5 28 Z" fill="#DC2626" />
        </svg>
      </div>
      <div className="flex flex-col justify-center">
        <span className={`${s.word} font-extrabold text-white uppercase font-sans leading-none`}>
          Tesla
        </span>
        {showSub && (
          <span className={`${s.sub} mt-1 font-mono font-bold uppercase tracking-[0.42em] text-[#EF4444] leading-none`}>
            Prime Capital
          </span>
        )}
      </div>
    </div>
  );
};
