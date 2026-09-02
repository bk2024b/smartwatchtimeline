import Link from 'next/link';
import { EDITORIALS } from '@/lib/editorial';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

export const metadata = {
  title: 'Smartwatch Blog | SmartwatchTimeline',
  description: 'Smartwatch history, technology explainers and practical buying guides from SmartwatchTimeline.',
  ...canonicalFor('/blog'),
};

export default function BlogPage() {
  const articles = [...EDITORIALS].sort((a, b) => new Date(b.date) - new Date(a.date));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Smartwatch Blog',
    url: `${SITE_URL}/blog`,
    mainEntity: articles.map((article) => ({
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      datePublished: article.date,
      url: `${SITE_URL}/blog/${article.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-6xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase mb-3">Editorial</div>
        <h1 className="font-display font-bold text-[38px] sm:text-[56px] leading-tight mb-4">Smartwatch Blog</h1>
        <p className="text-dim text-[15px] sm:text-[17px] leading-7 max-w-3xl">
          The technology, history and buying decisions behind the watches we track.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mt-10">
          {articles.map((article, index) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className={`group block bg-panel border border-line rounded-2xl p-6 hover:border-accent transition-colors ${index === 0 ? 'md:col-span-2' : ''}`}
            >
              <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wide text-accent">
                <span>{article.category}</span>
                <span className="text-dim">•</span>
                <span className="text-dim">{article.readTime}</span>
              </div>
              <h2 className={`${index === 0 ? 'text-[27px] sm:text-[34px]' : 'text-[22px]'} font-display font-bold leading-tight mt-3 group-hover:text-accent transition-colors`}>
                {article.title}
              </h2>
              <p className="text-dim text-sm sm:text-[15px] leading-7 mt-3 max-w-3xl">{article.excerpt}</p>
              <div className="mt-5 text-accent font-mono text-[10px] uppercase">Read article →</div>
            </Link>
          ))}
        </div>
      </article>
    </>
  );
}
