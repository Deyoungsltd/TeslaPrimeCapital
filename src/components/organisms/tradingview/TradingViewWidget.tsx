'use client';

import React, { useEffect, useRef } from 'react';

export interface ITradingViewWidgetProps {
  /** Absolute URL of the official TradingView external-embedding script. */
  scriptSrc: string;
  /**
   * Widget configuration block. Must be declared as a module-level constant
   * by the caller so its reference stays stable across renders (the vendor
   * script streams it from the script tag's inline JSON payload).
   */
  config: Record<string, unknown>;
  /** Explicit pixel height of the rendered widget frame. */
  height: number;
  /** Attribution hyperlink target (official TradingView copyright pattern). */
  attributionHref?: string;
  /** Blue anchor text inside the attribution line (e.g. `NASDAQ:TSLA Chart`). */
  attributionText?: string;
}

/**
 * Generic TradingView External-Embedding Widget Renderer.
 *
 * Implements the official React integration protocol documented at
 * tradingview.com/widget-docs: the `<script>` element is created
 * dynamically, its `innerHTML` carries the JSON configuration payload, and
 * it is appended inside the `.tradingview-widget-container` element so the
 * vendor loader mounts its iframe into the sibling `__widget` div.
 *
 * The effect cleanup disposes the injected iframe, which prevents duplicate
 * widget mounts under React StrictMode's double-effect invocation in
 * development builds.
 */
export const TradingViewWidget: React.FC<ITradingViewWidgetProps> = ({
  scriptSrc,
  config,
  height,
  attributionHref,
  attributionText,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const widgetArea = widgetAreaRef.current;
    if (!container || !widgetArea) return;

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);

    return () => {
      if (script.parentNode === container) {
        container.removeChild(script);
      }
      widgetArea.innerHTML = '';
    };
  }, [scriptSrc, config]);

  return (
    <div ref={containerRef} className="tradingview-widget-container w-full">
      <div
        ref={widgetAreaRef}
        className="tradingview-widget-container__widget w-full"
        style={{ height }}
      />
      {attributionHref && attributionText && (
        <div className="tradingview-widget-copyright pt-3 text-center text-[11px] font-semibold text-gray-500">
          <a
            href={attributionHref}
            rel="noopener nofollow"
            target="_blank"
            className="text-[#3E6AE1] hover:text-white transition"
          >
            {attributionText}
          </a>
          <span> By TradingView</span>
        </div>
      )}
    </div>
  );
};
