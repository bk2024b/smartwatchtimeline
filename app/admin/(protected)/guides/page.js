'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function AdminGuidesPage() {
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const [guides, setGuides] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    const { data, error: queryError } = await supabase.from('guides').select('slug, title, category, status, priority, updated_at').order('priority', { ascending: true });
    if (queryError) setError(queryError.message); else setGuides(data || []);
  }
  useEffect(() => { load(); }, []);

  async function toggleStatus(guide) {
    const next = guide.status === 'published' ? 'draft' : 'published';
    const { error: updateError } = await supabase.from('guides').update({ status: next, published_at: next === 'published' ? new Date().toISOString() : null }).eq('slug', guide.slug);
    if (updateError) setError(updateError.message); else load();
  }
  async function remove(guide) {
    if (!window.confirm(`Delete “${guide.title || guide.slug}”?`)) return;
    const { error: deleteError } = await supabase.from('guides').delete().eq('slug', guide.slug);
    if (deleteError) setError(deleteError.message); else load();
  }

  return <main className="pt-8">
    <div className="flex flex-wrap items-end gap-4 mb-8"><div className="mr-auto"><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Editorial</div><h1 className="font-display font-bold text-[36px]">Guides</h1><p className="text-dim mt-2">Manage buying guides and recommendation rules.</p></div><Link href="/admin/guides/new" className="btn-primary">+ New guide</Link></div>
    {error && <div className="bg-panel border border-red-500/40 text-red-300 p-4 mb-5 text-sm">{error}</div>}
    <div className="bg-panel border border-line overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-line text-dim text-[10px] uppercase font-mono"><th className="text-left p-4">Guide</th><th className="text-left p-4">Category</th><th className="text-left p-4">Status</th><th className="text-right p-4">Actions</th></tr></thead><tbody>{guides.map((guide) => <tr key={guide.slug} className="border-b border-line last:border-0"><td className="p-4"><Link href={`/admin/guides/${guide.slug}`} className="font-medium hover:text-accent">{guide.title || guide.slug}</Link><div className="text-xs text-dim mt-1">/{guide.slug}</div></td><td className="p-4 text-dim">{guide.category}</td><td className="p-4"><span className="badge">{guide.status}</span></td><td className="p-4"><div className="flex justify-end gap-2"><Link className="btn-ghost" href={`/admin/guides/${guide.slug}`}>Edit</Link><button className="btn-ghost" onClick={() => toggleStatus(guide)}>{guide.status === 'published' ? 'Draft' : 'Publish'}</button><button className="btn-ghost text-red-300" onClick={() => remove(guide)}>Delete</button></div></td></tr>)}</tbody></table></div>
  </main>;
}
