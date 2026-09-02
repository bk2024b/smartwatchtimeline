import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllWatches, getBrands, getAllProductLinks } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';
import { GUIDE_PAGES, getGuide } from '@/lib/guidePages';
import ProductCard from '@/components/ProductCard';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateStaticParams() {
  return GUIDE_PAGES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }) {
  const guide = getGuide(params.slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | SmartwatchTimeline`,
    description: guide.description,
    openGraph: { title: guide.title, description: guide.description },
    ...canonicalFor(`/guides/${params.slug}`),
  };
}

function FAQ({ items }) {
  return (
    <section className="mt-14">
      <h2 className="font-display font-semibold text-[24px] mb-5">Frequently asked questions</h2>
      <div className="divide-y divide-line border-y border-line">
        {items.map(([q, a]) => (
          <details key={q} className="py-4 group">
            <summary className="cursor-pointer list-none font-display font-medium flex justify-between gap-4">
              {q}
              <span className="text-accent group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-dim text-sm leading-7 mt-3 max-w-3xl">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default async function GuidePage({ params }) {
  const { slug } = params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const [watches, brands, productLinks] = await Promise.all([getAllWatches(), getBrands(), getAllProductLinks()]);
  const brandMap = new Map(brands.map((b) => [b.id, b]));
  const linksByWatch = new Map();
  for (const link of productLinks) {
    if (!linksByWatch.has(link.smartwatch_id)) linksByWatch.set(link.smartwatch_id, []);
    linksByWatch.get(link.smartwatch_id).push(link);
  }

  let candidates = guide.brandCompare
    ? watches.filter((w) => guide.brandCompare.includes(w.brand_id))
    : watches.filter((w) => !guide.filter || guide.filter(w));
  if (guide.sort) candidates = [...candidates].sort(guide.sort);
  candidates = candidates.slice(0, 12);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    url: `${SITE_URL}/guides/${slug}`,
  };
  if (guide.faq) {
    jsonLd.mainEntity = guide.faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    }));
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-6xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Smartwatch Guide</div>
        <h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">{guide.title}</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">{guide.intro}</p>

        <section className="mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((watch, i) => (
              <ProductCard
                key={watch.id}
                watch={watch}
                brand={brandMap.get(watch.brand_id)}
                rank={i + 1}
                productLinks={linksByWatch.get(watch.id) || []}
              />
            ))}
          </div>
          {candidates.length === 0 && <p className="text-dim text-sm">No models match this guide's criteria yet.</p>}
        </section>

        <div className="grid gap-8 mt-12">
          {guide.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="font-display font-semibold text-[21px] mb-2">{heading}</h2>
              <p className="text-dim text-[14px] leading-7">{body}</p>
            </section>
          ))}
        </div>

        {guide.faq && <FAQ items={guide.faq} />}

        <div className="mt-10 flex flex-wrap gap-3 text-sm">
          <Link href="/compare" className="px-4 py-2 rounded-lg border border-line hover:border-accent transition-colors">
            Find my smartwatch
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
