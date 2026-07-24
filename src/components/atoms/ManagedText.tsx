'use client';

/**
 * CMS-Managed Text Atom (`ManagedText.tsx`)
 *
 * Renders a registered text slot: the registry default immediately (so
 * server-rendered HTML is always complete and indexable), then the admin's
 * override once the MediaProvider manifest resolves. Used for the leadership
 * identity lines — every other copy on the platform stays in source control.
 */
import React from 'react';
import { useMediaManifest } from '@/components/providers/MediaProvider';
import { TEXT_SLOT_MAP } from '@/content/media-registry';

export interface IManagedTextProps {
  slotKey: string;
  /** Element to render as — defaults to inline <span>. */
  as?: 'span' | 'p' | 'strong' | 'em' | 'h1' | 'h2' | 'h3' | 'div';
  className?: string;
}

export const ManagedText: React.FC<IManagedTextProps> = ({ slotKey, as = 'span', className }) => {
  const { texts } = useMediaManifest();
  const slot = TEXT_SLOT_MAP[slotKey];
  const value = slot ? texts[slotKey]?.value ?? slot.defaultValue : '';
  return React.createElement(as, { className }, value);
};
