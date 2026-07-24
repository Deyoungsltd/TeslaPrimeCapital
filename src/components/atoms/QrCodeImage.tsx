'use client';

/**
 * QR Code Atom (`QrCodeImage.tsx`)
 * Renders a scannable QR for the exact treasury address shown beside it —
 * generated locally in the browser via the `qrcode` package (no external
 * image service ever sees the address). Regenerates whenever the text or
 * visual size changes.
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export interface IQrCodeImageProps {
  /** The exact payload the QR encodes (e.g. a treasury deposit address). */
  text: string;
  /** Pixel width of the rendered raster. */
  size?: number;
  /** Accessible description of what the code contains. */
  label: string;
  className?: string;
}

export const QrCodeImage: React.FC<IQrCodeImageProps> = ({ text, size = 160, label, className }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: size * 2, // retina density; displayed at `size`
      color: { dark: '#0B0F19', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [text, size]);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={label}
        className={`flex items-center justify-center rounded-lg border border-[#2C354C] bg-[#080A0F] p-3 text-center font-mono text-[9px] uppercase tracking-widest text-gray-600 ${className ?? ''}`}
        style={{ width: size, height: size }}
      >
        QR unavailable — copy the address text instead
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-[#2C354C] bg-white p-2 ${className ?? ''}`} style={{ width: size + 16, height: size + 16 }}>
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} width={size} height={size} alt={label} className="block" />
      ) : (
        <div className="h-full w-full animate-pulse rounded bg-gray-200" aria-hidden="true" />
      )}
    </div>
  );
};
