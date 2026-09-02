import { getAllWatches, getBrands, getAllProductLinks } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';
import ProductCard from '@/components/ProductCard';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'All Smartwatches | SmartwatchTimeline',
    description: 'Browse every smartwatch in our database, sorted by release date.',
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
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-6xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase mb-3">Catalog</div>
        <h1 className="font-display font-bold text-[38px] sm:text-[54px] leading-tight mb-4">All Smartwatches</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{sorted.length} models, newest first.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {sorted.map((watch) => (
            <ProductCard key={watch.id} watch={watch} brand={brandMap.get(watch.brand_id)} productLinks={linksByWatch.get(watch.id) || []} />
          ))}
        </div>
      </article>
      <Footer />
    </>
  );
}
