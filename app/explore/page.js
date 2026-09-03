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
  { href: '/finder', eyebrow: 'Personalized', title: 'Smartwatch Finder', text: 'Answer a few questions and get models ranked around your needs.', metric: 'Find your match' },
];

const FEATURES = [
  ['GPS', 'gps', 'Models with built-in GPS'],
  ['ECG', 'ecg', 'Models with electrocardiogram'],
  ['SpO₂', 'blood_oxygen', 'Models with blood oxygen tracking'],
  ['LTE', 'cellular', 'Models with cellular connectivity'],
  ['NFC', 'nfc_payments', 'Models with contactless payments'],
  ['Sleep', 'sleep_tracking', 'Models with sleep tracking'],
];

function truthy(value) { return value === true || value === 1 || value === 'true' || value === '1' || (typeof value === 'string' && value.toLowerCase() === 'yes'); }

export async function generateMetadata() {
  return { title: 'Explore Smartwatches | SmartwatchTimeline', description: 'Explore smartwatch history, brands, technologies, trends, models and personalized buying paths.', ...canonicalFor('/explore') };
}

export default async function ExplorePage() {
  const [watches, brands] = await Promise.all([getAllWatches(), getBrands()]);
  const released = watches.filter((w) => (w.status || 'released') === 'released');
  const latest = [...watches].sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0)).slice(0, 6);
  const featureStats = FEATURES.map(([label, field, text]) => ({ label, field, text, count: watches.filter((w) => truthy(w[field])).length }));
  const years = [...new Set(watches.map((w) => (w.release_date || '').slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  const latestYear = years[0];
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Explore Smartwatches', url: `${SITE_URL}/explore`, numberOfItems: DISCOVERY.length };

  return <>
    <JsonLd data={jsonLd} />
    <article className="max-w-6xl mx-auto">
      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">SmartwatchTimeline / discovery</div>
      <h1 className="font-display font-bold text-[40px] sm:text-[60px] leading-[1.05] mb-5 max-w-4xl">Explore the smartwatch universe.</h1>
      <p className="text-dim text-[15px] sm:text-[18px] leading-7 max-w-2xl">One database, multiple ways to navigate it — by time, manufacturer, technology, model or buying decision.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-9 mb-12">
        {[['Models tracked', watches.length], ['Brands', brands.length], ['Released', released.length], ['Latest year', latestYear || '—']].map(([label, value]) => <div key={label} className="bg-panel border border-line rounded-2xl p-4"><div className="font-display font-bold text-2xl">{value}</div><div className="font-mono text-[9px] text-dim uppercase tracking-wider mt-1">{label}</div></div>)}
      </div>

      <section className="mb-14">
        <div className="flex items-end justify-between gap-4 mb-5"><div><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Start here</div><h2 className="font-display font-bold text-3xl mt-1">Choose your path.</h2></div><Link href="/finder" className="font-mono text-[9px] uppercase text-dim hover:text-accent">Personalized finder →</Link></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{DISCOVERY.map((item, index) => <Link key={item.href} href={item.href} className={`group bg-panel border border-line rounded-2xl p-5 min-h-[175px] hover:border-accent hover:-translate-y-0.5 transition-all ${index === 0 ? 'lg:col-span-2' : ''}`}><div className="flex items-start justify-between gap-4"><div className="font-mono text-[9px] text-accent uppercase tracking-[0.12em]">{item.eyebrow}</div><span className="font-mono text-[10px] text-dim">{String(index + 1).padStart(2, '0')}</span></div><h3 className="font-display font-bold text-2xl mt-4">{item.title}</h3><p className="text-dim text-sm leading-6 mt-2">{item.text}</p><div className="font-mono text-[9px] text-dim uppercase tracking-wider mt-6 group-hover:text-accent transition-colors">{item.metric} →</div></Link>)}</div>
      </section>

      <section className="mb-14">
        <div className="font-mono text-[9px] text-accent uppercase tracking-wider">Feature map</div><h2 className="font-display font-bold text-3xl mt-1 mb-5">Explore by technology.</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{featureStats.map((item) => <Link key={item.field} href={`/technologies/${item.field}`} className="bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors"><div className="flex justify-between gap-3"><span className="font-display font-semibold text-lg">{item.label}</span><span className="font-mono text-[10px] text-accent">{item.count}</span></div><p className="text-dim text-xs mt-2">{item.text}</p></Link>)}</div>
      </section>

      <section className="mb-14">
        <div className="flex items-end justify-between mb-5"><div><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Fresh releases</div><h2 className="font-display font-bold text-3xl mt-1">Latest models.</h2></div><Link href="/timeline" className="font-mono text-[9px] uppercase text-dim hover:text-accent">Full timeline →</Link></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{latest.map((w) => <Link key={w.id} href={`/smartwatches/${w.id}`} className="bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors"><div className="font-mono text-[9px] text-accent uppercase">{brands.find((b) => b.id === w.brand_id)?.name || w.brand_id}</div><h3 className="font-display font-semibold text-xl mt-2">{w.name}</h3><div className="font-mono text-[9px] text-dim mt-3 flex flex-wrap gap-3"><span>{w.release_date || '—'}</span>{w.price != null && <span>${Number(w.price).toFixed(0)}</span>}{w.battery_life_h && <span>{w.battery_life_h}h</span>}</div></Link>)}</div>
      </section>

      <section className="bg-panel border border-line rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Don't know where to start?</div><h2 className="font-display font-bold text-2xl mt-2">Tell us what you need. We'll rank the catalog.</h2><p className="text-dim text-sm mt-2 max-w-xl">Budget, ecosystem, battery, health, sports and design — the Finder turns those preferences into a personalized shortlist.</p></div>
        <Link href="/finder" className="btn-primary shrink-0">Find my smartwatch →</Link>
      </section>
    </article>
  </>;
}
