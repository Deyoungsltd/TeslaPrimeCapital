import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@/styles/globals.css';
import { SmartsuppChat } from '@/components/organisms/SmartsuppChat';

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
  title: 'TeslaPrimeCapital — Enterprise Digital Wealth Management',
  description: 'Global institutional-grade digital asset wealth management, multi-currency wallets, and structured algorithmic compounding yield platform.',
  keywords: ['TeslaPrimeCapital', 'Wealth Management', 'Digital Assets', 'Compounding Yield', 'Institutional Capital', 'Multi-Currency Wallet'],
  authors: [{ name: 'TeslaPrimeCapital Engineering Panel' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${interVariable.variable} ${jetBrainsMonoVariable.variable} min-h-screen bg-brand-dark text-gray-100 antialiased selection:bg-brand-gold selection:text-black`}>
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
        <SmartsuppChat />
      </body>
    </html>
  );
}
