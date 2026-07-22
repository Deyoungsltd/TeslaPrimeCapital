import React from 'react';

/**
 * JSON-LD Structured-Data Emitter.
 *
 * Renders a schema.org graph as an inert `<script type="application/ld+json">`
 * block. Server-rendered so crawlers receive the full entity graph in the
 * initial HTML payload. The payload is `<`-escaped so the serialized JSON can
 * never break out of the script element.
 */
export const JsonLd: React.FC<{ data: Record<string, unknown> }> = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
);
