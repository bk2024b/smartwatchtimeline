import Link from 'next/link';
import { getAllWatches, getBrands, getAllProductLinks } from '@/lib/queries';
import { Stat, Footer } from '@/components/UI';
import ProductCard from '@/components/ProductCard';
import { GUIDE_PAGES } from '@/lib/guidePages';

export const revalidate = 3600;

export default async function HomePage() {
  const [watches, brands, productLinks] = await Promise.all([getAllWatches(), getBrands(), getAllProductLinks()]);
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const linksByWatch = new Map();
  for (const link of productLinks) {
    if (!linksByWatch.has(link.smartwatch_id)) linksByWatch.set(link.smartwatch_id, []);
    linksByWatch.get(link.smartwatch_id).push(link);
  }
  const latest = [...watches].sort((a, b) => new Date(b.release_date) - new Date(a.release_date)).slice(0, 6);

  return (
    <>
      <section className="pt-8 pb-14">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">SmartwatchTimeline</div>
        <h1 className="font-display font-bold text-[40px] sm:text-[60px] leading-[1.05] mb-5 max-w-3xl">
          The complete history of smartwatches, brand by brand.
        </h1>
        <p className="text-dim text-[15px] sm:text-[18px] leading-7 max-w-2xl">
          Battery life, health sensors, water resistance and price — every model, every generation, compared honestly.
        </p>
        <div className="flex flex-wrap gap-8 mt-10">
          <Stat value={watches.length} label="Models tracked" />
          <Stat value={brands.length} label="Brands" />
          <Stat value={GUIDE_PAGES.length} label="Buying guides" />
        </div>
      </section>

      <section className="mb-14">
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-display font-semibold text-[24px]">Latest models</h2>
          <Link href="/smartwatches" className="text-accent font-mono text-xs uppercase">Browse all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {latest.map((watch) => (
            <ProductCard key={watch.id} watch={watch} brand={brandMap.get(watch.brand_id)} productLinks={linksByWatch.get(watch.id) || []} />
          ))}
        </div>
      </section>

      <section className="mb-14">
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-display font-semibold text-[24px]">Popular guides</h2>
          <Link href="/guides" className="text-accent font-mono text-xs uppercase">All guides →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {GUIDE_PAGES.slice(0, 3).map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors">
              <h3 className="font-display font-semibold text-[16px]">{g.title}</h3>
              <p className="text-dim text-sm mt-2 leading-6">{g.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
