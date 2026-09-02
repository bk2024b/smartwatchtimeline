import Link from 'next/link';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';
import { GUIDE_PAGES } from '@/lib/guidePages';
import { Footer } from '@/components/UI';

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'Smartwatch Guides | SmartwatchTimeline',
    description: 'All our guides for finding the best smartwatch by budget, use case and health features.',
    ...canonicalFor('/guides'),
  };
}

export default function GuidesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Smartwatch Guides',
    url: `${SITE_URL}/guides`,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-6xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase mb-3">Guides</div>
        <h1 className="font-display font-bold text-[38px] sm:text-[54px] leading-tight mb-4">Smartwatch Guides</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">
          Find the right smartwatch for your budget, your health goals, and how you'll actually wear it.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {GUIDE_PAGES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors"
            >
              <h3 className="font-display font-semibold text-[17px] group-hover:text-accent transition-colors">{guide.title}</h3>
              <p className="text-dim text-sm leading-6 mt-2">{guide.description}</p>
              <div className="mt-4 text-accent font-mono text-[10px] uppercase">Read guide →</div>
            </Link>
          ))}
        </div>
      </article>
      <Footer />
    </>
  );
}
