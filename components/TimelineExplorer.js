'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function TimelineExplorer({ watches, brands }) {
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('all');
  const [year, setYear] = useState('all');

  const brandMap = useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands]);
  const years = useMemo(() => [...new Set(watches.map((w) => (w.release_date || '').slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a)), [watches]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return watches.filter((w) => {
      const matchesBrand = brand === 'all' || w.brand_id === brand;
      const matchesYear = year === 'all' || (w.release_date || '').startsWith(year);
      const text = `${w.name} ${w.brand_id} ${w.gamme || ''}`.toLowerCase();
      return matchesBrand && matchesYear && (!q || text.includes(q));
    }).sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
  }, [watches, brand, year, query]);

  const byYear = useMemo(() => {
    const map = new Map();
    filtered.forEach((w) => {
      const y = (w.release_date || '').slice(0, 4) || 'Unknown';
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(w);
    });
    return map;
  }, [filtered]);

  return (
    <div>
      <div className="sticky top-3 z-20 p-3 rounded-2xl border border-line bg-panel/95 backdrop-blur mb-10 shadow-lg">
        <div className="grid md:grid-cols-[1fr_180px_140px] gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search models, brands, or series…" className="bg-page border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-accent" />
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className="bg-page border border-line rounded-xl px-3 py-3 text-sm outline-none focus:border-accent">
            <option value="all">All brands</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-page border border-line rounded-xl px-3 py-3 text-sm outline-none focus:border-accent">
            <option value="all">All years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between mt-3 px-1 font-mono text-[9px] uppercase tracking-wider text-dim">
          <span>{filtered.length} models shown</span>
          {(query || brand !== 'all' || year !== 'all') && <button type="button" onClick={() => { setQuery(''); setBrand('all'); setYear('all'); }} className="text-accent">Reset filters</button>}
        </div>
      </div>

      <div className="space-y-12">
        {[...byYear.entries()].map(([y, models]) => (
          <section key={y} className="relative pl-7 sm:pl-10">
            <div className="absolute left-1 sm:left-2 top-2 bottom-0 w-px bg-timeline-line" />
            <div className="absolute left-0 sm:left-1.5 top-2 w-3 h-3 rounded-full bg-accent shadow-[0_0_16px_rgba(34,208,122,0.45)]" />
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <h2 className="font-display font-bold text-[28px]">{y}</h2>
              <span className="font-mono text-[9px] text-dim uppercase">{models.length} release{models.length === 1 ? '' : 's'}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {models.map((w) => (
                <Link key={w.id} href={`/smartwatches/${w.id}`} className="group bg-panel border border-line rounded-xl p-4 hover:border-accent hover:-translate-y-0.5 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[9px] text-accent uppercase tracking-wider">{brandMap.get(w.brand_id)?.name || w.brand_id}{w.gamme ? ` · ${w.gamme}` : ''}</div>
                      <div className="font-display font-semibold text-[16px] mt-1">{w.name}</div>
                    </div>
                    <span className="font-mono text-[9px] text-dim shrink-0">{w.release_date || '—'}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 font-mono text-[9px] text-dim">
                    {w.price != null && <span>${Number(w.price).toFixed(0)}</span>}
                    {w.battery_life_h && <span>{w.battery_life_h}h battery</span>}
                    {w.weight_g && <span>{w.weight_g}g</span>}
                    {w.gps && <span>GPS</span>}
                    {w.cellular && <span>Cellular</span>}
                    {w.ecg && <span>ECG</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && <div className="text-center py-16 border border-dashed border-line rounded-2xl text-dim">No models match these filters.</div>}
      </div>
    </div>
  );
}
