export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.smartwatchtimeline.com').replace(/\/$/, '');

export function absoluteUrl(path = '') {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export function ogDefaults(path = '') {
  return {
    url: absoluteUrl(path),
    siteName: 'SmartwatchTimeline',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: absoluteUrl('/og-image.png'),
        width: 1200,
        height: 630,
        alt: 'SmartwatchTimeline',
      },
    ],
  };
}

// English-only, so canonical is just a self-referencing absolute path — no
// hreflang alternates needed. Kept as a small helper (rather than inlining
// `alternates: { canonical: path }` everywhere) so a future addition of a
// second language doesn't mean touching every single page file again.
export function canonicalFor(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return { alternates: { canonical: cleanPath } };
}

// Product rich-snippet JSON-LD, built from a watch row + its vendor links
// (see lib/queries.js: getProductLinks). Using the lowest current vendor
// price as `lowPrice` when more than one vendor is linked keeps this
// accurate for an AggregateOffer rather than picking one vendor arbitrarily.
export function buildProductJsonLd(watch, brand, productLinks = []) {
  const prices = productLinks.map((l) => Number(l.price)).filter((p) => Number.isFinite(p) && p > 0);
  const offers = prices.length
    ? {
        '@type': 'AggregateOffer',
        priceCurrency: productLinks[0]?.currency || 'USD',
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: productLinks.length,
      }
    : undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: watch.name,
    brand: { '@type': 'Brand', name: brand?.name || watch.brand_id },
    image: watch.image_url ? absoluteUrl(watch.image_url) : undefined,
    description: watch.tagline,
    ...(offers ? { offers } : {}),
  };
}

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
