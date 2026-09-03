'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function TimelineExplorer({ watches, brands }) {
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('all');
  const [year, setYear] = useState('all');
  const [status, setStatus] = useState('all');
  const [decade, setDecade] = useState('all');

  const brandMap = useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands]);
  const years = useMemo(() => [...new Set(watches.map((w) => (w.release_date || '').slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a)), [watches]);
  const decades = useMemo(() => [...new Set(years.map((y) => `${Math.floor(Number(y) / 10) * 10}s`))].sort((a, b) => Number(b.slice(0, 4)) - Number(a.slice(0, 4))), [years]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return watches.filter((w) => {
      const releaseYear = (w.release_date || '').slice(0, 4);
      const matchesBrand = brand === 'all' || w.brand_id === brand;
      const matchesYear = year === 'all' || releaseYear === year;
      const matchesStatus = status === 'all' || (w.status || 'released') === status;
      const matchesDecade = decade === 'all' || `${Math.floor(Number(releaseYear) / 10) * 10}s` === decade;
      const text = `${w.name} ${w.brand_id} ${w.gamme || ''} ${w.family || ''} ${w.generation || ''}`.toLowerCase();
      return matchesBrand && matchesYear && matchesStatus && matchesDecade && (!q || text.includes(q));
    }).sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
  }, [watches, brand, year, status, decade, query]);

  const byYear = useMemo(() => {
    const map = new Map();
    filtered.forEach((w) => {
      const y = (w.release_date || '').slice(0, 4) || 'Unknown';
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(w);
    });
    return map;
  }, [filtered]);

  function reset() {
    setQuery(''); setBrand('all'); setYear('all'); setStatus('all'); setDecade('all');
  }

  return (
    <div>
      <div className="sticky top-3 z-20 p-3 rounded-2xl border border-line bg-panel/95 backdrop-blur mb-8 shadow-lg">
        <div className="grid md:grid-cols-[1fr_160px_120px_140px] gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search models, brands, series…" className="bg-page border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-accent" />
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className="bg-page border border-line rounded-xl px-3 py-3 text-sm outline-none focus:border-accent">
            <option value="all">All brands</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select value={year} onChange={(e) => { setYear(e.target.value); if (e.target.value !== 'all') setDecade('all'); }} className="bg-page border border-line rounded-xl px-3 py-3 text-sm outline-none focus:border-accent">
            <option value="all">All years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-page border border-line rounded-xl px-3 py-3 text-sm outline-none focus:border-accent">
            <option value="all">All statuses</option><option value="released">Released</option><option value="announced">Announced</option><option value="discontinued">Discontinued</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
          <span className="font-mono text-[9px] uppercase tracking-wider text-dim mr-1">Jump:</span>
          <button type="button" onClick={() => setDecade('all')} className={`px-2 py-1 rounded-md border font-mono text-[9px] ${decade === 'all' ? 'border-accent text-accent' : 'border-line text-dim'}`}>All</button>
          {decades.map((d) => <button key={d} type="button" onClick={() => { setDecade(d); setYear('all'); }} className={`px-2 py-1 rounded-md border font-mono text-[9px] ${decade === d ? 'border-accent text-accent' : 'border-line text-dim'}`}>{d}</button>)}
          <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-dim">{filtered.length} models</span>
          {(query || brand !== 'all' || year !== 'all' || status !== 'all' || decade !== 'all') && <button type="button" onClick={reset} className="font-mono text-[9px] uppercase text-accent">Reset</button>}
        </div>
      </div>

      <div className="space-y-12">
        {[...byYear.entries()].map(([y, models]) => (
          <section key={y} id={`year-${y}`} className="relative pl-7 sm:pl-10 scroll-mt-28">
            <div className="absolute left-1 sm:left-2 top-2 bottom-0 w-px bg-timeline-line" />
            <div className="absolute left-0 sm:left-1.5 top-2 w-3 h-3 rounded-full bg-accent shadow-[0_0_16px_rgba(34,208,122,0.45)]" />
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <div><h2 className="font-display font-bold text-[28px]">{y}</h2><div className="font-mono text-[9px] text-dim uppercase mt-1">{models[0]?.generation ? `${models[0].generation}${models[0].family ? ` · ${models[0].family}` : ''}` : 'Release history'}</div></div>
              <span className="font-mono text-[9px] text-dim uppercase">{models.length} release{models.length === 1 ? '' : 's'}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {models.map((w) => (
                <Link key={w.id} href={`/smartwatches/${w.id}`} className="group bg-panel border border-line rounded-xl p-4 hover:border-accent hover:-translate-y-0.5 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-[9px] text-accent uppercase tracking-wider truncate">{brandMap.get(w.brand_id)?.name || w.brand_id}{w.gamme ? ` · ${w.gamme}` : ''}</div>
                      <div className="font-display font-semibold text-[16px] mt-1">{w.name}</div>
                    </div>
                    <span className="font-mono text-[9px] text-dim shrink-0">{w.release_date || '—'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 font-mono text-[9px] text-dim">
                    {w.status && w.status !== 'released' && <span className="border border-amber-400/30 text-amber-300 px-1.5 py-0.5 rounded">{w.status}</span>}
                    {w.price != null && <span>${Number(w.price).toFixed(0)}</span>}
                    {w.battery_life_h && <span>{w.battery_life_h}h battery</span>}
                    {w.weight_g && <span>{w.weight_g}g</span>}
                    {w.gps && <span>GPS</span>}
                    {w.cellular && <span>Cellular</span>}
                    {w.ecg && <span>ECG</span>}
                    {w.blood_oxygen && <span>SpO₂</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && <div className="text-center py-16 border border-dashed border-line rounded-2xl text-dim">No models match these filters. Try another year, brand, status, or search term.</div>}
      </div>
    </div>
  );
}
