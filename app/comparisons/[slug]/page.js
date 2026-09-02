import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getAllWatches, getBrands, getProductLinks } from '@/lib/queries';
import { parseComparisonSlug, buildComparisonSlug, isCanonicalSlug } from '@/lib/compareSlug';
import { computeComparisonPairs } from '@/lib/comparisonPairs';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';
import { VendorButtonsFull } from '@/components/VendorButtons';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

// The bound: any slug not returned here 404s instead of rendering on
// demand. This is deliberate — see lib/comparisonPairs.js for why.
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
  const a = watches.find((w) => w.id === parsed[0]);
  const b = watches.find((w) => w.id === parsed[1]);
  return { a, b };
}

export async function generateMetadata({ params }) {
  const { a, b } = await loadPair(params.slug);
  if (!a || !b) return {};
  const title = `${a.name} vs ${b.name}`;
  return {
    title: `${title} | SmartwatchTimeline`,
    description: `Side-by-side comparison of ${a.name} and ${b.name}: battery life, display, health sensors, and price.`,
    ...canonicalFor(`/comparisons/${params.slug}`),
  };
}

const ROWS = [
  ['Release date', (w) => w.release_date],
  ['Price', (w) => (Number.isFinite(Number(w.price)) ? `$${Number(w.price).toFixed(0)}` : '—')],
  ['Battery life', (w) => (w.battery_life_h ? `${w.battery_life_h}h` : '—')],
  ['Weight', (w) => (w.weight_g ? `${w.weight_g}g` : '—')],
  ['Display', (w) => w.display_type || '—'],
  ['Water rating', (w) => w.water_rating || '—'],
  ['GPS', (w) => (w.gps ? 'Onboard' : 'Phone-dependent')],
  ['Cellular', (w) => (w.cellular ? 'Available' : 'No')],
  ['ECG', (w) => (w.ecg ? 'Yes' : 'No')],
  ['Blood oxygen', (w) => (w.blood_oxygen ? 'Yes' : 'No')],
];

export default async function ComparisonPage({ params }) {
  const { slug } = params;
  if (!isCanonicalSlug(slug)) {
    const parsed = parseComparisonSlug(slug);
    if (parsed) redirect(`/comparisons/${buildComparisonSlug(parsed[0], parsed[1])}`);
    notFound();
  }

  const { a, b } = await loadPair(slug);
  if (!a || !b) notFound();

  const [brands, linksA, linksB] = await Promise.all([getBrands(), getProductLinks(a.id), getProductLinks(b.id)]);
  const brandMap = new Map(brands.map((br) => [br.id, br]));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${a.name} vs ${b.name}`,
    url: `${SITE_URL}/comparisons/${slug}`,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-4xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Comparison</div>
        <h1 className="font-display font-bold text-[30px] sm:text-[40px] leading-tight mb-6">{a.name} vs {b.name}</h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[a, b].map((w) => (
            <div key={w.id} className="bg-panel border border-line rounded-2xl p-4">
              <div className="font-mono text-[10px] text-accent uppercase mb-1">{brandMap.get(w.brand_id)?.name || w.brand_id}</div>
              <h2 className="font-display font-semibold text-[16px]">{w.name}</h2>
              <Link href={`/smartwatches/${w.id}`} className="text-accent font-mono text-[10px] uppercase mt-2 inline-block">View full specs →</Link>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto border border-line rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="p-3">Spec</th>
                <th className="p-3">{a.name}</th>
                <th className="p-3">{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, get]) => (
                <tr key={label} className="border-b border-line last:border-0">
                  <td className="p-3 text-dim">{label}</td>
                  <td className="p-3 font-mono">{get(a)}</td>
                  <td className="p-3 font-mono">{get(b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div>
            <h3 className="font-mono text-xs text-accent uppercase mb-3">Check price: {a.name}</h3>
            <VendorButtonsFull links={linksA} />
          </div>
          <div>
            <h3 className="font-mono text-xs text-accent uppercase mb-3">Check price: {b.name}</h3>
            <VendorButtonsFull links={linksB} />
          </div>
        </div>
      </article>
      <Footer />
    </>
  );
}
