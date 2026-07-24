'use client';

/**
 * Announcement Ribbon (`AnnouncementBar.tsx`)
 * A single, thin banner pinned to the very top of the sticky marketing header.
 * Entirely CMS-governed through the Brand Library text slots:
 *   site.announcement.message  — empty default hides the ribbon completely
 *   site.announcement.ctaLabel — optional link text
 *   site.announcement.ctaHref  — optional link target (validated client-side)
 * Dismissal is remembered per message content: editing the ribbon brings it
 * back for everyone, which is exactly the behavior advisories need.
 */

import React, { useEffect, useState } from 'react';
import { useMediaManifest } from '@/components/providers/MediaProvider';
import { TEXT_SLOT_MAP } from '@/content/media-registry';

const DISMISS_KEY = 'tpc.announcement.dismissed';

function resolveSlotValue(texts: Record<string, { value: string } | undefined>, key: string): string {
  const slot = TEXT_SLOT_MAP[key];
  const raw = slot ? texts[key]?.value ?? slot.defaultValue : '';
  return (raw ?? '').trim();
}

function isSafeHref(href: string): boolean {
  return href.startsWith('/') || href.startsWith('https://');
}

export const AnnouncementBar: React.FC = () => {
  const { texts } = useMediaManifest();
  const [dismissed, setDismissed] = useState(false);

  const message = resolveSlotValue(texts, 'site.announcement.message');
  const ctaLabel = resolveSlotValue(texts, 'site.announcement.ctaLabel');
  const ctaHref = resolveSlotValue(texts, 'site.announcement.ctaHref');

  useEffect(() => {
    if (!message) {
      setDismissed(false);
      return;
    }
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === message);
    } catch {
      setDismissed(false);
    }
  }, [message]);

  if (!message || dismissed) return null;

  const showCta = ctaLabel.length > 0 && isSafeHref(ctaHref);

  return (
    <div role="status" className="border-b border-[#2C354C] bg-[#10141F]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-6 py-2 sm:px-12">
        <svg className="h-[14px] w-[14px] flex-shrink-0 text-[#EF4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
        <p className="truncate text-center text-[12px] font-medium leading-snug text-gray-200 sm:whitespace-normal">
          {message}
        </p>
        {showCta && (
          <a
            href={ctaHref}
            className="flex-shrink-0 rounded-md border border-[#EF4444]/50 px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#EF4444] transition-colors hover:bg-[#EF4444]/10"
          >
            {ctaLabel}
          </a>
        )}
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => {
            try {
              sessionStorage.setItem(DISMISS_KEY, message);
            } catch {}
            setDismissed(true);
          }}
          className="ml-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-200"
        >
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};
