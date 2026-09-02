import Link from 'next/link';
import { getAllWatches } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata() {
  return { title: 'Smartwatch Years | SmartwatchTimeline', description: 'Browse smartwatches by release year and discover how the category evolved.', ...canonicalFor('/years') };
}

export default async function YearsPage() {
  const watches = await getAllWatches();
  const byYear = new Map();
  watches.forEach((w) => { const y = (w.release_date || '').slice(0, 4); if (y) byYear.set(y, [...(byYear.get(y) || []), w]); });
  const years = [...byYear.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Smartwatch Years', url: `${SITE_URL}/years`, numberOfItems: years.length };
  return <><JsonLd data={jsonLd} /><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Discovery / years</div><h1 className="font-display font-bold text-[38px] sm:text-[54px] leading-tight mb-4">Smartwatches by year</h1><p className="text-dim max-w-2xl leading-7">Jump through the history of the category, year by year.</p><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-10">{years.map(([year, models]) => <Link key={year} href={`/years/${year}`} className="bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-all"><div className="font-display font-bold text-3xl">{year}</div><div className="font-mono text-[9px] text-dim uppercase mt-4">{models.length} model{models.length === 1 ? '' : 's'} →</div></Link>)}</div></article></>;
}
