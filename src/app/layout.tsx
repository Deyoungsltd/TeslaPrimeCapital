import type { Metadata } from 'next';
import '@/styles/globals.css';

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
      <body className="min-h-screen bg-brand-dark text-gray-100 antialiased selection:bg-brand-gold selection:text-black">
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
