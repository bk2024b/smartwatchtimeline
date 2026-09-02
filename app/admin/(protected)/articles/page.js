'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function AdminArticlesPage() {
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    const { data, error: queryError } = await supabase
      .from('articles')
      .select('id, slug, title, category, status, published_at, updated_at')
      .order('updated_at', { ascending: false });
    if (queryError) setError(queryError.message);
    else setArticles(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleStatus(article) {
    const next = article.status === 'published' ? 'draft' : 'published';
    const { error: updateError } = await supabase.from('articles').update({
      status: next,
      published_at: next === 'published' ? (article.published_at || new Date().toISOString()) : article.published_at,
    }).eq('id', article.id);
    if (updateError) setError(updateError.message);
    else load();
  }

  async function remove(article) {
    if (!window.confirm(`Delete “${article.title}”?`)) return;
    const { error: deleteError } = await supabase.from('articles').delete().eq('id', article.id);
    if (deleteError) setError(deleteError.message);
    else load();
  }

  return (
    <main className="pt-8">
      <div className="flex flex-wrap items-end gap-4 mb-8">
        <div className="mr-auto"><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Editorial</div><h1 className="font-display font-bold text-[36px]">Articles</h1><p className="text-dim mt-2">Create, edit and publish SmartwatchTimeline editorial content.</p></div>
        <Link href="/admin/articles/new" className="btn-primary">+ New article</Link>
      </div>
      {error && <div className="bg-panel border border-red-500/40 text-red-300 p-4 mb-5 text-sm">{error}</div>}
      <div className="bg-panel border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-line text-dim text-[10px] uppercase font-mono"><th className="text-left p-4">Article</th><th className="text-left p-4">Category</th><th className="text-left p-4">Status</th><th className="text-right p-4">Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="4" className="p-6 text-dim">Loading…</td></tr> : articles.map((article) => (
              <tr key={article.id} className="border-b border-line last:border-0">
                <td className="p-4"><Link href={`/admin/articles/${article.id}`} className="font-medium hover:text-accent">{article.title || article.slug}</Link><div className="text-xs text-dim mt-1">/{article.slug}</div></td>
                <td className="p-4 text-dim">{article.category}</td>
                <td className="p-4"><span className="badge">{article.status}</span></td>
                <td className="p-4"><div className="flex justify-end gap-2"><Link className="btn-ghost" href={`/admin/articles/${article.id}`}>Edit</Link><button className="btn-ghost" onClick={() => toggleStatus(article)}>{article.status === 'published' ? 'Draft' : 'Publish'}</button><button className="btn-ghost text-red-300" onClick={() => remove(article)}>Delete</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
