import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllWatches, getWatchById, getBrandById, getProductLinks } from '@/lib/queries';
import { canonicalFor, JsonLd, buildProductJsonLd } from '@/lib/seo';
import { VendorButtonsFull } from '@/components/VendorButtons';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const watches = await getAllWatches();
    return watches.map((w) => ({ slug: w.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const watch = await getWatchById(params.slug);
  if (!watch) return {};
  const title = `${watch.name} — Specs, Price & Timeline`;
  return {
    title: `${title} | SmartwatchTimeline`,
    description: watch.tagline,
    openGraph: { title, description: watch.tagline },
    ...canonicalFor(`/smartwatches/${params.slug}`),
  };
}

const SPEC_ROWS = [
  ['Release date', (w) => w.release_date],
  ['Price (MSRP)', (w) => (Number.isFinite(Number(w.price)) ? `$${Number(w.price).toFixed(0)}` : '—')],
  ['Battery life', (w) => (w.battery_life_h ? `${w.battery_life_h}h` : '—')],
  ['Weight', (w) => (w.weight_g ? `${w.weight_g}g` : '—')],
  ['Case size', (w) => (w.case_size_mm ? `${w.case_size_mm}mm` : '—')],
  ['Display', (w) => w.display_type || '—'],
  ['Always-on display', (w) => (w.always_on_display ? 'Yes' : 'No')],
  ['Water rating', (w) => w.water_rating || '—'],
  ['GPS', (w) => (w.gps ? 'Onboard' : 'Phone-dependent')],
  ['Cellular', (w) => (w.cellular ? 'Available' : 'No')],
  ['NFC payments', (w) => (w.nfc_payments ? 'Yes' : 'No')],
  ['ECG', (w) => (w.ecg ? 'Yes' : 'No')],
  ['Blood oxygen (SpO2)', (w) => (w.blood_oxygen ? 'Yes' : 'No')],
  ['Ecosystem', (w) => w.ecosystem || '—'],
  ['OS', (w) => w.os || '—'],
];

export default async function WatchPage({ params }) {
  const { slug } = params;
  const [watch, productLinks] = await Promise.all([getWatchById(slug), getProductLinks(slug)]);
  if (!watch) notFound();
  const brand = await getBrandById(watch.brand_id);

  const jsonLd = buildProductJsonLd(watch, brand, productLinks);

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-4xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">
          <Link href={`/brands/${watch.brand_id}`} className="hover:underline">{brand?.name || watch.brand_id}</Link>
          {' · '}{watch.gamme}
        </div>
        <h1 className="font-display font-bold text-[32px] sm:text-[44px] leading-tight mb-3">{watch.name}</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-2xl">{watch.tagline}</p>

        <section className="mt-8">
          <h2 className="font-mono text-xs text-accent uppercase tracking-[0.12em] mb-3">Check price</h2>
          <VendorButtonsFull links={productLinks} />
        </section>

        <section className="mt-10">
          <h2 className="font-display font-semibold text-[22px] mb-4">Full specs</h2>
          <div className="overflow-x-auto border border-line rounded-2xl">
            <table className="w-full text-sm">
              <tbody>
                {SPEC_ROWS.map(([label, get]) => (
                  <tr key={label} className="border-b border-line last:border-0">
                    <td className="p-3 text-dim">{label}</td>
                    <td className="p-3 font-mono">{get(watch)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {watch.notes && (
          <section className="mt-10">
            <h2 className="font-display font-semibold text-[20px] mb-2">Notes</h2>
            <p className="text-dim text-sm leading-7">{watch.notes}</p>
          </section>
        )}

        <div className="mt-10 flex flex-wrap gap-3 text-sm">
          <Link href={`/compare?with=${watch.id}`} className="px-4 py-2 rounded-lg border border-line hover:border-accent transition-colors">
            Compare this model
          </Link>
          <Link href="/smartwatches" className="px-4 py-2 rounded-lg border border-line hover:border-accent transition-colors">
            Browse all models
          </Link>
        </div>
      </article>
      <Footer />
    </>
  );
}
