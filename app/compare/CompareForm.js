'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { buildComparisonSlug } from '@/lib/compareSlug';

// V1 of the "find my smartwatch" tool: a straightforward two-model picker
// that redirects to the comparison page. EarbudsTimeline's equivalent
// (TimelineIntelligenceFinder, ~480 lines) is a full quiz-style
// recommendation engine — a genuinely good v2 target once there's a real
// catalog to tune it against, not something to fake-replicate against
// placeholder data in this scaffold.
export default function CompareForm({ watches }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get('with') || '';
  const [a, setA] = useState(preselected);
  const [b, setB] = useState('');

  useEffect(() => {
    if (preselected) setA(preselected);
  }, [preselected]);

  const sorted = [...watches].sort((x, y) => x.name.localeCompare(y.name));

  function handleCompare() {
    if (!a || !b || a === b) return;
    router.push(`/comparisons/${buildComparisonSlug(a, b)}`);
  }

  return (
    <div className="bg-panel border border-line rounded-2xl p-6 max-w-xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <select value={a} onChange={(e) => setA(e.target.value)} className="bg-page border border-line rounded-lg px-3 py-2.5 text-sm">
          <option value="">Select a model…</option>
          {sorted.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select value={b} onChange={(e) => setB(e.target.value)} className="bg-page border border-line rounded-lg px-3 py-2.5 text-sm">
          <option value="">Select a model…</option>
          {sorted.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>
      <button
        onClick={handleCompare}
        disabled={!a || !b || a === b}
        className="mt-4 w-full bg-accent text-ink font-mono text-xs uppercase font-semibold rounded-lg px-4 py-3 disabled:opacity-40"
      >
        Compare
      </button>
    </div>
  );
}
