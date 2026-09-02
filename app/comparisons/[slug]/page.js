import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getAllWatches, getBrands, getProductLinks } from '@/lib/queries';
import { parseComparisonSlug, buildComparisonSlug, isCanonicalSlug } from '@/lib/compareSlug';
import { computeComparisonPairs } from '@/lib/comparisonPairs';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';
import { VendorButtonsFull } from '@/components/VendorButtons';

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const watches = await getAllWatches();
    return computeComparisonPairs(watches).map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

async function loadPair(slug) {
  const parsed = parseComparisonSlug(slug);
  if (!parsed) return { a: null, b: null };
  const watches = await getAllWatches().catch(() => []);
  return { a: watches.find((w) => w.id === parsed[0]), b: watches.find((w) => w.id === parsed[1]) };
}

export async function generateMetadata({ params }) {
  const { a, b } = await loadPair(params.slug);
  if (!a || !b) return {};
  return {
    title: `${a.name} vs ${b.name} | SmartwatchTimeline`,
    description: `Detailed comparison of ${a.name} and ${b.name`: ''}`,
    ...canonicalFor(`/comparisons/${params.slug}`),
  };
}

const ROWS = [
  ['Release date', (w) => w.release_date || '—'],
  ['Price', (w) => Number.isFinite(Number(w.price)) ? `$${Number(w.price).toFixed(0)}` : '—'],
  ['Battery life', (w) => w.battery_life_h ? `${w.battery_life_h}h` : '—'],
  ['Weight', (w) => w.weight_g ? `${w.weight_g}g` : '—'],
  ['Case size', (w) => w.case_size_mm ? `${w.case_size_mm}mm` : '—'],
  ['Display', (w) => w.display_type || '—'],
  ['Water rating', (w) => w.water_rating || '—'],
  ['GPS', (w) => w.gps ? 'Yes' : 'No'],
  ['Cellular', (w) => w.cellular ? 'Yes' : 'No'],
  ['NFC payments', (w) => w.nfc_payments ? 'Yes' : 'No'],
  ['ECG', (w) => w.ecg ? 'Yes' : 'No'],
  ['Blood oxygen', (w) => w.blood_oxygen ? 'Yes' : 'No'],
  ['Always-on display', (w) => w.always_on_display ? 'Yes' : 'No'],
  ['Ecosystem', (w) => w.ecosystem || '—'],
  ['OS', (w) => w.os || '—'],
  ['Rugged', (w) => w.rugged ? 'Yes' : 'No'],
  ['Round face', (w) => w.round_face ? 'Yes' : 'No'],
];

function numericValue(w, key) {
  const n = Number(w[key]);
  return Number.isFinite(n) ? n : null;
}

function winner(a, b, key, higherIsBetter = true) {
  const av = numericValue(a, key); const bv = numericValue(b, key);
  if (av == null || bv == null || av === bv) return null;
  return higherIsBetter ? (av > bv ? 'a' : 'b') : (av < bv ? 'a' : 'b');
}

function Score({ watch, other }) {
  const metrics = [
    winner(watch, other, 'battery_life_h', true),
    winner(watch, other, 'weight_g', false),
    winner(watch, other, 'price', false),
    winner(watch, other, 'gps', true),
    winner(watch, other, 'cellular', true),
    winner(watch, other, 'ecg', true),
    winner(watch, other, 'blood_oxygen', true),
    winner(watch, other, 'nfc_payments', true),
  ];
  return metrics.filter(Boolean).length;
}

function ComparisonRow({ label, get, a, b }) {
  const av = get(a); const bv = get(b);
  const aNum = numericValue(a, label === 'Battery life' ? 'battery_life_h' : label === 'Weight' ? 'weight_g' : label === 'Price' ? 'price' : '');
  const bNum = numericValue(b, label === 'Battery life' ? 'battery_life_h' : label === 'Weight' ? 'weight_g' : label === 'Price' ? 'price' : '');
  const lowerBetter = ['Weight', 'Price'].includes(label);
  const awin = aNum != null && bNum != null && aNum !== bNum ? (lowerBetter ? aNum < bNum : aNum > bNum) : false;
  const bwin = aNum != null && bNum != null && aNum !== bNum ? (lowerBetter ? bNum < aNum : bNum > aNum) : false;
  return (
    <tr className="border-b border-line last:border-0">
      <td className="p-4 text-dim text-xs sm:text-sm">{label}</td>
      <td className={`p-4 font-mono text-xs sm:text-sm ${awin ? 'text-accent font-bold' : ''}`}>{av}{awin && <span className="ml-2 text-[9px] uppercase">Best</span>}</td>
      <td className={`p-4 font-mono text-xs sm:text-sm ${bwin ? 'text-accent font-bold' : ''}`}>{bv}{bwin && <span className="ml-2 text-[9px] uppercase">Best</span>}</td>
    </tr>
  );
}

export default async function ComparisonPage({ params }) {
  const { slug } = params;
  if (!isCanonicalSlug(slug)) {
    const parsed = parseComparisonSlug(slug);
    if (parsed) redirect(`/comparisons/${buildComparisonSlug(parsed[0], parsed[1])}`);
    notFound();
  }
  const { a, b } = await loadPair(slug);
  if (!a || !b) notFound();
  const [brands, linksA, linksB, watches] = await Promise.all([getBrands(), getProductLinks(a.id), getProductLinks(b.id), getAllWatches()]);
  const brandMap = new Map(brands.map((br) => [br.id, br]));
  const scoreA = Score({ watch: a, other: b });
  const scoreB = Score({ watch: b, other: a });
  const recommendation = scoreA === scoreB ? 'It is a close match.' : `${scoreA > scoreB ? a.name : b.name} wins more of the measurable comparison points.`;
  const alternatives = watches.filter((w) => w.id !== a.id && w.id !== b.id).map((w) => ({ w, score: similarity(w, a) + similarity(w, b) })).sort((x, y) => y.score - x.score).slice(0, 3);
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: `${a.name} vs ${b.name}`, url: `${SITE_URL}/comparisons/${slug}` };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-5xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Smartwatch comparison</div>
        <h1 className="font-display font-bold text-[30px] sm:text-[46px] leading-tight mb-3">{a.name} vs {b.name}</h1>
        <p className="text-dim max-w-2xl leading-7 mb-8">A detailed side-by-side look at price, battery, hardware, health sensors, connectivity and everyday features.</p>

        <section className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch mb-8">
          {[{ w: a, score: scoreA }, { w: b, score: scoreB }].map(({ w, score }, i) => (
            <div key={w.id} className={`bg-panel border rounded-2xl p-5 ${score > (i === 0 ? scoreB : scoreA) ? 'border-accent shadow-[0_0_40px_rgba(34,208,122,0.07)]' : 'border-line'}`}>
              <div className="font-mono text-[9px] text-accent uppercase tracking-wider">{i === 0 ? 'Model 01' : 'Model 02'}</div>
              <div className="font-mono text-[10px] text-dim uppercase mt-2">{brandMap.get(w.brand_id)?.name || w.brand_id}{w.gamme ? ` · ${w.gamme}` : ''}</div>
              <h2 className="font-display font-bold text-xl mt-1">{w.name}</h2>
              <div className="grid grid-cols-3 gap-2 mt-5 font-mono text-[10px]">
                <div><span className="text-dim block">Price</span>{w.price != null ? `$${Number(w.price).toFixed(0)}` : '—'}</div>
                <div><span className="text-dim block">Battery</span>{w.battery_life_h ? `${w.battery_life_h}h` : '—'}</div>
                <div><span className="text-dim block">Weight</span>{w.weight_g ? `${w.weight_g}g` : '—'}</div>
              </div>
              <Link href={`/smartwatches/${w.id}`} className="text-accent font-mono text-[10px] uppercase mt-5 inline-block">View full specs →</Link>
            </div>
          ))}
          <div className="hidden md:flex items-center justify-center font-display font-bold text-2xl text-dim">VS</div>
        </section>

        <section className="bg-panel border border-line rounded-2xl p-5 mb-8">
          <div className="font-mono text-[9px] text-accent uppercase tracking-[0.14em]">Quick verdict</div>
          <div className="grid sm:grid-cols-3 gap-4 mt-4 items-center">
            <div><div className="text-dim text-xs">Comparison points</div><div className="font-display font-bold text-2xl mt-1">{scoreA} — {scoreB}</div></div>
            <div className="sm:col-span-2 text-sm leading-6 text-dim">{recommendation}</div>
          </div>
        </section>

        <section className="border border-line rounded-2xl overflow-hidden">
          <div className="p-5 bg-panel border-b border-line"><h2 className="font-display font-bold text-xl">Specifications compared</h2><p className="text-dim text-sm mt-1">The highlighted value is the stronger result for measurable specs.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-line bg-panel2"><th className="p-4 text-xs uppercase text-dim">Specification</th><th className="p-4 text-xs">{a.name}</th><th className="p-4 text-xs">{b.name}</th></tr></thead>
              <tbody>{ROWS.map(([label, get]) => <ComparisonRow key={label} label={label} get={get} a={a} b={b} />)}</tbody>
            </table>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4 mt-8">
          <div className="bg-panel border border-line rounded-2xl p-5"><h3 className="font-mono text-xs text-accent uppercase mb-3">Check price: {a.name}</h3><VendorButtonsFull links={linksA} /></div>
          <div className="bg-panel border border-line rounded-2xl p-5"><h3 className="font-mono text-xs text-accent uppercase mb-3">Check price: {b.name}</h3><VendorButtonsFull links={linksB} /></div>
        </section>

        {alternatives.length > 0 && <section className="mt-10"><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-2">More comparisons</div><h2 className="font-display font-bold text-2xl mb-4">Not sure between these two?</h2><div className="grid md:grid-cols-3 gap-3">{alternatives.map(({ w }) => <Link key={w.id} href={`/smartwatches/${w.id}`} className="bg-panel border border-line rounded-xl p-4 hover:border-accent transition-colors"><div className="font-mono text-[9px] text-dim uppercase">{brandMap.get(w.brand_id)?.name || w.brand_id}</div><div className="font-display font-semibold mt-1">{w.name}</div><div className="font-mono text-[9px] text-dim mt-2">Open product →</div></Link>)}</div></section>}
      </article>
    </>
  );
}

function similarity(a, b) {
  if (!a || !b) return 0;
  let score = 0;
  const ap = Number(a.price); const bp = Number(b.price);
  if (Number.isFinite(ap) && Number.isFinite(bp)) score += Math.max(0, 35 - (Math.abs(ap - bp) / Math.max(ap, 1)) * 100);
  if (a.brand_id === b.brand_id) score += 15;
  if (a.gamme && b.gamme && a.gamme === b.gamme) score += 18;
  for (const key of ['gps', 'cellular', 'ecg', 'blood_oxygen', 'nfc_payments', 'always_on_display', 'rugged', 'round_face']) if (Boolean(a[key]) === Boolean(b[key])) score += 2;
  if (a.ecosystem && b.ecosystem && a.ecosystem === b.ecosystem) score += 5;
  if (a.os && b.os && a.os === b.os) score += 3;
  return score;
}
