import Link from 'next/link';
import { getPublishedGuides } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

export const metadata = {
  title: 'Smartwatch Guides | SmartwatchTimeline',
  description: 'All our guides for finding the best smartwatch by budget, use case and health features.',
  ...canonicalFor('/guides'),
};

export default async function GuidesPage() {
  const guides = await getPublishedGuides();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Smartwatch Guides',
    url: `${SITE_URL}/guides`,
    mainEntity: guides.map((guide) => ({
      '@type': 'Article',
      headline: guide.title,
      description: guide.description,
      url: `${SITE_URL}/guides/${guide.slug}`,
    })),
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

        {guides.length === 0 ? (
          <div className="border border-line bg-panel rounded-2xl p-8 mt-10 text-dim">No published guides yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group block bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors"
              >
                <div className="text-[10px] font-mono uppercase tracking-wide text-accent mb-2">
                  {guide.category || 'Guide'}
                </div>
                <h3 className="font-display font-semibold text-[17px] group-hover:text-accent transition-colors">{guide.title}</h3>
                <p className="text-dim text-sm leading-6 mt-2">{guide.description}</p>
                <div className="mt-4 text-accent font-mono text-[10px] uppercase">Read guide →</div>
              </Link>
            ))}
          </div>
        )}
      </article>
    </>
  );
}
