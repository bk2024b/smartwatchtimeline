import { getAllWatches, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';
import TimelineExplorer from '@/components/TimelineExplorer';

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'Smartwatch Timeline | SmartwatchTimeline',
    description: 'Explore the complete chronological history of smartwatches by year, brand, series, and key hardware features.',
    ...canonicalFor('/timeline'),
  };
}

export default async function TimelinePage() {
  const [watches, brands] = await Promise.all([getAllWatches(), getBrands()]);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Smartwatch Timeline',
    url: `${SITE_URL}/timeline`,
    numberOfItems: watches.length,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-5xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Timeline / chronology</div>
        <h1 className="font-display font-bold text-[34px] sm:text-[52px] leading-tight mb-4">The Full Smartwatch Timeline</h1>
        <p className="text-dim text-[15px] leading-7 max-w-2xl mb-10">{watches.length} models tracked across generations. Search, filter, and follow the evolution of smartwatch hardware over time.</p>
        <TimelineExplorer watches={watches} brands={brands} />
      </article>
    </>
  );
}
