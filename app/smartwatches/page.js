import { getAllWatches, getBrands, getAllProductLinks } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';
import ProductCard from '@/components/ProductCard';

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'All Smartwatches | SmartwatchTimeline',
    description: 'Browse every smartwatch in our database, sorted by release date, with key specifications and prices.',
    ...canonicalFor('/smartwatches'),
  };
}

export default async function CatalogPage() {
  const [watches, brands, productLinks] = await Promise.all([getAllWatches(), getBrands(), getAllProductLinks()]);
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const linksByWatch = new Map();
  for (const link of productLinks) {
    if (!linksByWatch.has(link.smartwatch_id)) linksByWatch.set(link.smartwatch_id, []);
    linksByWatch.get(link.smartwatch_id).push(link);
  }
  const sorted = [...watches].sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Smartwatches',
    url: `${SITE_URL}/smartwatches`,
    numberOfItems: sorted.length,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-6xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Smartwatch Catalog</div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-[38px] sm:text-[54px] leading-tight mb-3">All Smartwatches</h1>
            <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">
              Explore {sorted.length} models, from early smartwatches to the latest generations.
            </p>
          </div>
          <div className="font-mono text-xs text-dim border border-line rounded-lg px-3 py-2 shrink-0">
            Newest first · {brands.length} brands
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-mono">All models</span>
          <a href="/timeline" className="px-3 py-1.5 rounded-full border border-line text-dim text-xs font-mono hover:border-accent hover:text-accent transition-colors">Timeline</a>
          <a href="/brands" className="px-3 py-1.5 rounded-full border border-line text-dim text-xs font-mono hover:border-accent hover:text-accent transition-colors">By brand</a>
          <a href="/compare" className="px-3 py-1.5 rounded-full border border-line text-dim text-xs font-mono hover:border-accent hover:text-accent transition-colors">Compare</a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
          {sorted.map((watch, index) => (
            <ProductCard
              key={watch.id}
              watch={watch}
              brand={brandMap.get(watch.brand_id)}
              rank={index + 1}
              productLinks={linksByWatch.get(watch.id) || []}
            />
          ))}
        </div>
      </article>
    </>
  );
}
