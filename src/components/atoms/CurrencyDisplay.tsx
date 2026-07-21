import React from 'react';
import { DecimalUtil } from '@/utils/decimal.util';

export interface ICurrencyDisplayProps {
  amount: string | number;
  currency: string;
  showSymbol?: boolean;
  className?: string;
}

export const CurrencyDisplay: React.FC<ICurrencyDisplayProps> = ({
  amount,
  currency,
  showSymbol = true,
  className = '',
}) => {
  const isFiat = ['USD', 'EUR', 'GBP', 'JPY'].includes(currency.toUpperCase());
  const formatted = isFiat
    ? DecimalUtil.formatFiat(amount.toString())
    : DecimalUtil.formatCrypto(amount.toString());

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    BTC: '₿',
    ETH: 'Ξ',
    USDT: '₮',
    USDC: '$',
  };

  const symbol = symbols[currency.toUpperCase()] || '';

  return (
    <span className={`font-mono font-bold tracking-tight ${className}`}>
      {showSymbol && symbol && <span className="mr-0.5 opacity-80">{symbol}</span>}
      {formatted} <span className="text-xs font-sans font-normal uppercase opacity-75">{currency}</span>
    </span>
  );
};
