'use client';

import React, { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

const DEFAULT_FALLBACK_SRC = '/branding/car-bronze.jpg';

export interface ISafeImageProps extends Omit<ImageProps, 'onError'> {
  /** Asset rendered when the primary source fails to load. */
  fallbackSrc?: string;
}

/**
 * Resilient Brand Image Atom.
 *
 * Wraps `next/image` so every platform image benefits from the optimization
 * pipeline (responsive `srcset` generation, AVIF/WebP content negotiation,
 * native lazy-loading) while preserving the long-standing UI contract that a
 * failed asset degrades to studio-grade fallback photography instead of a
 * broken-image glyph.
 *
 * Sources that cannot traverse the optimizer — `blob:` object URLs from
 * device upload previews and `data:` URIs — short-circuit to a plain `<img>`
 * render, and the failure fallback does the same so it never re-enters the
 * optimizer loop. In `fill` mode the fallback absolutely stretches to the
 * positioned parent exactly like the optimized element does.
 */
export const SafeImage: React.FC<ISafeImageProps> = ({
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  src,
  alt,
  fill,
  className,
  style,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);

  const isLocalOrRemote = typeof src === 'string' ? /^(https?:\/\/|\/)/.test(src) : true;
  const renderPlain = failed || !isLocalOrRemote;

  if (renderPlain) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={failed ? fallbackSrc : (src as string)}
        alt={alt}
        className={className}
        style={
          fill
            ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }
            : style
        }
        onError={
          !failed
            ? (event) => {
                if (event.currentTarget.src !== fallbackSrc) setFailed(true);
              }
            : undefined
        }
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
};
