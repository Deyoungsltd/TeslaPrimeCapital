'use client';

import React from 'react';
import { TradingViewWidget } from './TradingViewWidget';

const SCRIPT_SRC = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';

/**
 * Advanced Real-Time Chart configuration (`theme: dark`, obsidian background
 * `#080A0F`, midnight grid `#1E2433`). Defaults to the 1-minute candlestick
 * interval with the drawing toolbar and symbol search enabled, matching the
 * reference `Tesla, Inc.` full workstation chart.
 */
const CONFIG: Record<string, unknown> = {
  autosize: true,
  symbol: 'NASDAQ:TSLA',
  interval: '1',
  timezone: 'Etc/UTC',
  theme: 'dark',
  style: '1',
  locale: 'en',
  backgroundColor: 'rgba(8, 10, 15, 1)',
  gridColor: 'rgba(30, 36, 51, 0.35)',
  hide_top_toolbar: false,
  hide_side_toolbar: false,
  hide_volume: false,
  allow_symbol_change: true,
  save_image: false,
  calendar: false,
  withdateranges: true,
  support_host: 'https://www.tradingview.com',
};

export const TradingViewAdvancedChart: React.FC<{ height?: number }> = ({ height = 480 }) => {
  return (
    <TradingViewWidget
      scriptSrc={SCRIPT_SRC}
      config={CONFIG}
      height={height}
      attributionHref="https://www.tradingview.com/symbols/NASDAQ-TSLA/"
      attributionText="NASDAQ:TSLA Chart"
    />
  );
};
