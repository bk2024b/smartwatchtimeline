import Link from 'next/link';
import { getAllWatches, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

function number(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }
function average(values) { const clean = values.filter((v) => v !== null); return clean.length ? clean.reduce((a, b) => a + b, 0) / clean.length : null; }
function years(watches) { return [...new Set(watches.map((w) => new Date(w.release_date).getFullYear()).filter(Number.isFinite))].sort((a, b) => a - b); }
function hasFeature(watch, field) { const value = watch[field]; return value === true || value === 1 || value === 'true' || value === '1' || (typeof value === 'string' && value.trim().toLowerCase() === 'yes'); }
function format(value) { return value === null ? '—' : value.toFixed(1); }

const FEATURES = [
  ['GPS', 'gps'], ['Cellular / LTE', 'cellular'], ['ECG', 'ecg'], ['Blood oxygen', 'blood_oxygen'],
  ['NFC payments', 'nfc_payments'], ['Always-on display', 'always_on_display'], ['Rugged', 'rugged'], ['Round case', 'round_face'],
];

export async function generateMetadata() {
  return { title: 'Smartwatch Insights | SmartwatchTimeline', description: 'Explore smartwatch data trends across price, battery, weight, case size, sensors, connectivity and design.', ...canonicalFor('/insights') };
}

export default async function InsightsPage() {
  const [watches, brands] = await Promise.all([getAllWatches(), getBrands()]);
  const priced = watches.map((w) => number(w.price)).filter((v) => v !== null);
  const batteries = watches.map((w) => number(w.battery_life_h)).filter((v) => v !== null);
  const weights = watches.map((w) => number(w.weight_g)).filter((v) => v !== null);
  const caseSizes = watches.map((w) => number(w.case_size_mm)).filter((v) => v !== null);
  const avgPrice = average(priced), avgBattery = average(batteries), avgWeight = average(weights), avgCaseSize = average(caseSizes);
  const featureStats = FEATURES.map(([label, field]) => ({ label, field, count: watches.filter((w) => hasFeature(w, field)).length })).sort((a, b) => b.count - a.count);
  const releaseYears = years(watches);
  const latestYear = releaseYears.at(-1);
  const oldestYear = releaseYears[0];
  const latest = latestYear ? watches.filter((w) => new Date(w.release_date).getFullYear() === latestYear) : [];
  const coverage = [['price', priced.length], ['battery', batteries.length], ['weight', weights.length], ['case size', caseSizes.length]];
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Smartwatch Insights', url: `${SITE_URL}/insights`, numberOfItems: watches.length };

  return <><JsonLd data={jsonLd} /><article className="max-w-6xl mx-auto">
    <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">SmartwatchTimeline / data</div>
    <h1 className="font-display font-bold text-[40px] sm:text-[60px] leading-[1.05] mb-5 max-w-4xl">What the data says about smartwatches.</h1>
    <p className="text-dim text-[15px] sm:text-[18px] leading-7 max-w-2xl">Turn the catalog into a living dataset: prices, endurance, weight, case dimensions and the technologies that define each generation.</p>

    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10 mb-4">
      {[[avgPrice, 'Average price', 'USD'], [avgBattery, 'Average battery', 'hours'], [avgWeight, 'Average weight', 'g'], [avgCaseSize, 'Average case size', 'mm']].map(([value, label, unit]) => <div key={label} className="bg-panel border border-line rounded-2xl p-5"><div className="font-display font-bold text-2xl">{format(value)}<span className="text-sm text-dim ml-1">{unit}</span></div><div className="font-mono text-[9px] text-dim uppercase tracking-wider mt-2">{label}</div></div>)}
    </section>
    <div className="flex flex-wrap gap-x-5 gap-y-2 mb-12 text-[10px] font-mono text-dim uppercase">{coverage.map(([label, count]) => <span key={label}>{count}/{watches.length} with {label} data</span>)}</div>

    <section className="mb-12"><div className="flex items-end justify-between mb-5"><div><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Technology adoption</div><h2 className="font-display font-semibold text-2xl mt-1">Which features define the catalog?</h2></div><Link href="/technologies" className="text-accent font-mono text-xs uppercase">Explore →</Link></div><div className="bg-panel border border-line rounded-2xl p-5 sm:p-7 space-y-5">{featureStats.map((item) => <div key={item.field}><div className="flex justify-between gap-4 mb-2"><span className="text-sm">{item.label}</span><span className="font-mono text-xs text-dim">{item.count} / {watches.length} · {watches.length ? ((item.count / watches.length) * 100).toFixed(0) : 0}%</span></div><div className="h-2 rounded-full bg-panel2 overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${watches.length ? (item.count / watches.length) * 100 : 0}%` }} /></div></div>)}</div></section>

    <section className="grid lg:grid-cols-2 gap-4 mb-12"><div className="bg-panel border border-line rounded-2xl p-6"><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Database coverage</div><h2 className="font-display font-semibold text-2xl mt-2">{oldestYear || '—'} → {latestYear || '—'}</h2><p className="text-dim text-sm leading-6 mt-2">{releaseYears.length} release years and {brands.length} tracked brands make it possible to study how the category changes over time.</p><div className="flex flex-wrap gap-2 mt-5">{releaseYears.slice(-10).reverse().map((year) => <Link key={year} href={`/years/${year}`} className="px-3 py-2 rounded-lg border border-line text-xs font-mono hover:border-accent transition-colors">{year}</Link>)}</div></div><div className="bg-panel border border-line rounded-2xl p-6"><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Latest generation</div><h2 className="font-display font-semibold text-2xl mt-2">{latestYear || '—'}</h2><p className="text-dim text-sm leading-6 mt-2">{latest.length} models released in the latest tracked year. Explore the complete generation and compare individual models.</p>{latestYear && <Link href={`/years/${latestYear}`} className="inline-block mt-5 text-accent font-mono text-xs uppercase">View {latestYear} →</Link>}</div></section>

    <section className="mb-12"><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Deep dives</div><h2 className="font-display font-semibold text-2xl mt-1 mb-5">Explore individual signals.</h2><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{[
      ['Price', 'price', 'How pricing changes across the catalog.'], ['Battery', 'battery_life_h', 'Which models prioritize endurance.'], ['Weight', 'weight_g', 'See how light or heavy the category is.'], ['Case size', 'case_size_mm', 'Compare physical case dimensions.'],
    ].map(([title, slug, text]) => <Link key={slug} href={`/insights/${slug}`} className="bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors"><div className="font-display font-semibold text-lg">{title}</div><p className="text-dim text-xs leading-5 mt-2">{text}</p><div className="font-mono text-[9px] text-accent uppercase mt-5">Analyze →</div></Link>)}</div></section>

    <section className="bg-panel border border-line rounded-2xl p-6 sm:p-8 mb-12"><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Next layer</div><h2 className="font-display font-semibold text-2xl mt-2">From statistics to decisions.</h2><p className="text-dim text-sm leading-6 mt-2 max-w-2xl">Aggregate metrics are the foundation for deeper trend pages, brand trajectories and smarter recommendations.</p><div className="flex flex-wrap gap-3 mt-6"><Link href="/finder" className="btn-primary">Find my smartwatch</Link><Link href="/compare" className="btn-secondary">Compare models</Link><Link href="/timeline" className="btn-secondary">Open timeline</Link></div></section>
  </article></>;
}
