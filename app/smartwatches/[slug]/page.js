import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllWatches, getWatchById, getBrandById, getProductLinks, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd, buildProductJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';
import { VendorButtonsFull } from '@/components/VendorButtons';
import { Badge } from '@/components/UI';
import ProductEvolution from '@/components/ProductEvolution';

export const revalidate = 3600;

export async function generateStaticParams() {
  try { return (await getAllWatches()).map((w) => ({ slug: w.id })); } catch { return []; }
}

export async function generateMetadata({ params }) {
  const watch = await getWatchById(params.slug);
  if (!watch) return { title: 'Not found — SmartwatchTimeline' };
  const brand = await getBrandById(watch.brand_id);
  const title = `${watch.name} — Full specs, price & history | SmartwatchTimeline`;
  const description = watch.tagline || `${watch.name} by ${brand?.name || watch.brand_id}: specifications, launch price, battery life, health features and timeline.`;
  return { title, description, ...canonicalFor(`/smartwatches/${params.slug}`), openGraph: { title: `${watch.name} — ${brand?.name || watch.brand_id}`, description, images: watch.image_url ? [watch.image_url] : undefined } };
}

const SPEC_ROWS = [
  ['Release date', (w) => w.release_date || '—'], ['Launch price', (w) => Number.isFinite(Number(w.price)) ? `$${Number(w.price).toFixed(0)}` : '—'],
  ['Battery life', (w) => w.battery_life_h ? `${w.battery_life_h}h` : '—'], ['Weight', (w) => w.weight_g ? `${w.weight_g}g` : '—'],
  ['Case size', (w) => w.case_size_mm ? `${w.case_size_mm}mm` : '—'], ['Display', (w) => w.display_type || '—'],
  ['Always-on display', (w) => w.always_on_display ? 'Yes' : 'No'], ['Water rating', (w) => w.water_rating || '—'],
  ['GPS', (w) => w.gps ? 'Onboard' : 'Phone-dependent'], ['Cellular', (w) => w.cellular ? 'Available' : 'No'],
  ['NFC payments', (w) => w.nfc_payments ? 'Yes' : 'No'], ['ECG', (w) => w.ecg ? 'Yes' : 'No'],
  ['Blood oxygen (SpO2)', (w) => w.blood_oxygen ? 'Yes' : 'No'], ['Heart-rate tracking', (w) => w.heart_rate ? 'Yes' : 'No'],
  ['Sleep tracking', (w) => w.sleep_tracking ? 'Yes' : 'No'], ['GPS sports modes', (w) => Number.isFinite(Number(w.gps_sports_modes)) ? w.gps_sports_modes : '—'],
  ['Ecosystem', (w) => w.ecosystem || '—'], ['OS', (w) => w.os || '—'], ['Rugged', (w) => w.rugged ? 'Yes' : 'No'], ['Round face', (w) => w.round_face ? 'Yes' : 'No'],
];

function formatDate(value) { if (!value) return '—'; const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date); }
function yearOf(value) { if (!value) return null; const year = new Date(value).getFullYear(); return Number.isFinite(year) ? year : null; }
function scoreCandidate(current, candidate) {
  if (!candidate || candidate.id === current.id) return -Infinity;
  let score = 0;
  const currentPrice = Number(current.price), candidatePrice = Number(candidate.price);
  if (Number.isFinite(currentPrice) && Number.isFinite(candidatePrice)) { const gap = Math.abs(candidatePrice - currentPrice) / Math.max(currentPrice, 1); score += Math.max(0, 34 - gap * 100); }
  if (candidate.brand_id === current.brand_id) score += 20;
  if (candidate.gamme && current.gamme && candidate.gamme === current.gamme) score += 24;
  const currentYear = yearOf(current.release_date), candidateYear = yearOf(candidate.release_date);
  if (currentYear !== null && candidateYear !== null) score += Math.max(0, 14 - Math.abs(candidateYear - currentYear) * 2);
  for (const feature of ['gps', 'cellular', 'ecg', 'blood_oxygen', 'nfc_payments', 'always_on_display', 'rugged', 'round_face']) if (Boolean(candidate[feature]) === Boolean(current[feature])) score += 2;
  if (candidate.ecosystem && current.ecosystem && candidate.ecosystem === current.ecosystem) score += 5;
  if (candidate.os && current.os && candidate.os === current.os) score += 3;
  if (Number.isFinite(Number(candidate.battery_life_h)) && Number.isFinite(Number(current.battery_life_h))) score += Math.max(0, 5 - Math.abs(Number(candidate.battery_life_h) - Number(current.battery_life_h)) / 12);
  return score;
}

