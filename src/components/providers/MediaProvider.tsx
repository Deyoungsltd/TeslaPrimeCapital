'use client';

/**
 * TeslaPrimeCapital — Brand Media Provider (`MediaProvider.tsx`)
 *
 * Fetches the public media manifest (/api/v1/media) once per session and
 * exposes the slot→URL map through React context. Rendering is never blocked:
 * children paint immediately with committed default art, and any admin
 * override swaps in as soon as the manifest resolves. Failures (offline,
 * API down) are silent by design — default art is always a valid render.
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface IMediaManifestAsset {
  url: string;
  alt: string;
  isOverride: boolean;
  updatedAt?: string;
}

export type TMediaManifest = Record<string, IMediaManifestAsset>;

interface IMediaContextValue {
  assets: TMediaManifest;
  /** Force a manifest reload (used by the Brand Library after an override). */
  refresh: () => void;
}

const MediaContext = createContext<IMediaContextValue>({ assets: {}, refresh: () => {} });

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<TMediaManifest>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/media', { cache: 'no-store' });
      if (!res.ok) return;
      const body = await res.json();
      if (body?.success && body?.data?.assets) {
        setAssets(body.data.assets);
      }
    } catch {
      // default art stays on screen — nothing to surface to the user
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return <MediaContext.Provider value={{ assets, refresh: load }}>{children}</MediaContext.Provider>;
}

export function useMediaManifest(): IMediaContextValue {
  return useContext(MediaContext);
}
