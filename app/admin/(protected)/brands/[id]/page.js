'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function EditBrandPage() {
  const { id } = useParams(); const router = useRouter(); const supabase = getSupabaseBrowser();
  const [form, setForm] = useState(null); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  useEffect(() => { (async () => { const { data, error: e } = await supabase.from('brands').select('id,name,color').eq('id', id).maybeSingle(); if (e) setError(e.message); else setForm(data); })(); }, [id]);
  async function save(e) { e.preventDefault(); setSaving(true); setError(''); const { error: e2 } = await supabase.from('brands').update({ name: form.name.trim(), color: form.color.trim() }).eq('id', id); if (e2) setError(e2.message); else router.push('/admin/brands'); setSaving(false); }
  async function remove() { if (!confirm(`Delete ${form.name}?`)) return; const { error: e } = await supabase.from('brands').delete().eq('id', id); if (e) setError(e.message); else router.push('/admin/brands'); }
  if (!form) return <main className="pt-8 text-dim">{error || 'Loading brand…'}</main>;
  return <main className="pt-8 max-w-2xl"><div className="font-mono text-xs text-accent uppercase mb-2">Catalog / Brands / {id}</div><h1 className="font-display font-bold text-4xl mb-8">Edit brand</h1><form onSubmit={save} className="bg-panel border border-line p-6 space-y-5">
    <div><span className="field-label">ID</span><div className="font-mono text-sm text-dim">{form.id}</div></div>
    <label className="block"><span className="field-label">Name</span><input className="field-input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
    <label className="block"><span className="field-label">Brand color</span><input className="field-input w-full" value={form.color || ''} onChange={(e) => setForm({ ...form, color: e.target.value })} /></label>
    {error && <div className="text-sm text-red-400">{error}</div>}<div className="flex gap-3"><button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button><button type="button" className="btn-ghost" onClick={remove}>Delete</button></div>
  </form></main>;
}
