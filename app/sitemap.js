import { SITE_URL } from '@/lib/seo';
import { getAllWatches, getBrands } from '@/lib/queries';
import { GUIDE_PAGES } from '@/lib/guidePages';
import { EDITORIALS } from '@/lib/editorial';
import { computeComparisonPairs } from '@/lib/comparisonPairs';

export default async function sitemap() {
  const [watches, brands] = await Promise.all([getAllWatches(), getBrands()]);
  const now = new Date();
  const releaseYears = [...new Set(watches.map((w) => new Date(w.release_date).getFullYear()).filter(Number.isFinite))];

  const staticRoutes = [
    '/',
    '/explore',
    '/smartwatches',
    '/guides',
    '/blog',
    '/finder',
    '/timeline',
    '/brands',
    '/years',
    '/technologies',
    '/insights',
    '/compare',
    '/privacy',
  ].map((path) => ({
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

  const editorialRoutes = EDITORIALS.map((article) => ({
    url: `${SITE_URL}/blog/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly',
    priority: 0.7,
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

  const yearRoutes = releaseYears.map((year) => ({
    url: `${SITE_URL}/years/${year}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const technologyRoutes = [
    'gps',
    'cellular',
    'ecg',
    'blood-oxygen',
    'nfc-payments',
    'always-on-display',
    'rugged',
    'round-case',
  ].map((slug) => ({
    url: `${SITE_URL}/technologies/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.55,
  }));

  const insightRoutes = [
    'battery',
    'price',
    'weight',
    'display',
    'health',
    'connectivity',
    'brands',
  ].map((metric) => ({
    url: `${SITE_URL}/insights/${metric}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.55,
  }));

  // Only the curated pairs (same set as generateStaticParams in
  // app/comparisons/[slug]/page.js) — never advertise URLs the route cannot render.
  const comparisonRoutes = computeComparisonPairs(watches).map((slug) => ({
    url: `${SITE_URL}/comparisons/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...guideRoutes,
    ...editorialRoutes,
    ...watchRoutes,
    ...brandRoutes,
    ...yearRoutes,
    ...technologyRoutes,
    ...insightRoutes,
    ...comparisonRoutes,
  ];
}
