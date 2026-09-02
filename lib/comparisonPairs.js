import { buildComparisonSlug } from './compareSlug';

// This is the fix for a real cost bug found while auditing EarbudsTimeline:
// its comparaisons/[slug] route had no generateStaticParams and accepted ANY
// two model ids as a "valid" pair, rendered fresh on first request. With
// ~2,000 internally-linked pairs reachable via "suggested comparisons" on
// every model page, crawlers alone (not real visitors) generated hundreds
// of thousands of cold server renders.
//
// Here, the set of valid comparison pairs is computed ONCE from the real
// catalog (adjacent generations within the same brand+lineup, since "which
// generation should I upgrade to" is the single highest-intent comparison
// query) plus any manually curated cross-brand rivalries below. Combined
// with `export const dynamicParams = false` in the page itself, any pair
// NOT in this list 404s instead of triggering a fresh render — the
// combinatorial space is bounded by construction, not by hoping bots don't
// find the unbounded version.

// Add real head-to-head rivalries here as they become editorially worth a
// dedicated page (e.g. the current flagship from each major brand). Kept
// separate from the auto-generated same-lineup pairs since a cross-brand
// comparison needs to be a deliberate editorial choice, not automatic.
export const RIVALRY_PAIRS = [
  // ['apple-watch-series-10', 'galaxy-watch-7'],
];

export function computeComparisonPairs(watches) {
  const pairs = new Set();

  const byLineup = new Map();
  for (const w of watches) {
    const key = `${w.brand_id}::${w.gamme}`;
    if (!byLineup.has(key)) byLineup.set(key, []);
    byLineup.get(key).push(w);
  }
  for (const lineup of byLineup.values()) {
    const sorted = [...lineup].sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));
    for (let i = 0; i < sorted.length - 1; i += 1) {
      pairs.add(buildComparisonSlug(sorted[i].id, sorted[i + 1].id));
    }
  }

  for (const [a, b] of RIVALRY_PAIRS) {
    pairs.add(buildComparisonSlug(a, b));
  }

  return [...pairs];
}
