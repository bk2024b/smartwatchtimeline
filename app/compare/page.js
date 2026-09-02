import { Suspense } from 'react';
import { getAllWatches } from '@/lib/queries';
import { canonicalFor } from '@/lib/seo';
import CompareForm from './CompareForm';

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: 'Compare Smartwatches | SmartwatchTimeline',
    description: 'Pick any two smartwatches and compare their specs side by side.',
    ...canonicalFor('/compare'),
  };
}

export default async function ComparePage() {
  const watches = await getAllWatches();

  return (
    <>
      <article className="max-w-3xl mx-auto">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Compare</div>
        <h1 className="font-display font-bold text-[34px] sm:text-[48px] leading-tight mb-4">Find My Smartwatch</h1>
        <p className="text-dim text-[15px] leading-7 max-w-2xl mb-8">Pick any two models to compare battery life, sensors, and price side by side.</p>
        <Suspense fallback={null}>
          <CompareForm watches={watches} />
        </Suspense>
      </article>
    </>
  );
}
