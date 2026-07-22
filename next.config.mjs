/** @type {import('next').NextConfig} */

/**
 * Content-Security-Policy.
 * Production: strict allowlist covering first-party code plus the two
 * sanctioned third-party surfaces — TradingView embeds (scripts, frames,
 * symbol logos, websocket feeds) and the Smartsupp live-chat stack.
 * Development additionally permits 'unsafe-eval' (required by HMR) and skips
 * request upgrades so localhost stays frictionless.
 */
const buildContentSecurityPolicy = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://s3.tradingview.com https://www.tradingview.com https://www.smartsuppchat.com https://*.smartsupp.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://*.tradingview.com https://s3-symbol-logo.tradingview.com https://*.smartsupp.com https://www.smartsuppchat.com",
    "font-src 'self' data:",
    "connect-src 'self' https://*.tradingview.com wss://*.tradingview.com https://*.smartsupp.com https://www.smartsuppchat.com wss://*.smartsupp.com wss://www.smartsuppchat.com",
    "frame-src https://www.tradingview.com https://*.tradingview.com https://*.smartsupp.com https://www.smartsuppchat.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  if (!isDev) {
    directives.push('upgrade-insecure-requests');
  }
  return directives.join('; ');
};

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: buildContentSecurityPolicy(),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
