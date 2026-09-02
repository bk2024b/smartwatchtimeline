import Link from 'next/link';
import { getAllWatches } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

const TECHNOLOGIES = [
  ['gps', 'GPS', 'Built-in positioning for outdoor tracking and route recording.'],
  ['cellular', 'Cellular / LTE', 'Connected models that can operate away from a phone.'],
  ['ecg', 'ECG', 'Watches with electrocardiogram hardware.'],
  ['blood-oxygen', 'Blood oxygen / SpO₂', 'Models equipped with blood-oxygen sensing.'],
  ['nfc', 'NFC payments', 'Tap-to-pay capable smartwatches.'],
  ['always-on', 'Always-on display', 'Displays designed to keep key information visible.'],
  ['rugged', 'Rugged', 'Models built around a more durable outdoor-oriented design.'],
  ['round', 'Round case', 'Smartwatches using a circular case design.'],
];

function hasFeature(watch, key) {
  if (key === 'nfc') return Boolean(watch.nfc_payments);
  if (key === 'always-on') return Boolean(watch.always_on_display);
  if (key === 'round') return Boolean(watch.round_face);
  return Boolean(watch[key.replace('blood-oxygen', 'blood_oxygen')]);
}

export async function generateMetadata() {
  return { title: 'Smartwatch Technologies | SmartwatchTimeline', description: 'Explore smartwatches by GPS, ECG, SpO₂, LTE, NFC, display and other technologies.', ...canonicalFor('/technologies') };
}

export default async function TechnologiesPage() {
  const watches = await getAllWatches();
  const cards = TECHNOLOGIES.map(([slug, name, description]) => ({ slug, name, description, count: watches.filter((w) => hasFeature(w, slug)).length })).sort((a, b) => b.count - a.count);
  const jsonLd = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Smartwatch Technologies', url: `${SITE_URL}/technologies`, numberOfItems: cards.length };
  return <><JsonLd data={jsonLd} /><article className="max-w-6xl mx-auto"><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Discovery / technologies</div><h1 className="font-display font-bold text-[38px] sm:text-[54px] leading-tight mb-4">Explore by technology</h1><p className="text-dim max-w-2xl leading-7">Find the watches that introduced or adopted the features shaping modern smartwatches.</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">{cards.map((item) => <Link key={item.slug} href={`/technologies/${item.slug}`} className="group bg-panel border border-line rounded-2xl p-6 hover:border-accent hover:-translate-y-0.5 transition-all"><div className="flex justify-between gap-4"><h2 className="font-display font-bold text-xl">{item.name}</h2><span className="font-mono text-xs text-dim">{item.count}</span></div><p className="text-sm text-dim leading-6 mt-3">{item.description}</p><div className="font-mono text-[9px] text-accent uppercase tracking-wider mt-6">Explore models →</div></Link>)}</div></article></>;
}
