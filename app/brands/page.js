import Link from 'next/link';
import { getAllWatches, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata() {
  return { title: 'Smartwatch Brands | SmartwatchTimeline', description: 'Explore smartwatch history and models by brand.', ...canonicalFor('/brands') };
}

export default async function BrandsPage() {
  const [brands, watches] = await Promise.all([getBrands(), getAllWatches()]);
  const counts = new Map();
  watches.forEach((w) => counts.set(w.brand_id, (counts.get(w.brand_id) || 0) + 1));
  const ordered = [...brands].sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0) || a.name.localeCompare(b.name));
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Smartwatch Brands', url: `${SITE_URL}/brands`, numberOfItems: brands.length };

  return <><JsonLd data={jsonLd} /><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Discovery / brands</div><h1 className="font-display font-bold text-[38px] sm:text-[54px] leading-tight mb-4">Explore by brand</h1><p className="text-dim max-w-2xl leading-7">Follow the evolution of each manufacturer and browse every smartwatch tracked in the catalog.</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">{ordered.map((b) => <Link key={b.id} href={`/brands/${b.id}`} className="group bg-panel border border-line rounded-2xl p-6 hover:border-accent hover:-translate-y-0.5 transition-all"><div className="flex items-center justify-between gap-4"><div><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Brand</div><h2 className="font-display font-bold text-xl mt-1">{b.name}</h2></div><span className="font-mono text-xs text-dim">{counts.get(b.id) || 0}</span></div><div className="font-mono text-[9px] text-dim uppercase mt-6">View timeline →</div></Link>)}</div></article></>;
}
