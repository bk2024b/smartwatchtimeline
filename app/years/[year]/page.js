import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllWatches, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';
import ProductCard from '@/components/ProductCard';

export const revalidate = 3600;

export async function generateStaticParams() {
  const watches = await getAllWatches();
  return [...new Set(watches.map((w) => (w.release_date || '').slice(0, 4)).filter(Boolean))].map((year) => ({ year }));
}

export async function generateMetadata({ params }) {
  return { title: `Smartwatches of ${params.year} | SmartwatchTimeline`, description: `Explore smartwatch releases from ${params.year}, with specs, features, and comparisons.`, ...canonicalFor(`/years/${params.year}`) };
}

export default async function YearPage({ params }) {
  const year = String(params.year);
  if (!/^\d{4}$/.test(year)) notFound();
  const [watches, brands] = await Promise.all([getAllWatches(), getBrands()]);
  const models = watches.filter((w) => (w.release_date || '').startsWith(year)).sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
  if (!models.length) notFound();
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const brandCounts = new Map(); models.forEach((w) => brandCounts.set(w.brand_id, (brandCounts.get(w.brand_id) || 0) + 1));
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `Smartwatches of ${year}`, url: `${SITE_URL}/years/${year}`, numberOfItems: models.length };
  return <><JsonLd data={jsonLd} /><article className="max-w-6xl mx-auto"><Link href="/years" className="font-mono text-[9px] text-accent uppercase tracking-wider">← All years</Link><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mt-8 mb-3">Year / {year}</div><h1 className="font-display font-bold text-[38px] sm:text-[54px] leading-tight mb-4">Smartwatches of {year}</h1><p className="text-dim max-w-2xl leading-7">{models.length} releases across {brandCounts.size} brand{brandCounts.size === 1 ? '' : 's'}.</p><div className="flex flex-wrap gap-2 mt-7">{[...brandCounts.entries()].sort((a,b)=>b[1]-a[1]).map(([id,count])=><span key={id} className="font-mono text-[9px] border border-line rounded-full px-3 py-1.5 text-dim">{brandMap.get(id)?.name || id} · {count}</span>)}</div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">{models.map((watch)=><ProductCard key={watch.id} watch={watch} brand={brandMap.get(watch.brand_id)} productLinks={[]} />)}</div></article></>;
}
