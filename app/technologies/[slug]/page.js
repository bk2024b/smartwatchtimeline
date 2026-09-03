import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllWatches, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';
import ProductCard from '@/components/ProductCard';

export const revalidate = 3600;

const TECHNOLOGIES = {
  gps: ['GPS', 'gps', 'Built-in positioning for outdoor tracking and route recording.'],
  cellular: ['Cellular / LTE', 'cellular', 'Connected models that can operate away from a phone.'],
  ecg: ['ECG', 'ecg', 'Watches with electrocardiogram hardware.'],
  'blood-oxygen': ['Blood oxygen / SpO₂', 'blood_oxygen', 'Models equipped with blood-oxygen sensing.'],
  nfc: ['NFC payments', 'nfc_payments', 'Tap-to-pay capable smartwatches.'],
  'always-on': ['Always-on display', 'always_on_display', 'Displays designed to keep key information visible.'],
  rugged: ['Rugged', 'rugged', 'Models built around a more durable outdoor-oriented design.'],
  round: ['Round case', 'round_face', 'Smartwatches using a circular case design.'],
};

export async function generateStaticParams() { return Object.keys(TECHNOLOGIES).map((slug) => ({ slug })); }

export async function generateMetadata({ params }) {
  const item = TECHNOLOGIES[params.slug];
  if (!item) return {};
  return { title: `${item[0]} Smartwatches | SmartwatchTimeline`, description: `Explore ${item[0].toLowerCase()} smartwatches, with models, specs and comparisons.`, ...canonicalFor(`/technologies/${params.slug}`) };
}

export default async function TechnologyPage({ params }) {
  const item = TECHNOLOGIES[params.slug];
  if (!item) notFound();
  const [watches, brands] = await Promise.all([getAllWatches(), getBrands()]);
  const models = watches.filter((w) => Boolean(w[item[1]])).sort((a,b) => new Date(b.release_date) - new Date(a.release_date));
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const brandCounts = new Map(); models.forEach((w) => brandCounts.set(w.brand_id, (brandCounts.get(w.brand_id) || 0) + 1));
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${item[0]} Smartwatches`, url: `${SITE_URL}/technologies/${params.slug}`, numberOfItems: models.length };
  return <><JsonLd data={jsonLd} /><article className="max-w-6xl mx-auto"><Link href="/technologies" className="font-mono text-[9px] text-accent uppercase tracking-wider">← All technologies</Link><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mt-8 mb-3">Technology / {item[0]}</div><h1 className="font-display font-bold text-[38px] sm:text-[54px] leading-tight mb-4">{item[0]} smartwatches</h1><p className="text-dim max-w-2xl leading-7">{item[2]}</p><div className="flex flex-wrap gap-2 mt-7">{[...brandCounts.entries()].sort((a,b)=>b[1]-a[1]).map(([id,count])=><span key={id} className="font-mono text-[9px] border border-line rounded-full px-3 py-1.5 text-dim">{brandMap.get(id)?.name || id} · {count}</span>)}</div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">{models.map((watch)=><ProductCard key={watch.id} watch={watch} brand={brandMap.get(watch.brand_id)} productLinks={[]} />)}</div></article></>;
}
