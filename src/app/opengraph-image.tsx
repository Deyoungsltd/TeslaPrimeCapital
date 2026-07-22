import { ImageResponse } from 'next/og';
import { SITE_CONFIG } from '@/config/site.config';

/**
 * Default Open Graph Card — auto-wired to `og:image` / `twitter:image` by
 * Next.js file convention and inherited by every route that does not define
 * its own. Rendered at build time by the ImageResponse engine, so every
 * shared referral link unfurls into a proper branded card in chat apps and
 * social feeds.
 */
export const runtime = 'nodejs';
export const alt = 'TeslaPrimeCapital — Enterprise Digital Wealth Management';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#080A0F',
          backgroundImage:
            'radial-gradient(circle at 82% 18%, rgba(239,68,68,0.22), transparent 42%), radial-gradient(circle at 12% 88%, rgba(41,98,255,0.14), transparent 45%)',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Brand monogram — winged blade in pure CSS box geometry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <div
            style={{
              width: '104px',
              height: '104px',
              borderRadius: '22px',
              backgroundColor: '#0A0D14',
              border: '2px solid #2C354C',
              display: 'flex',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '22px',
                top: '30px',
                width: '36px',
                height: '11px',
                backgroundColor: '#F87171',
                transform: 'rotate(-21deg)',
                transformOrigin: 'right center',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '22px',
                top: '30px',
                width: '36px',
                height: '11px',
                backgroundColor: '#F87171',
                transform: 'rotate(21deg)',
                transformOrigin: 'left center',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '42px',
                top: '38px',
                width: '20px',
                height: '46px',
                backgroundColor: '#DC2626',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '52px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              Tesla
            </span>
            <span
              style={{
                marginTop: '10px',
                fontSize: '22px',
                fontWeight: 700,
                color: '#EF4444',
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              Prime Capital
            </span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            gap: '20px',
          }}
        >
          <span
            style={{
              fontSize: '58px',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.12,
              letterSpacing: '-0.01em',
              maxWidth: '900px',
            }}
          >
            Enterprise digital wealth management.
          </span>
          <span style={{ fontSize: '26px', color: '#9CA3AF', lineHeight: 1.4, maxWidth: '860px' }}>
            Multi-currency wallets. Term-locked structured allocations. Lump-sum settlement
            at 00:00 UTC maturity.
          </span>
        </div>

        {/* Bottom credential strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginTop: '44px',
            paddingTop: '28px',
            borderTop: '2px solid #1E2433',
            fontSize: '19px',
            fontWeight: 700,
            color: '#6B7280',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ width: '34px', height: '4px', backgroundColor: '#EF4444' }} />
          <span>Double-Entry Rails</span>
          <span style={{ color: '#2C354C' }}>/</span>
          <span>8 Settlement Currencies</span>
          <span style={{ color: '#2C354C' }}>/</span>
          <span>AES-256 Vault</span>
          <span style={{ marginLeft: 'auto', color: '#4B5563', letterSpacing: '0.08em', textTransform: 'none', fontWeight: 500 }}>
            {SITE_CONFIG.url.replace(/^https?:\/\//, '')}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
