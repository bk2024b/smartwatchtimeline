import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllWatches, getWatchById, getBrandById, getProductLinks, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd, buildProductJsonLd } from '@/lib/seo';
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
  ['Blood oxygen (SpO2)', (w) => w.blood_oxygen ? 'Yes' : 'No'], ['Ecosystem', (w) => w.ecosystem || '—'],
  ['OS', (w) => w.os || '—'], ['Rugged', (w) => w.rugged ? 'Yes' : 'No'], ['Round face', (w) => w.round_face ? 'Yes' : 'No'],
];

function formatDate(value) { if (!value) return '—'; const date = new Date(value); if (Number.isNaN(date.getTime())) return value; return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date); }
function yearOf(value) { if (!value) return null; const year = new Date(value).getFullYear(); return Number.isFinite(year) ? year : null; }

export default async function WatchPage({ params }) {
  const { slug } = params;
  const [watch, productLinks, allWatches, brands] = await Promise.all([getWatchById(slug), getProductLinks(slug), getAllWatches(), getBrands()]);
  if (!watch) notFound();
  const brand = (brands || []).find((b) => b.id === watch.brand_id) || await getBrandById(watch.brand_id);
  const brandModels = (allWatches || []).filter((w) => w.brand_id === watch.brand_id).sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
  const lineup = watch.gamme ? brandModels.filter((w) => w.gamme === watch.gamme) : brandModels;
  const effectiveLineup = lineup.length ? lineup : [watch];
  const year = yearOf(watch.release_date);
  const sameYear = (allWatches || []).filter((w) => w.id !== watch.id && yearOf(w.release_date) === year).sort((a, b) => new Date(a.release_date) - new Date(b.release_date)).slice(0, 4);
  const nearby = (allWatches || []).filter((w) => w.id !== watch.id && w.brand_id !== watch.brand_id).filter((w) => { const p = Number(w.price); const c = Number(watch.price); return Number.isFinite(p) && Number.isFinite(c) && Math.abs(p - c) <= Math.max(75, c * 0.25); }).sort((a, b) => Math.abs(Number(a.price) - Number(watch.price)) - Math.abs(Number(b.price) - Number(watch.price))).slice(0, 3);
  const jsonLd = buildProductJsonLd(watch, brand, productLinks);
  const keySpecs = [['Battery', watch.battery_life_h ? `${watch.battery_life_h}h` : '—'], ['Weight', watch.weight_g ? `${watch.weight_g}g` : '—'], ['Water', watch.water_rating || '—'], ['GPS', watch.gps ? 'Yes' : 'No']];

  return <>
    <JsonLd data={jsonLd} />
    <article className="max-w-5xl mx-auto">
      <Link href={`/brands/${watch.brand_id}`} className="inline-flex text-dim text-xs font-mono mb-6 hover:text-accent transition-colors">← All {brand?.name || watch.brand_id} models</Link>
      <section className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-7 items-center">
        <div className="hardware-card relative aspect-square overflow-hidden flex items-center justify-center bg-panel2">{watch.image_url ? <img src={watch.image_url} alt={watch.name} className="max-w-[86%] max-h-[86%] object-contain floating-hardware" /> : <div className="font-mono text-dim text-xs uppercase tracking-widest">Smartwatch</div>}</div>
        <div><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-2">{brand?.name || watch.brand_id}{watch.gamme ? ` / ${watch.gamme}` : ''}</div><h1 className="font-display font-bold text-[clamp(32px,5vw,52px)] leading-tight tracking-tight mb-3">{watch.name}</h1><p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-2xl">{watch.tagline || 'A smartwatch tracked across the history of wearable technology.'}</p><div className="flex gap-2 flex-wrap mt-5"><Badge>{formatDate(watch.release_date)}</Badge>{watch.price !== null && watch.price !== undefined && <Badge>${Number(watch.price).toFixed(0)} launch</Badge>}{watch.marquant && <Badge gold>Notable model</Badge>}{watch.cellular && <Badge>Cellular</Badge>}</div><div className="flex gap-3 flex-wrap mt-5">{productLinks.length > 0 && <a href="#where-to-buy" className="btn-primary">Check price ↗</a>}<Link href={`/compare?with=${watch.id}`} className="btn-ghost text-sm">Compare this model</Link></div></div>
      </section>
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line rounded-2xl overflow-hidden mt-8">{keySpecs.map(([label, value]) => <div key={label} className="bg-panel p-4 sm:p-5"><div className="font-mono text-[9px] uppercase tracking-wider text-dim">{label}</div><div className="font-display font-bold text-lg sm:text-xl mt-1">{value}</div></div>)}</section>
      <ProductEvolution current={watch} lineup={effectiveLineup} />
      <section className="mt-10"><div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em] mb-2">Full specification</div><h2 className="font-display font-bold text-2xl mb-4">Every spec, in one place</h2><div className="overflow-x-auto border border-line rounded-2xl bg-panel"><table className="w-full text-sm"><tbody>{SPEC_ROWS.map(([label, get]) => <tr key={label} className="border-b border-line last:border-0"><td className="p-3.5 sm:p-4 text-dim w-1/2">{label}</td><td className="p-3.5 sm:p-4 font-mono">{get(watch)}</td></tr>)}</tbody></table></div></section>
      {watch.notes && <section className="mt-10 p-5 sm:p-6 rounded-2xl border border-line bg-panel"><div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em] mb-2">Editorial note</div><p className="text-dim text-sm leading-7">{watch.notes}</p></section>}
      {sameYear.length > 0 && <section className="mt-12"><div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em] mb-2">Same era</div><h2 className="font-display font-bold text-2xl mb-4">Other watches released in {year}</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{sameYear.map((model) => <Link key={model.id} href={`/smartwatches/${model.id}`} className="p-4 rounded-xl border border-line bg-panel hover:border-accent transition-colors"><div className="font-mono text-[10px] text-dim uppercase">{model.brand_id}</div><div className="font-display font-semibold mt-1">{model.name}</div><div className="font-mono text-xs text-dim mt-2">{Number.isFinite(Number(model.price)) ? `$${Number(model.price).toFixed(0)}` : 'Price unknown'}</div></Link>)}</div></section>}
      {nearby.length > 0 && <section className="mt-12"><div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em] mb-2">Worth comparing</div><h2 className="font-display font-bold text-2xl mb-4">Similar price, different approach</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{nearby.map((model) => <Link key={model.id} href={`/smartwatches/${model.id}`} className="p-4 rounded-xl border border-line bg-panel hover:border-accent transition-colors"><div className="font-mono text-[10px] text-dim uppercase">{model.brand_id}</div><div className="font-display font-semibold mt-1">{model.name}</div><div className="font-mono text-xs text-accent mt-2">${Number(model.price).toFixed(0)}</div></Link>)}</div></section>}
      <section id="where-to-buy" className="mt-12 hardware-card p-5 sm:p-6"><div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em] mb-2">Check price</div><h2 className="font-display font-bold text-2xl mb-4">Where to buy</h2>{productLinks.length > 0 ? <VendorButtonsFull links={productLinks} /> : <p className="text-dim text-sm">No retailer links are currently listed for this model.</p>}</section>
      <div className="mt-10 flex flex-wrap gap-3"><Link href={`/compare?with=${watch.id}`} className="btn-primary">Compare {watch.name}</Link><Link href="/timeline" className="btn-ghost">Explore the timeline</Link><Link href="/smartwatches" className="btn-ghost">Browse all models</Link></div>
    </article>
  </>;
}
