'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

const emptyArticle = { id: '', slug: '', title: '', excerpt: '', category: 'Editorial', content_html: '', cover_image_url: '', table_of_contents: [], word_count: 0, reading_minutes: 1, status: 'draft', published_at: '' };

export default function AdminArticleEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowser(), []);
  const [article, setArticle] = useState(emptyArticle);
  const [loading, setLoading] = useState(id !== 'new');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id === 'new') return;
    supabase.from('articles').select('*').eq('id', id).maybeSingle().then(({ data, error: queryError }) => {
      if (queryError) setError(queryError.message);
      else if (data) setArticle({ ...emptyArticle, ...data, table_of_contents: data.table_of_contents || [] });
      else setError('Article not found.');
      setLoading(false);
    });
  }, [id, supabase]);

  function setField(field, value) { setArticle((current) => ({ ...current, [field]: value })); }

  async function save(event) {
    event.preventDefault();
    setSaving(true); setError('');
    const payload = {
      slug: article.slug.trim(), title: article.title.trim(), excerpt: article.excerpt.trim(), category: article.category.trim() || 'Editorial',
      content_html: article.content_html, cover_image_url: article.cover_image_url.trim() || null,
      table_of_contents: article.table_of_contents, word_count: Number(article.word_count) || 0,
      reading_minutes: Number(article.reading_minutes) || 1, status: article.status,
      published_at: article.status === 'published' ? (article.published_at || new Date().toISOString()) : (article.published_at || null),
    };
    if (!payload.slug || !payload.title) { setError('Slug and title are required.'); setSaving(false); return; }
    const query = id === 'new'
      ? supabase.from('articles').insert({ id: crypto.randomUUID(), ...payload })
      : supabase.from('articles').update(payload).eq('id', id);
    const { data, error: saveError } = await query.select('id').maybeSingle();
    if (saveError) setError(saveError.message);
    else router.push(`/admin/articles/${data?.id || id}`);
    setSaving(false);
  }

  async function remove() {
    if (id === 'new' || !window.confirm(`Delete “${article.title}”?`)) return;
    const { error: deleteError } = await supabase.from('articles').delete().eq('id', id);
    if (deleteError) setError(deleteError.message); else router.push('/admin/articles');
  }

  if (loading) return <main className="pt-8 text-dim">Loading article…</main>;

  return (
    <main className="pt-8 max-w-5xl">
      <div className="flex items-end gap-4 mb-8"><div className="mr-auto"><Link href="/admin/articles" className="font-mono text-xs text-accent uppercase">← Articles</Link><h1 className="font-display font-bold text-[36px] mt-3">{id === 'new' ? 'New article' : 'Edit article'}</h1></div>{id !== 'new' && <button onClick={remove} className="btn-ghost text-red-300">Delete</button>}</div>
      {error && <div className="bg-panel border border-red-500/40 text-red-300 p-4 mb-5 text-sm">{error}</div>}
      <form onSubmit={save} className="space-y-6">
        <section className="bg-panel border border-line p-5 grid sm:grid-cols-2 gap-4">
          {['slug','title','category','cover_image_url'].map((field) => <label key={field} className="block"><span className="field-label">{field.replaceAll('_',' ')}</span><input className="field-input" value={article[field] || ''} onChange={(e) => setField(field, e.target.value)} /></label>)}
          <label className="block sm:col-span-2"><span className="field-label">Excerpt</span><textarea className="field-input min-h-24" value={article.excerpt || ''} onChange={(e) => setField('excerpt', e.target.value)} /></label>
          <label className="block sm:col-span-2"><span className="field-label">Content HTML</span><textarea className="field-input min-h-[360px] font-mono text-xs" value={article.content_html || ''} onChange={(e) => setField('content_html', e.target.value)} /></label>
        </section>
        <section className="bg-panel border border-line p-5 grid sm:grid-cols-3 gap-4">
          <label><span className="field-label">Status</span><select className="field-input" value={article.status} onChange={(e) => setField('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></label>
          <label><span className="field-label">Reading minutes</span><input type="number" min="1" className="field-input" value={article.reading_minutes || 1} onChange={(e) => setField('reading_minutes', e.target.value)} /></label>
          <label><span className="field-label">Word count</span><input type="number" min="0" className="field-input" value={article.word_count || 0} onChange={(e) => setField('word_count', e.target.value)} /></label>
          <label className="sm:col-span-3"><span className="field-label">Table of contents JSON</span><textarea className="field-input min-h-28 font-mono text-xs" value={JSON.stringify(article.table_of_contents || [], null, 2)} onChange={(e) => { try { setField('table_of_contents', JSON.parse(e.target.value)); setError(''); } catch { setError('Table of contents must be valid JSON.'); } }} /></label>
        </section>
        <div className="flex justify-end gap-3"><Link href="/admin/articles" className="btn-ghost">Cancel</Link><button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save article'}</button></div>
      </form>
    </main>
  );
}
