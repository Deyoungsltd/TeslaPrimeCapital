import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import '@/styles/globals.css';
import { SITE_CONFIG, ACTIVE_SOCIAL_LINKS } from '@/config/site.config';
import { JsonLd } from '@/components/atoms/JsonLd';

/**
 * Self-hosted variable font pipeline (next/font/local).
 * Binaries are committed to `src/fonts/` so the build has zero network
 * dependency: Next.js copies them into `/_next/static/media/`, preloads
 * them with `font-display: swap`, and injects `--font-inter` /
 * `--font-jetbrains-mono` CSS variables onto <body>, which the Tailwind
 * `font-sans` / `font-mono` stacks resolve everywhere on the platform.
 */
const interVariable = localFont({
  src: [{ path: '../fonts/InterVariable.woff2', style: 'normal' }],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const jetBrainsMonoVariable = localFont({
  src: [{ path: '../fonts/JetBrainsMonoVariable.woff2', style: 'normal' }],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: 'TeslaPrimeCapital — Enterprise Digital Wealth Management',
    template: '%s — TeslaPrimeCapital',
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  category: 'finance',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    locale: 'en_US',
    title: 'TeslaPrimeCapital — Enterprise Digital Wealth Management',
    description: SITE_CONFIG.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TeslaPrimeCapital — Enterprise Digital Wealth Management',
    description: SITE_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  /**
   * Explicit icon stack (deterministic — no file-convention resolution):
   * crisp SVG monogram for modern browsers, rasterized PNGs as universal
   * fallback and for the iOS home screen. Binaries are minted by
   * scripts/generate-brand-icons.mjs into public/icons/.
   */
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/icons/icon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [{ url: '/icons/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  formatDetection: { telephone: false, email: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: SITE_CONFIG.themeColor,
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${interVariable.variable} ${jetBrainsMonoVariable.variable} min-h-screen bg-brand-dark text-gray-100 antialiased selection:bg-brand-gold selection:text-black`}>
        {/* Entity graph: Organization + WebSite, rendered into the initial HTML
            so crawlers resolve the brand entity without executing a line of JS. */}
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': `${SITE_CONFIG.url}/#organization`,
                name: SITE_CONFIG.name,
                url: SITE_CONFIG.url,
                description: SITE_CONFIG.description,
                logo: {
                  '@type': 'ImageObject',
                  url: `${SITE_CONFIG.url}/icons/icon-512.png`,
                  width: 512,
                  height: 512,
                },
                ...(ACTIVE_SOCIAL_LINKS.length > 0
                  ? { sameAs: ACTIVE_SOCIAL_LINKS.map((s) => s.url) }
                  : {}),
              },
              {
                '@type': 'WebSite',
                '@id': `${SITE_CONFIG.url}/#website`,
                url: SITE_CONFIG.url,
                name: SITE_CONFIG.name,
                description: SITE_CONFIG.description,
                publisher: { '@id': `${SITE_CONFIG.url}/#organization` },
              },
            ],
          }}
        />
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
