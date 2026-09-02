import Link from 'next/link';
import { getAllWatches, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'Timeline | SmartwatchTimeline',
    description: 'The full chronological history of smartwatches, brand by brand.',
    ...canonicalFor('/timeline'),
  };
}

// V1: a straightforward year-grouped chronological list. EarbudsTimeline's
// equivalent page also has an interactive filterable chart (EvolutionExplorer)
// and a brand-comparison chart component — worth porting over once there's
// enough real smartwatch data in the catalog to make them useful; not
// included in this first pass so the scaffold isn't blocked on building
// three chart components against placeholder data.
export default async function TimelinePage() {
  const [watches, brands] = await Promise.all([getAllWatches(), getBrands()]);
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const sorted = [...watches].sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

  const byYear = new Map();
  for (const w of sorted) {
    const year = (w.release_date || '').slice(0, 4) || 'Unknown';
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push(w);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Smartwatch Timeline',
    url: `${SITE_URL}/timeline`,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-4xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Timeline</div>
        <h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">The Full Smartwatch Timeline</h1>
        <p className="text-dim text-[15px] leading-7 max-w-2xl mb-10">{watches.length} models tracked, from the earliest smartwatches to the latest releases.</p>

        <div className="space-y-12">
          {[...byYear.entries()].map(([year, models]) => (
            <section key={year}>
              <h2 className="font-display font-bold text-[24px] mb-4">{year}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {models.map((w) => (
                  <Link key={w.id} href={`/smartwatches/${w.id}`} className="flex items-center justify-between gap-3 bg-panel border border-line rounded-xl px-4 py-3 hover:border-accent transition-colors">
                    <div>
                      <div className="font-mono text-[10px] text-accent uppercase">{brandMap.get(w.brand_id)?.name || w.brand_id}</div>
                      <div className="font-display font-medium text-[15px]">{w.name}</div>
                    </div>
                    <span className="font-mono text-xs text-dim">{w.release_date}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
      <Footer />
    </>
  );
}
