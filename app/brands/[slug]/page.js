import { notFound } from 'next/navigation';
import { getAllWatches, getBrands, getBrandById, getAllProductLinks } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';
import ProductCard from '@/components/ProductCard';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const brands = await getBrands();
    return brands.map((b) => ({ slug: b.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const brand = await getBrandById(params.slug);
  if (!brand) return {};
  return { title: `${brand.name} Smartwatches | SmartwatchTimeline`, description: `Every ${brand.name} smartwatch in our database, with full specs and price history.`, ...canonicalFor(`/brands/${params.slug}`) };
}

export default async function BrandPage({ params }) {
  const { slug } = params;
  const brand = await getBrandById(slug);
  if (!brand) notFound();
  const [watches, productLinks] = await Promise.all([getAllWatches(), getAllProductLinks()]);
  const brandWatches = watches.filter((w) => w.brand_id === slug).sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
  const linksByWatch = new Map();
  for (const link of productLinks) {
    if (!linksByWatch.has(link.smartwatch_id)) linksByWatch.set(link.smartwatch_id, []);
    linksByWatch.get(link.smartwatch_id).push(link);
  }
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${brand.name} Smartwatches`, url: `${SITE_URL}/brands/${slug}`, numberOfItems: brandWatches.length };
  return <><JsonLd data={jsonLd} /><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase mb-3">Brand</div><h1 className="font-display font-bold text-[38px] sm:text-[54px] leading-tight mb-4">{brand.name} Smartwatches</h1><p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{brandWatches.length} models tracked.</p><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">{brandWatches.map((watch) => <ProductCard key={watch.id} watch={watch} brand={brand} productLinks={linksByWatch.get(watch.id) || []} />)}</div></article></>;
}
