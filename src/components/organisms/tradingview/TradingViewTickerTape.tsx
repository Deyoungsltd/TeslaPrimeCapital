'use client';

import React from 'react';
import { TradingViewWidget } from './TradingViewWidget';

const SCRIPT_SRC = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';

/**
 * Ticker Tape configuration: a continuous institutional quote rail pinned to
 * the platform's core market context — Tesla equity, the Nasdaq 100 index,
 * and the digital-asset settlement pairs supported by the wallet rails.
 * Rendered in dark theme with symbol logos enabled.
 */
const CONFIG: Record<string, unknown> = {
  symbols: [
    { proName: 'NASDAQ:TSLA', title: 'Tesla, Inc.' },
    { proName: 'NASDAQ:NDX', title: 'Nasdaq 100' },
    { proName: 'BINANCE:BTCUSDT', title: 'Bitcoin' },
    { proName: 'BINANCE:ETHUSDT', title: 'Ethereum' },
    { proName: 'FX:EURUSD', title: 'EUR / USD' },
  ],
  showSymbolLogo: true,
  colorTheme: 'dark',
  isTransparent: false,
  displayMode: 'adaptive',
  width: '100%',
  height: '100%',
  locale: 'en',
};

export const TradingViewTickerTape: React.FC<{ height?: number }> = ({ height = 46 }) => {
  return <TradingViewWidget scriptSrc={SCRIPT_SRC} config={CONFIG} height={height} />;
};