function RecommendationCard({ model, label }) {
  return <Link href={`/smartwatches/${model.id}`} className="group p-4 sm:p-5 rounded-xl border border-line bg-panel hover:border-accent transition-colors"><div className="flex items-center justify-between gap-3"><div className="font-mono text-[9px] text-accent uppercase tracking-wider">{label}</div>{model.marquant && <span className="font-mono text-[9px] text-dim">Notable</span>}</div><div className="font-display font-semibold mt-2 group-hover:text-accent transition-colors">{model.name}</div><div className="font-mono text-[10px] text-dim mt-1">{model.brand_id}{model.gamme ? ` · ${model.gamme}` : ''}</div><div className="flex flex-wrap gap-2 mt-3 font-mono text-[9px] text-dim">{Number.isFinite(Number(model.price)) && <span>${Number(model.price).toFixed(0)}</span>}{model.battery_life_h && <span>· {model.battery_life_h}h battery</span>}{model.gps && <span>· GPS</span>}{model.ecg && <span>· ECG</span>}</div></Link>;
}

export default async function WatchPage({ params }) {
  const { slug } = params;
  const [watch, productLinks, allWatches, brands] = await Promise.all([getWatchById(slug), getProductLinks(slug), getAllWatches(), getBrands()]);
  if (!watch) notFound();
  const brand = (brands || []).find((b) => b.id === watch.brand_id) || await getBrandById(watch.brand_id);
  const brandModels = (allWatches || []).filter((w) => w.brand_id === watch.brand_id).sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
  const lineup = watch.gamme ? brandModels.filter((w) => w.gamme === watch.gamme) : brandModels;
  const effectiveLineup = lineup.length ? lineup : [watch];
  const first = effectiveLineup[0];
  const index = effectiveLineup.findIndex((w) => w.id === watch.id);
  const previous = index > 0 ? effectiveLineup[index - 1] : null;
  const next = index >= 0 && index < effectiveLineup.length - 1 ? effectiveLineup[index + 1] : null;
  const year = yearOf(watch.release_date);
  const sameYear = (allWatches || []).filter((w) => w.id !== watch.id && yearOf(w.release_date) === year).sort((a, b) => new Date(a.release_date) - new Date(b.release_date)).slice(0, 4);
  const ranked = (allWatches || []).filter((w) => w.id !== watch.id).map((model) => ({ model, score: scoreCandidate(watch, model) })).sort((a, b) => b.score - a.score);
  const sameLineup = ranked.filter(({ model }) => model.brand_id === watch.brand_id && watch.gamme && model.gamme === watch.gamme).slice(0, 2).map(({ model }) => model);
  const rivals = ranked.filter(({ model }) => model.brand_id !== watch.brand_id).slice(0, 3).map(({ model }) => model);
  const jsonLd = buildProductJsonLd(watch, brand, productLinks);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Smartwatches', url: '/smartwatches' },
    { name: brand?.name || watch.brand_id, url: `/brands/${watch.brand_id}` },
    { name: watch.name },
  ]);
  const keySpecs = [['Battery', watch.battery_life_h ? `${watch.battery_life_h}h` : '—'], ['Weight', watch.weight_g ? `${watch.weight_g}g` : '—'], ['Water', watch.water_rating || '—'], ['GPS', watch.gps ? 'Yes' : 'No']];
  return <><JsonLd data={jsonLd} /><JsonLd data={breadcrumbJsonLd} /><article className="max-w-5xl mx-auto">
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 mb-6 font-mono text-[10px] text-dim uppercase tracking-wider"><Link href="/" className="hover:text-accent">Home</Link><span>/</span><Link href="/smartwatches" className="hover:text-accent">Smartwatches</Link><span>/</span><Link href={`/brands/${watch.brand_id}`} className="hover:text-accent">{brand?.name || watch.brand_id}</Link><span>/</span><span className="text-fg">{watch.name}</span></nav>
    <section className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-7 items-center"><div className="hardware-card relative aspect-square overflow-hidden flex items-center justify-center bg-panel2">{watch.image_url ? <img src={watch.image_url} alt={watch.name} className="max-w-[86%] max-h-[86%] object-contain floating-hardware" /> : <div className="font-mono text-dim text-xs uppercase tracking-widest">Smartwatch</div>}</div><div><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-2">{brand?.name || watch.brand_id}{watch.gamme ? ` / ${watch.gamme}` : ''}</div><h1 className="font-display font-bold text-[clamp(32px,5vw,52px)] leading-tight tracking-tight mb-3">{watch.name}</h1><p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-2xl">{watch.tagline || 'A smartwatch tracked across the history of wearable technology.'}</p><div className="flex gap-2 flex-wrap mt-5"><Badge>{formatDate(watch.release_date)}</Badge>{watch.price !== null && watch.price !== undefined && <Badge>${Number(watch.price).toFixed(0)} launch</Badge>}{watch.marquant && <Badge gold>Notable model</Badge>}{watch.cellular && <Badge>Cellular</Badge>}{watch.gps && <Badge>GPS</Badge>}{watch.ecg && <Badge>ECG</Badge>}{watch.blood_oxygen && <Badge>SpO₂</Badge>}</div><div className="flex gap-3 flex-wrap mt-5">{productLinks.length > 0 && <a href="#where-to-buy" className="btn-primary">Check price ↗</a>}<Link href={`/compare?with=${watch.id}`} className="btn-ghost text-sm">Compare this model</Link></div></div></section>
    <section className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line rounded-2xl overflow-hidden mt-8">{keySpecs.map(([label, value]) => <div key={label} className="bg-panel p-4 sm:p-5"><div className="font-mono text-[9px] uppercase tracking-wider text-dim">{label}</div><div className="font-display font-bold text-lg sm:text-xl mt-1">{value}</div></div>)}</section>
    <ProductEvolution current={watch} lineup={effectiveLineup} />
    {effectiveLineup.length > 1 && <section className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3"><div>{previous && <Link href={`/smartwatches/${previous.id}`} className="block p-4 rounded-xl border border-line bg-panel hover:border-accent transition-colors"><div className="font-mono text-[9px] text-dim uppercase">Previous in lineup</div><div className="font-display font-semibold mt-1">← {previous.name}</div></Link>}</div><div>{next && <Link href={`/smartwatches/${next.id}`} className="block p-4 rounded-xl border border-line bg-panel hover:border-accent transition-colors sm:text-right"><div className="font-mono text-[9px] text-dim uppercase">Next in lineup</div><div className="font-display font-semibold mt-1">{next.name} →</div></Link>}</div></section>}
    <section className="mt-10"><div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em] mb-2">Full specification</div><h2 className="font-display font-bold text-2xl mb-4">Every spec, in one place</h2><div className="overflow-x-auto border border-line rounded-2xl bg-panel"><table className="w-full text-sm"><tbody>{SPEC_ROWS.map(([label, get]) => <tr key={label} className="border-b border-line last:border-0"><td className="p-3.5 sm:p-4 text-dim w-1/2">{label}</td><td className="p-3.5 sm:p-4 font-mono">{get(watch)}</td></tr>)}</tbody></table></div></section>
    <section className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">{year && <Link href={`/years/${year}`} className="p-4 rounded-xl border border-line bg-panel hover:border-accent transition-colors"><div className="font-mono text-[9px] text-dim uppercase">Release year</div><div className="font-display font-semibold mt-1">{year}</div></Link>}<Link href={`/brands/${watch.brand_id}`} className="p-4 rounded-xl border border-line bg-panel hover:border-accent transition-colors"><div className="font-mono text-[9px] text-dim uppercase">Brand</div><div className="font-display font-semibold mt-1">{brand?.name || watch.brand_id}</div></Link>{watch.gps && <Link href="/technologies/gps" className="p-4 rounded-xl border border-line bg-panel hover:border-accent transition-colors"><div className="font-mono text-[9px] text-dim uppercase">Technology</div><div className="font-display font-semibold mt-1">GPS</div></Link>}{watch.cellular && <Link href="/technologies/cellular" className="p-4 rounded-xl border border-line bg-panel hover:border-accent transition-colors"><div className="font-mono text-[9px] text-dim uppercase">Technology</div><div className="font-display font-semibold mt-1">Cellular / LTE</div></Link>}</section>
    {watch.notes && <section className="mt-10 p-5 sm:p-6 rounded-2xl border border-line bg-panel"><div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em] mb-2">Editorial note</div><p className="text-dim text-sm leading-7">{watch.notes}</p></section>}
    {(sameLineup.length > 0 || rivals.length > 0) && <section className="mt-12"><div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em] mb-2">Smart comparisons</div><h2 className="font-display font-bold text-2xl mb-2">What should you compare it with?</h2><p className="text-dim text-sm leading-6 mb-5">Recommendations are ranked using price, lineup, release era, core features and ecosystem similarity.</p>{sameLineup.length > 0 && <><div className="font-mono text-[9px] text-dim uppercase tracking-wider mb-2">Same lineup</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">{sameLineup.map((model) => <RecommendationCard key={model.id} model={model} label="Upgrade / previous generation" />)}</div></>}{rivals.length > 0 && <><div className="font-mono text-[9px] text-dim uppercase tracking-wider mb-2">Closest alternatives</div><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{rivals.map((model) => <RecommendationCard key={model.id} model={model} label="Alternative" />)}</div></>}</section>}
    {sameYear.length > 0 && <section className="mt-12"><div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em] mb-2">Same era</div><h2 className="font-display font-bold text-2xl mb-4">Other watches released in {year}</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{sameYear.map((model) => <Link key={model.id} href={`/smartwatches/${model.id}`} className="p-4 rounded-xl border border-line bg-panel hover:border-accent transition-colors"><div className="font-mono text-[10px] text-dim uppercase">{model.brand_id}</div><div className="font-display font-semibold mt-1">{model.name}</div><div className="font-mono text-xs text-dim mt-2">{Number.isFinite(Number(model.price)) ? `$${Number(model.price).toFixed(0)}` : 'Price unknown'}</div></Link>)}</div></section>}
    <section id="where-to-buy" className="mt-12 hardware-card p-5 sm:p-6"><div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em] mb-2">Check price</div><h2 className="font-display font-bold text-2xl mb-4">Where to buy</h2>{productLinks.length > 0 ? <VendorButtonsFull links={productLinks} /> : <p className="text-dim text-sm">No retailer links are currently listed for this model.</p>}</section>
    <div className="mt-10 flex flex-wrap gap-3"><Link href={`/compare?with=${watch.id}`} className="btn-primary">Compare {watch.name}</Link><Link href="/finder" className="btn-ghost">Find the right smartwatch</Link><Link href="/timeline" className="btn-ghost">Explore the timeline</Link><Link href="/smartwatches" className="btn-ghost">Browse all models</Link></div>
  </article></>;
}
