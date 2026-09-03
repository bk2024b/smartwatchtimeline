import { getAllWatches, getBrands } from '@/lib/queries';
import { canonicalFor, JsonLd, SITE_URL } from '@/lib/seo';
import SmartwatchFinder from '@/components/SmartwatchFinder';

export const revalidate = 3600;

export async function generateMetadata() {
  return { title: 'Smartwatch Finder — Find Your Best Match | SmartwatchTimeline', description: 'Answer a few questions and discover the smartwatches that best match your budget, ecosystem, health, sports and battery priorities.', ...canonicalFor('/finder') };
}

export default async function FinderPage() {
  const [watches, brands] = await Promise.all([getAllWatches(), getBrands()]);
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Smartwatch Finder', applicationCategory: 'Shopping', description: 'Personalized smartwatch recommendation tool.', url: `${SITE_URL}/finder` };
  return <><JsonLd data={jsonLd} /><article className="py-8 sm:py-14"><SmartwatchFinder watches={watches} brands={brands} /></article></>;
}
