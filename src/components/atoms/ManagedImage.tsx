'use client';

/**
 * TeslaPrimeCapital — CMS-Managed Image Atom (`ManagedImage.tsx`)
 *
 * Renders a registered media slot: committed default art immediately, then the
 * admin's Cloudinary override the moment the MediaProvider manifest resolves —
 * with zero layout shift when the caller sizes the container (fill mode) as on
 * every marketing surface. Falls back through SafeImage so a broken override
 * still degrades to studio art instead of a broken-image glyph.
 */
import React from 'react';
import { SafeImage, type ISafeImageProps } from '@/components/atoms/SafeImage';
import { useMediaManifest } from '@/components/providers/MediaProvider';
import { MEDIA_SLOT_MAP } from '@/content/media-registry';

export interface IManagedImageProps extends Omit<ISafeImageProps, 'src' | 'alt'> {
  /** Registry slot key, e.g. 'home.hero', 'plan.plan-starter-fixed'. */
  slotKey: string;
  /** Accessibility override; defaults to slot altText. */
  alt?: string;
}

export const ManagedImage: React.FC<IManagedImageProps> = ({ slotKey, alt, ...rest }) => {
  const { assets } = useMediaManifest();
  const slot = MEDIA_SLOT_MAP[slotKey];
  const manifestAsset = slot ? assets[slotKey] : undefined;

  const src = manifestAsset?.url ?? slot?.defaultSrc ?? '/branding/car-bronze.jpg';
  const resolvedAlt = alt ?? manifestAsset?.alt ?? slot?.defaultAlt ?? 'TeslaPrimeCapital brand imagery';

  return <SafeImage src={src} alt={resolvedAlt} fallbackSrc={slot?.defaultSrc} {...rest} />;
};
