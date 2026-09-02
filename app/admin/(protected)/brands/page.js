'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function AdminBrandsPage() {
  const supabase = getSupabaseBrowser();
  const [brands, setBrands] = useState([]);
  const [watches, setWatches] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [{ data: brandRows }, { data: watchRows }] = await Promise.all([
      supabase.from('brands').select('*').order('name'),
      supabase.from('smartwatches').select('id,brand_id'),
    ]);
    setBrands(brandRows || []);
    setWatches(watchRows || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return brands.filter((brand) => !q || `${brand.name} ${brand.id}`.toLowerCase().includes(q));
  }, [brands, search]);

  return (
    <main className="pt-8">
      <div className="flex flex-wrap items-end gap-4 mb-8">
        <div className="mr-auto"><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-2">Catalog</div><h1 className="font-display font-bold text-4xl">Brands</h1><p className="text-dim mt-2">Manage manufacturers and their catalog presence.</p></div>
        <Link href="/admin/brands/new" className="btn-primary">+ Add brand</Link>
      </div>
      <input className="field-input w-full mb-5" placeholder="Search brands…" value={search} onChange={(e) => setSearch(e.target.value)} />
      {loading ? <div className="text-dim">Loading brands…</div> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((brand) => <Link key={brand.id} href={`/admin/brands/${brand.id}`} className="bg-panel border border-line p-5 hover:border-accent transition-colors">
          <div className="font-display font-semibold text-lg">{brand.name}</div>
          <div className="font-mono text-[10px] text-dim mt-1">{brand.id}</div>
          <div className="text-sm text-dim mt-4">{watches.filter((w) => w.brand_id === brand.id).length} models</div>
        </Link>)}
      </div>}
    </main>
  );
}
