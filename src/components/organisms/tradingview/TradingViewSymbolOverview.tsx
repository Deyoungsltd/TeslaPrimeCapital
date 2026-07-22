'use client';

import React from 'react';
import { TradingViewWidget } from './TradingViewWidget';

const SCRIPT_SRC = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';

/**
 * Symbol Overview configuration ("Stock" panel): large live price header with
 * price-and-percent change readout above the blue area sparkline (`#2962FF`
 * dark-theme default), date-range tabs `1D / 1m / 3m / 12m / 60m / All`.
 */
const CONFIG: Record<string, unknown> = {
  symbols: [['Tesla, Inc.', 'NASDAQ:TSLA|1D']],
  chartOnly: false,
  width: '100%',
  height: '100%',
  locale: 'en',
  colorTheme: 'dark',
  autosize: true,
  showVolume: false,
  showMA: false,
  hideDateRanges: false,
  hideMarketStatus: false,
  hideSymbolLogo: false,
  scalePosition: 'right',
  scaleMode: 'Normal',
  fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
  fontSize: '10',
  noTimeScale: false,
  valuesTracking: '1',
  changeMode: 'price-and-percent',
  chartType: 'area',
  lineWidth: 2,
  lineType: 0,
  dateRanges: ['1d|1', '1m|1D', '3m|60', '12m|1D', '60m|1W', 'all|1M'],
};

export const TradingViewSymbolOverview: React.FC<{ height?: number }> = ({ height = 360 }) => {
  return (
    <TradingViewWidget
      scriptSrc={SCRIPT_SRC}
      config={CONFIG}
      height={height}
      attributionHref="https://www.tradingview.com/symbols/NASDAQ-TSLA/"
      attributionText="NASDAQ:TSLA Rates"
    />
  );
};
