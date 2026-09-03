'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function AdminSmartwatchesPage() {
  const [watches, setWatches] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  async function load() {
    const supabase = getSupabaseBrowser();
    const [{ data: watchData, error: watchError }, { data: brandData, error: brandError }] = await Promise.all([
      supabase.from('smartwatches').select('id,name,brand_id,gamme,release_date,price,quality_score,qa_status').order('release_date', { ascending: false }),
      supabase.from('brands').select('id,name').order('name'),
    ]);
    if (watchError || brandError) return;
    setWatches(watchData || []);
    setBrands(brandData || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  const brandMap = new Map(brands.map((b) => [b.id, b.name]));
  const filtered = watches.filter((w) => `${w.name} ${w.gamme} ${brandMap.get(w.brand_id) || ''}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="pt-8">
      <div className="flex flex-wrap items-end gap-4 mb-7"><div className="mr-auto"><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-2">Catalog</div><h1 className="font-display font-bold text-3xl sm:text-4xl">Smartwatches</h1></div><Link href="/admin/smartwatches/new" className="btn-primary">+ Add model</Link></div>
      <div className="flex gap-3 mb-5"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search models…" className="flex-1 bg-panel border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent" /><span className="text-dim text-xs font-mono self-center">{filtered.length} models</span></div>
      <div className="overflow-x-auto border border-line bg-panel">
        <table className="w-full text-sm"><thead><tr className="border-b border-line text-left text-dim font-mono text-[10px] uppercase"><th className="p-3">Model</th><th className="p-3">Brand</th><th className="p-3">Release</th><th className="p-3">Price</th><th className="p-3">QA</th><th className="p-3">Score</th><th className="p-3"></th></tr></thead><tbody>
          {loading ? <tr><td colSpan="7" className="p-8 text-center text-dim">Loading…</td></tr> : filtered.map((w) => <tr key={w.id} className="border-b border-line last:border-0"><td className="p-3 font-medium">{w.name}<div className="text-dim text-xs">{w.gamme}</div></td><td className="p-3 text-dim">{brandMap.get(w.brand_id) || w.brand_id}</td><td className="p-3 text-dim">{w.release_date || '—'}</td><td className="p-3">{w.price == null ? '—' : `$${w.price}`}</td><td className="p-3"><span className="font-mono text-[10px] text-accent">{w.qa_status || '—'}</span></td><td className="p-3">{w.quality_score ?? 0}/100</td><td className="p-3 text-right"><Link href={`/admin/smartwatches/${w.id}`} className="text-accent text-xs font-mono">Edit →</Link></td></tr>)}
        </tbody></table>
      </div>
    </main>
  );
}
