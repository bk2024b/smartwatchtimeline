'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { buildComparisonSlug } from '@/lib/compareSlug';

function similarity(a, b) {
  if (!a || !b) return 0;
  let score = 0;
  const ap = Number(a.price); const bp = Number(b.price);
  if (Number.isFinite(ap) && Number.isFinite(bp)) score += Math.max(0, 35 - (Math.abs(ap - bp) / Math.max(ap, 1)) * 100);
  if (a.brand_id === b.brand_id) score += 15;
  if (a.gamme && b.gamme && a.gamme === b.gamme) score += 18;
  for (const key of ['gps', 'cellular', 'ecg', 'blood_oxygen', 'nfc_payments', 'always_on_display', 'rugged', 'round_face']) if (Boolean(a[key]) === Boolean(b[key])) score += 2;
  if (a.ecosystem && b.ecosystem && a.ecosystem === b.ecosystem) score += 5;
  if (a.os && b.os && a.os === b.os) score += 3;
  return score;
}

function ModelCard({ watch, selected, onClick, side }) {
  return (
    <button type="button" onClick={onClick} className={`text-left w-full p-5 rounded-2xl border transition-all ${selected ? 'border-accent bg-accent/5 shadow-[0_0_35px_rgba(34,208,122,0.08)]' : 'border-line bg-panel hover:border-accent/50'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[9px] text-accent uppercase tracking-[0.14em]">{side}</div>
          <div className="font-mono text-[10px] text-dim uppercase mt-2">{watch.brand_id}{watch.gamme ? ` · ${watch.gamme}` : ''}</div>
          <div className="font-display font-semibold text-lg mt-1">{watch.name}</div>
        </div>
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selected ? 'border-accent bg-accent text-black' : 'border-line'}`}>{selected ? '✓' : ''}</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-5 font-mono text-[9px] text-dim">
        <span>{watch.price != null ? `$${Number(watch.price).toFixed(0)}` : '—'}</span>
        <span>{watch.battery_life_h ? `${watch.battery_life_h}h` : '—'}</span>
        <span>{watch.weight_g ? `${watch.weight_g}g` : '—'}</span>
      </div>
    </button>
  );
}

export default function CompareForm({ watches }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get('with') || '';
  const [a, setA] = useState(preselected);
  const [b, setB] = useState('');
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');

  useEffect(() => { if (preselected) setA(preselected); }, [preselected]);

  const selectedA = watches.find((w) => w.id === a);
  const selectedB = watches.find((w) => w.id === b);

  const optionsA = useMemo(() => filterModels(watches, queryA, b), [watches, queryA, b]);
  const optionsB = useMemo(() => filterModels(watches, queryB, a), [watches, queryB, a]);
  const suggestions = useMemo(() => {
    if (!selectedA) return [];
    return watches.filter((w) => w.id !== selectedA.id).map((w) => ({ w, score: similarity(selectedA, w) })).sort((x, y) => y.score - x.score).slice(0, 5);
  }, [watches, selectedA]);

  function compare() {
    if (a && b && a !== b) router.push(`/comparisons/${buildComparisonSlug(a, b)}`);
  }

  return (
    <div className="space-y-6">
      <section className="grid lg:grid-cols-2 gap-4">
        <div className="bg-panel border border-line rounded-2xl p-5">
          <div className="font-mono text-[9px] text-accent uppercase tracking-[0.14em] mb-3">Model 01</div>
          <input value={queryA} onChange={(e) => setQueryA(e.target.value)} placeholder="Search a smartwatch…" className="w-full bg-page border border-line rounded-lg px-3 py-3 text-sm outline-none focus:border-accent" />
          <div className="mt-3 max-h-56 overflow-y-auto space-y-2">
            {optionsA.slice(0, 12).map((w) => <ModelCard key={w.id} watch={w} selected={a === w.id} side="First model" onClick={() => setA(w.id)} />)}
          </div>
        </div>
        <div className="bg-panel border border-line rounded-2xl p-5">
          <div className="font-mono text-[9px] text-accent uppercase tracking-[0.14em] mb-3">Model 02</div>
          <input value={queryB} onChange={(e) => setQueryB(e.target.value)} placeholder="Search a smartwatch…" className="w-full bg-page border border-line rounded-lg px-3 py-3 text-sm outline-none focus:border-accent" />
          <div className="mt-3 max-h-56 overflow-y-auto space-y-2">
            {optionsB.slice(0, 12).map((w) => <ModelCard key={w.id} watch={w} selected={b === w.id} side="Second model" onClick={() => setB(w.id)} />)}
          </div>
        </div>
      </section>

      {selectedA && !selectedB && suggestions.length > 0 && (
        <section className="border border-line rounded-2xl bg-panel p-5">
          <div className="font-mono text-[9px] text-accent uppercase tracking-[0.14em] mb-2">Recommended matchups</div>
          <h2 className="font-display font-bold text-xl mb-4">What should you compare it with?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {suggestions.map(({ w }) => <button type="button" key={w.id} onClick={() => setB(w.id)} className="text-left p-3 rounded-xl border border-line hover:border-accent bg-page transition-colors"><div className="font-mono text-[9px] text-dim uppercase">{w.brand_id}</div><div className="font-display text-sm font-semibold mt-1">{w.name}</div><div className="font-mono text-[9px] text-dim mt-2">{w.price != null ? `$${Number(w.price).toFixed(0)}` : 'Price —'}</div></button>)}
          </div>
        </section>
      )}

      <div className="sticky bottom-4 z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-line bg-panel/95 backdrop-blur">
        <div className="font-mono text-[10px] text-dim uppercase tracking-wider">{selectedA ? selectedA.name : 'Select model 01'} <span className="text-accent mx-2">vs</span> {selectedB ? selectedB.name : 'Select model 02'}</div>
        <button type="button" onClick={compare} disabled={!a || !b || a === b} className="btn-primary disabled:opacity-30">Compare models →</button>
      </div>
    </div>
  );
}

function filterModels(models, query, excludedId) {
  const q = query.trim().toLowerCase();
  return [...models].filter((w) => w.id !== excludedId && (!q || `${w.name} ${w.brand_id} ${w.gamme || ''}`.toLowerCase().includes(q))).sort((a, b) => a.name.localeCompare(b.name));
}
