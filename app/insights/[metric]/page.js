import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllWatches } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

const METRICS = {
  battery: { title: 'Battery life', intro: 'How smartwatch endurance has changed across generations.', field: 'battery_life_h', unit: 'h', higher: true, label: 'Average battery life' },
  price: { title: 'Price', intro: 'How launch pricing has evolved across the smartwatch category.', field: 'price', unit: 'USD', higher: false, label: 'Average price' },
  weight: { title: 'Weight', intro: 'How hardware weight has shifted as smartwatches evolved.', field: 'weight_g', unit: 'g', higher: false, label: 'Average weight' },
  display: { title: 'Display size', intro: 'How case and display dimensions have changed over time.', field: 'screen_size_mm', unit: 'mm', higher: true, label: 'Average display size' },
};

function valueOf(watch, field) { const value = Number(watch[field]); return Number.isFinite(value) ? value : null; }
function yearOf(watch) { const year = new Date(watch.release_date).getFullYear(); return Number.isFinite(year) ? year : null; }

export async function generateStaticParams() { return Object.keys(METRICS).map((metric) => ({ metric })); }
export async function generateMetadata({ params }) { const metric = METRICS[params.metric]; if (!metric) return {}; return { title: `${metric.title} Insights | SmartwatchTimeline`, description: metric.intro, ...canonicalFor(`/insights/${params.metric}`) }; }

export default async function MetricInsightPage({ params }) {
  const metric = METRICS[params.metric];
  if (!metric) notFound();
  const watches = await getAllWatches();
  const byYear = new Map();
  for (const watch of watches) { const year = yearOf(watch); const value = valueOf(watch, metric.field); if (!year || value === null) continue; if (!byYear.has(year)) byYear.set(year, []); byYear.get(year).push(value); }
  const rows = [...byYear.entries()].sort((a, b) => a[0] - b[0]).map(([year, values]) => ({ year, average: values.reduce((a, b) => a + b, 0) / values.length, count: values.length })).filter((row) => row.count > 0);
  if (!rows.length) notFound();
  const min = Math.min(...rows.map((r) => r.average)); const max = Math.max(...rows.map((r) => r.average)); const latest = rows.at(-1); const first = rows[0]; const change = first.average ? ((latest.average - first.average) / first.average) * 100 : null;
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Dataset', name: `${metric.title} — SmartwatchTimeline`, description: metric.intro, url: `${SITE_URL}/insights/${params.metric}`, temporalCoverage: `${first.year}/${latest.year}`, variableMeasured: metric.title };

  return <><JsonLd data={jsonLd} /><article className="max-w-5xl mx-auto"><Link href="/insights" className="font-mono text-xs text-accent uppercase tracking-wider">← All insights</Link><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mt-8 mb-3">SmartwatchTimeline / insights</div><h1 className="font-display font-bold text-[40px] sm:text-[58px] leading-[1.05] max-w-4xl">{metric.title} over time.</h1><p className="text-dim text-[15px] sm:text-[18px] leading-7 max-w-2xl mt-5">{metric.intro}</p>

  <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10 mb-10">{[[first.average, `First tracked average`, metric.unit],[latest.average, `Latest tracked average`, metric.unit],[change, 'Change since first year', '%'],[rows.length, 'Years analyzed', 'years']].map(([v,l,u]) => <div key={l} className="bg-panel border border-line rounded-2xl p-5"><div className="font-display font-bold text-2xl">{typeof v === 'number' ? `${v.toFixed(1)}${u === '%' ? '%' : ''}` : '—'}{u !== '%' && u !== 'years' ? <span className="text-sm text-dim ml-1">{u}</span> : null}</div><div className="font-mono text-[9px] text-dim uppercase tracking-wider mt-2">{l}</div></div>)}</section>

  <section className="bg-panel border border-line rounded-2xl p-5 sm:p-7 mb-10"><div className="flex items-end justify-between mb-7"><div><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Annual trend</div><h2 className="font-display font-semibold text-2xl mt-1">Average {metric.title.toLowerCase()}</h2></div><span className="font-mono text-[10px] text-dim">{first.year} → {latest.year}</span></div><div className="space-y-4">{rows.map((row) => { const width = max === min ? 100 : 18 + ((row.average - min) / (max - min)) * 82; return <div key={row.year}><div className="flex justify-between gap-4 mb-2"><Link href={`/years/${row.year}`} className="font-mono text-xs hover:text-accent">{row.year}</Link><span className="font-mono text-xs">{row.average.toFixed(1)} {metric.unit} <span className="text-dim">· {row.count} models</span></span></div><div className="h-2 rounded-full bg-panel2 overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${width}%` }} /></div></div>; })}</div></section>

  <section className="grid sm:grid-cols-2 gap-4 mb-10"><div className="bg-panel border border-line rounded-2xl p-6"><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Low point</div><div className="font-display font-semibold text-2xl mt-2">{(rows.reduce((a,b) => metric.higher ? (b.average < a.average ? b : a) : (b.average > a.average ? b : a), rows[0])).year}</div><p className="text-dim text-sm mt-2">{metric.higher ? 'Lowest' : 'Highest'} annual average: {Math.min(...rows.map(r => r.average)).toFixed(1)} {metric.unit}.</p></div><div className="bg-panel border border-line rounded-2xl p-6"><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Category range</div><div className="font-display font-semibold text-2xl mt-2">{min.toFixed(1)} — {max.toFixed(1)} {metric.unit}</div><p className="text-dim text-sm mt-2">Observed annual averages across {rows.length} release years.</p></div></section>

  <div className="flex flex-wrap gap-3"><Link href="/compare" className="btn-primary">Compare models</Link><Link href="/timeline" className="btn-secondary">Open timeline</Link><Link href="/insights" className="btn-secondary">More insights</Link></div>
  </article></>;
}
