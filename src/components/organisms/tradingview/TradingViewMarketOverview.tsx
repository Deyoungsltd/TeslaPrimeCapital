'use client';

import React from 'react';
import { TradingViewWidget } from './TradingViewWidget';

const SCRIPT_SRC = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';

/**
 * Market Overview configuration: single `Equities` tab pinned to Tesla, Inc.
 * over a 12-month date range. Electric-blue plot line (`rgba(41, 98, 255)`)
 * with a 12% under-fill that fades to transparent at the baseline, midnight
 * grid lines (`#1E2433`), and TradingView's dark scale typography.
 */
const CONFIG: Record<string, unknown> = {
  colorTheme: 'dark',
  dateRange: '12M',
  showChart: true,
  locale: 'en',
  width: '100%',
  height: '100%',
  largeChartUrl: '',
  isTransparent: true,
  showSymbolLogo: true,
  showFloatingTooltip: true,
  plotLineColorGrowing: 'rgba(41, 98, 255, 1)',
  plotLineColorFalling: 'rgba(41, 98, 255, 1)',
  gridLineColor: 'rgba(30, 36, 51, 0.5)',
  scaleFontColor: 'rgba(134, 137, 147, 1)',
  belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
  belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
  belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
  belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
  symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
  tabs: [
    {
      title: 'Equities',
      originalTitle: 'Equities',
      symbols: [{ s: 'NASDAQ:TSLA', d: 'Tesla, Inc.' }],
    },
  ],
};

export const TradingViewMarketOverview: React.FC<{ height?: number }> = ({ height = 420 }) => {
  return (
    <TradingViewWidget
      scriptSrc={SCRIPT_SRC}
      config={CONFIG}
      height={height}
      attributionHref="https://www.tradingview.com/markets/"
      attributionText="Financial Markets"
    />
  );
};
