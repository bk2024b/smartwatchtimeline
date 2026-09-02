import { SITE_URL } from '@/lib/seo';
import { getAllWatches, getBrands } from '@/lib/queries';
import { GUIDE_PAGES } from '@/lib/guidePages';
import { computeComparisonPairs } from '@/lib/comparisonPairs';

export default async function sitemap() {
  const [watches, brands] = await Promise.all([getAllWatches(), getBrands()]);
  const now = new Date();

  const staticRoutes = ['/', '/smartwatches', '/guides', '/timeline', '/compare', '/privacy'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }));

  const guideRoutes = GUIDE_PAGES.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: g.priority || 0.7,
  }));

  const watchRoutes = watches.map((w) => ({
    url: `${SITE_URL}/smartwatches/${w.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const brandRoutes = brands.map((b) => ({
    url: `${SITE_URL}/brands/${b.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Only the curated pairs (same set as generateStaticParams in
  // app/comparisons/[slug]/page.js) — the sitemap should never advertise a
  // URL that the route itself would 404 on.
  const comparisonRoutes = computeComparisonPairs(watches).map((slug) => ({
    url: `${SITE_URL}/comparisons/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...guideRoutes, ...watchRoutes, ...brandRoutes, ...comparisonRoutes];
}
