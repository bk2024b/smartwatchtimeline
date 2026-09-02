import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EDITORIALS, getEditorial } from '@/lib/editorial';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return EDITORIALS.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }) {
  const article = getEditorial(params.slug);
  if (!article) return {};
  return {
    title: `${article.title} | SmartwatchTimeline`,
    description: article.excerpt,
    ...canonicalFor(`/blog/${article.slug}`),
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${SITE_URL}/blog/${article.slug}`,
      type: 'article',
      publishedTime: article.date,
      siteName: 'SmartwatchTimeline',
    },
  };
}

export default function EditorialPage({ params }) {
  const article = getEditorial(params.slug);
  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    url: `${SITE_URL}/blog/${article.slug}`,
    publisher: { '@type': 'Organization', name: 'SmartwatchTimeline' },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-4xl mx-auto">
        <Link href="/blog" className="font-mono text-[10px] uppercase text-accent hover:underline">← Back to editorial</Link>

        <header className="mt-8 pb-8 border-b border-line">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-wide text-accent">
            <span>{article.category}</span>
            <span className="text-dim">•</span>
            <time dateTime={article.date} className="text-dim">{article.date}</time>
            <span className="text-dim">•</span>
            <span className="text-dim">{article.readTime}</span>
          </div>
          <h1 className="font-display font-bold text-[38px] sm:text-[56px] leading-[1.05] mt-4">{article.title}</h1>
          <p className="text-dim text-[16px] sm:text-[18px] leading-8 mt-5 max-w-3xl">{article.excerpt}</p>
        </header>

        <div className="prose prose-invert max-w-none py-8 sm:py-12">
          {article.sections.map(([heading, body]) => (
            <section key={heading} className="mb-10 last:mb-0">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">{heading}</h2>
              <p className="text-dim text-[15px] sm:text-[17px] leading-8">{body}</p>
            </section>
          ))}
        </div>

        <div className="border border-line bg-panel rounded-2xl p-6 mt-4">
          <div className="font-mono text-[10px] uppercase text-accent mb-2">Explore more</div>
          <div className="flex flex-wrap gap-3">
            <Link href="/finder" className="btn-primary">Find your watch</Link>
            <Link href="/compare" className="btn-secondary">Compare models</Link>
            <Link href="/timeline" className="btn-secondary">Explore timeline</Link>
          </div>
        </div>
      </article>
    </>
  );
}
