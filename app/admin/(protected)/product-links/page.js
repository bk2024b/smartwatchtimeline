'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function AdminProductLinksPage() {
  const supabase = getSupabaseBrowser(); const [links, setLinks] = useState([]); const [watches, setWatches] = useState([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true);
  async function load() { setLoading(true); const [{ data: l }, { data: w }] = await Promise.all([supabase.from('product_links').select('*').order('priority', { ascending: false }).order('vendor'), supabase.from('smartwatches').select('id,name')]); setLinks(l || []); setWatches(w || []); setLoading(false); }
  useEffect(() => { load(); }, []);
  const names = Object.fromEntries(watches.map((w) => [w.id, w.name]));
  const filtered = useMemo(() => { const q = search.toLowerCase().trim(); return links.filter((l) => !q || `${names[l.smartwatch_id] || ''} ${l.vendor} ${l.vendor_label}`.toLowerCase().includes(q)); }, [links, search, names]);
  return <main className="pt-8"><div className="flex flex-wrap items-end gap-4 mb-8"><div className="mr-auto"><div className="font-mono text-xs text-accent uppercase mb-2">Commerce</div><h1 className="font-display font-bold text-4xl">Product links</h1><p className="text-dim mt-2">Manage vendors, prices and affiliate destinations.</p></div><Link href="/admin/product-links/new" className="btn-primary">+ Add link</Link></div><input className="field-input w-full mb-5" placeholder="Search model or vendor…" value={search} onChange={(e) => setSearch(e.target.value)} />
  {loading ? <div className="text-dim">Loading links…</div> : <div className="space-y-2">{filtered.map((link) => <Link key={link.id} href={`/admin/product-links/${link.id}`} className="flex flex-wrap items-center gap-4 bg-panel border border-line p-4 hover:border-accent transition-colors"><div className="mr-auto"><div className="font-display font-semibold">{names[link.smartwatch_id] || link.smartwatch_id}</div><div className="text-xs text-dim mt-1">{link.vendor_label} · {link.vendor}</div></div><div className="text-right"><div className="font-mono text-sm">{link.price != null ? `${link.currency} ${link.price}` : 'No price'}</div><div className="text-[10px] text-dim uppercase">Priority {link.priority}</div></div></Link>)}</div>}
  </main>;
}
