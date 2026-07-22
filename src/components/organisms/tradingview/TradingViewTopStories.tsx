'use client';

import React from 'react';
import { TradingViewWidget } from './TradingViewWidget';

const SCRIPT_SRC = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';

/**
 * Top Stories / Timeline configuration. `feedMode: "symbol"` locks the news
 * stream to Tesla, Inc. headlines; transparent background lets the parent
 * midnight-blue panel (`#111520`) surface through the widget frame.
 */
const CONFIG: Record<string, unknown> = {
  feedMode: 'symbol',
  symbol: 'NASDAQ:TSLA',
  colorTheme: 'dark',
  isTransparent: true,
  displayMode: 'regular',
  width: '100%',
  height: '100%',
  locale: 'en',
};

export const TradingViewTopStories: React.FC<{ height?: number }> = ({ height = 480 }) => {
  return (
    <TradingViewWidget
      scriptSrc={SCRIPT_SRC}
      config={CONFIG}
      height={height}
      attributionHref="https://www.tradingview.com/symbols/NASDAQ-TSLA/news/"
      attributionText="NASDAQ:TSLA History"
    />
  );
};
