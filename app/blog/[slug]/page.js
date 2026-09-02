import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleById, getPublishedArticles } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';

export const revalidate = 600;
export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((article) => ({ slug: article.id }));
}

export async function generateMetadata({ params }) {
  const article = await getArticleById(params.slug);
  if (!article) return {};
  return {
    title: `${article.title} | SmartwatchTimeline`,
    description: article.excerpt,
    ...canonicalFor(`/blog/${article.id}`),
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `${SITE_URL}/blog/${article.id}`,
      type: 'article',
      publishedTime: article.published_at,
      siteName: 'SmartwatchTimeline',
    },
  };
}

function renderContent(content) {
  if (!content) return null;
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

export default async function EditorialPage({ params }) {
  const article = await getArticleById(params.slug);
  if (!article) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    url: `${SITE_URL}/blog/${article.id}`,
    image: article.cover_image_url ? [article.cover_image_url] : undefined,
    publisher: { '@type': 'Organization', name: 'SmartwatchTimeline' },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-4xl mx-auto">
        <Link href="/blog" className="font-mono text-[10px] uppercase text-accent hover:underline">← Back to editorial</Link>

        <header className="mt-8 pb-8 border-b border-line">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-wide text-accent">
            <span>Editorial</span>
            {article.published_at && (
              <>
                <span className="text-dim">•</span>
                <time dateTime={article.published_at} className="text-dim">{article.published_at.slice(0, 10)}</time>
              </>
            )}
            <span className="text-dim">•</span>
            <span className="text-dim">{article.reading_minutes || 1} min read</span>
          </div>
          <h1 className="font-display font-bold text-[38px] sm:text-[56px] leading-[1.05] mt-4">{article.title}</h1>
          <p className="text-dim text-[16px] sm:text-[18px] leading-8 mt-5 max-w-3xl">{article.excerpt}</p>
          {article.cover_image_url && (
            <img src={article.cover_image_url} alt="" className="w-full rounded-2xl border border-line mt-8" />
          )}
        </header>

        <div className="prose prose-invert max-w-none py-8 sm:py-12">
          {renderContent(article.content_html)}
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
