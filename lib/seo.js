export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.smartwatchtimeline.com').replace(/\/$/, '');

export function absoluteUrl(path = '') {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export function ogDefaults(path = '') {
  return {
    url: absoluteUrl(path),
    siteName: 'SmartwatchTimeline',
    type: 'website',
    locale: 'en_US',
    images: [{ url: absoluteUrl('/og-image.png'), width: 1200, height: 630, alt: 'SmartwatchTimeline' }],
  };
}

export function canonicalFor(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return { alternates: { canonical: cleanPath } };
}

export function buildProductJsonLd(watch, brand, productLinks = []) {
  const prices = productLinks.map((l) => Number(l.price)).filter((p) => Number.isFinite(p) && p > 0);
  const currencies = [...new Set(productLinks.map((l) => l.currency).filter(Boolean))];
  const offers = prices.length
    ? {
        '@type': 'AggregateOffer',
        priceCurrency: currencies.length === 1 ? currencies[0] : (productLinks[0]?.currency || 'USD'),
        lowPrice: Math.min(...prices),
        highPrice: Math.max(...prices),
        offerCount: productLinks.length,
      }
    : undefined;

  const additionalProperty = [
    ['Battery life', watch.battery_life_h ? `${watch.battery_life_h} h` : null],
    ['Weight', watch.weight_g ? `${watch.weight_g} g` : null],
    ['Case size', watch.case_size_mm ? `${watch.case_size_mm} mm` : null],
    ['Water rating', watch.water_rating],
    ['GPS', watch.gps ? 'Yes' : 'No'],
    ['Cellular', watch.cellular ? 'Yes' : 'No'],
    ['ECG', watch.ecg ? 'Yes' : 'No'],
    ['Blood oxygen', watch.blood_oxygen ? 'Yes' : 'No'],
    ['NFC payments', watch.nfc_payments ? 'Yes' : 'No'],
    ['Always-on display', watch.always_on_display ? 'Yes' : 'No'],
  ].filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([name, value]) => ({ '@type': 'PropertyValue', name, value: String(value) }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: watch.name,
    url: absoluteUrl(`/smartwatches/${watch.id}`),
    sku: watch.id,
    brand: { '@type': 'Brand', name: brand?.name || watch.brand_id },
    image: watch.image_url ? [absoluteUrl(watch.image_url)] : undefined,
    description: watch.tagline,
    releaseDate: watch.release_date || undefined,
    category: 'Smartwatch',
    ...(additionalProperty.length ? { additionalProperty } : {}),
    ...(offers ? { offers } : {}),
  };
}

export function buildBreadcrumbJsonLd(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: absoluteUrl(item.url) } : {}),
    })),
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
