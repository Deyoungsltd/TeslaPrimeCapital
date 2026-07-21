'use client';

import React from 'react';
import Script from 'next/script';

/**
 * Smartsupp Live Chat Widget Integration.
 *
 * Official installation protocol (docs.smartsupp.com/chat-box/installation):
 * sets the public site key on `window._smartsupp` and asynchronously injects
 * the `smartsuppchat.com/loader.js` bootstrap, which renders the floating
 * chat bubble in the bottom-right corner of every page.
 *
 * The key is a PUBLIC site identifier (it is visible in the page source of
 * every Smartsupp installation) and is supplied at build time via the
 * `NEXT_PUBLIC_SMARTSUPP_KEY` environment variable. When the variable is
 * unset the widget is not rendered at all.
 */
export function SmartsuppChat() {
  const smartsuppKey = process.env.NEXT_PUBLIC_SMARTSUPP_KEY;

  if (!smartsuppKey) {
    return null;
  }

  const installerSnippet = `
var _smartsupp = _smartsupp || {};
_smartsupp.key = ${JSON.stringify(smartsuppKey)};
window.smartsupp||(function(d) {
  var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
  s=d.getElementsByTagName('script')[0];c=d.createElement('script');
  c.type='text/javascript';c.charset='utf-8';c.async=true;
  c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
})(document);
`;

  return (
    <Script id="smartsupp-live-chat" strategy="afterInteractive">
      {installerSnippet}
    </Script>
  );
}
