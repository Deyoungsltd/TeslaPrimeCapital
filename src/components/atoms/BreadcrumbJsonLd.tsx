import React from 'react';
import { SITE_CONFIG } from '@/config/site.config';
import { JsonLd } from '@/components/atoms/JsonLd';

/**
 * BreadcrumbList structured data — lets search engines render the page's
 * position in the site hierarchy directly in results.
 */
export const BreadcrumbJsonLd: React.FC<{ items: Array<{ name: string; path: string }> }> = ({ items }) => (
  <JsonLd
    data={{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${SITE_CONFIG.url}${item.path}`,
      })),
    }}
  />
);
