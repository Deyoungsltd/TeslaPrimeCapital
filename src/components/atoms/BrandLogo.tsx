'use client';

/**
 * Brand Logo Atom (`BrandLogo.tsx`)
 *
 * Renders the built-in vector lockup by default; when an admin publishes a
 * logo through the Brand Library (`brand.logo` slot), the uploaded artwork
 * takes over everywhere this atom is used — header, footer, both consoles —
 * with no code change and no layout shift risk (fixed intrinsic height).
 */
import React from 'react';
import { TeslaLogo } from '@/components/atoms/TeslaLogo';
import { useMediaManifest } from '@/components/providers/MediaProvider';

export const BrandLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const { assets } = useMediaManifest();
  const override = assets['brand.logo'];
  const heightClass = size === 'lg' ? 'h-11' : size === 'sm' ? 'h-8' : 'h-9';

  if (override?.isOverride) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- admin-supplied artwork; optimizer is bypassed intentionally to preserve any aspect
      <img src={override.url} alt={override.alt} className={`${heightClass} w-auto object-contain`} />
    );
  }
  return <TeslaLogo size={size} />;
};
