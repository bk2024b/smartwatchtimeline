import Link from 'next/link';
import { getAllWatches, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

const DISCOVERY = [
  { href: '/timeline', eyebrow: 'Chronology', title: 'Timeline', text: 'See the smartwatch category evolve generation by generation.', metric: 'Explore history' },
  { href: '/brands', eyebrow: 'Manufacturers', title: 'By brand', text: 'Follow Apple, Samsung, Garmin and every tracked manufacturer.', metric: 'Explore brands' },
  { href: '/years', eyebrow: 'Time', title: 'By year', text: 'Jump directly to the releases of any year in the database.', metric: 'Explore years' },
  { href: '/technologies', eyebrow: 'Features', title: 'By technology', text: 'Discover models through GPS, ECG, SpO₂, LTE, NFC and more.', metric: 'Explore technologies' },
  { href: '/smartwatches', eyebrow: 'Catalog', title: 'All smartwatches', text: 'Browse the complete catalog with specifications and prices.', metric: 'View catalog' },
  { href: '/compare', eyebrow: 'Decision', title: 'Compare', text: 'Put two models side by side and see where each one wins.', metric: 'Start comparing' },
  { href: '/guides', eyebrow: 'Editorial', title: 'Buying guides', text: 'Use practical guides to understand the specifications that matter.', metric: 'Read guides' },
];

export async function generateMetadata() {
  return { title: 'Explore Smartwatches | SmartwatchTimeline', description: 'Explore smartwatch history by brand, year, technology, catalog, timeline and comparison.', ...canonicalFor('/explore') };
}

export default async function ExplorePage() {
  const [watches, brands] = await Promise.all([getAllWatches(), getBrands()]);
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Explore Smartwatches', url: `${SITE_URL}/explore`, numberOfItems: DISCOVERY.length };
  return <><JsonLd data={jsonLd} /><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">SmartwatchTimeline / discovery</div><h1 className="font-display font-bold text-[40px] sm:text-[60px] leading-[1.05] mb-5 max-w-4xl">Explore the smartwatch universe.</h1><p className="text-dim text-[15px] sm:text-[18px] leading-7 max-w-2xl">One database, multiple ways to navigate it — by time, manufacturer, technology, model or buying decision.</p><div className="flex flex-wrap gap-8 mt-9 mb-12"><div><div className="font-display font-bold text-2xl">{watches.length}</div><div className="font-mono text-[9px] text-dim uppercase tracking-wider">Models tracked</div></div><div><div className="font-display font-bold text-2xl">{brands.length}</div><div className="font-mono text-[9px] text-dim uppercase tracking-wider">Brands</div></div></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{DISCOVERY.map((item, index) => <Link key={item.href} href={item.href} className={`group bg-panel border border-line rounded-2xl p-6 min-h-[190px] hover:border-accent hover:-translate-y-0.5 transition-all ${index === 0 ? 'lg:col-span-2' : ''}`}><div className="flex items-start justify-between gap-4"><div className="font-mono text-[9px] text-accent uppercase tracking-[0.12em]">{item.eyebrow}</div><span className="font-mono text-[10px] text-dim">0{index + 1}</span></div><h2 className="font-display font-bold text-2xl mt-4">{item.title}</h2><p className="text-dim text-sm leading-6 mt-2 max-w-md">{item.text}</p><div className="font-mono text-[9px] text-dim uppercase tracking-wider mt-7 group-hover:text-accent transition-colors">{item.metric} →</div></Link>)}</div></article></>;
}
