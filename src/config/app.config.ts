/**
 * TeslaPrimeCapital — Master Application Configuration
 * Governs platform metadata, supported currencies, i18n locales, and pagination rules.
 */

export interface ICurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  type: 'FIAT' | 'CRYPTO';
  decimals: number;
  minDeposit: string;
  minWithdrawal: string;
}

export const APP_CONFIG = {
  platformName: 'TeslaPrimeCapital',
  tagline: 'Enterprise Digital Wealth Management & Algorithmic Capital Allocation',
  supportEmail: 'support@teslaprimecapital.com',
  defaultCurrency: 'USD',
  supportedLocales: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'] as const,
  defaultLocale: 'en',
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  supportedCurrencies: [
    {
      code: 'USD',
      name: 'United States Dollar',
      symbol: '$',
      type: 'FIAT',
      decimals: 2,
      minDeposit: '100.00',
      minWithdrawal: '50.00'
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      type: 'FIAT',
      decimals: 2,
      minDeposit: '100.00',
      minWithdrawal: '50.00'
    },
    {
      code: 'GBP',
      name: 'British Pound Sterling',
      symbol: '£',
      type: 'FIAT',
      decimals: 2,
      minDeposit: '100.00',
      minWithdrawal: '50.00'
    },
    {
      code: 'JPY',
      name: 'Japanese Yen',
      symbol: '¥',
      type: 'FIAT',
      decimals: 0,
      minDeposit: '15000',
      minWithdrawal: '7500'
    },
    {
      code: 'BTC',
      name: 'Bitcoin',
      symbol: '₿',
      type: 'CRYPTO',
      decimals: 8,
      minDeposit: '0.00150000',
      minWithdrawal: '0.00100000'
    },
    {
      code: 'ETH',
      name: 'Ethereum',
      symbol: 'Ξ',
      type: 'CRYPTO',
      decimals: 8,
      minDeposit: '0.02500000',
      minWithdrawal: '0.01500000'
    },
    {
      code: 'USDT',
      name: 'Tether USD (ERC20/TRC20)',
      symbol: '₮',
      type: 'CRYPTO',
      decimals: 6,
      minDeposit: '100.000000',
      minWithdrawal: '50.000000'
    },
    {
      code: 'USDC',
      name: 'USD Coin',
      symbol: '$',
      type: 'CRYPTO',
      decimals: 6,
      minDeposit: '100.000000',
      minWithdrawal: '50.000000'
    }
  ] as readonly ICurrencyConfig[]
} as const;

export type SupportedLocale = typeof APP_CONFIG.supportedLocales[number];
