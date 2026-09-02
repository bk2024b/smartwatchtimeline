'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function NewBrandPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const [form, setForm] = useState({ id: '', name: '', color: '#22D07A' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(e) {
    e.preventDefault(); setSaving(true); setError('');
    const payload = { id: form.id.trim().toLowerCase(), name: form.name.trim(), color: form.color.trim() || '#22D07A' };
    if (!payload.id || !payload.name) { setError('ID and name are required.'); setSaving(false); return; }
    const { error: dbError } = await supabase.from('brands').insert(payload);
    if (dbError) { setError(dbError.message); setSaving(false); return; }
    router.push(`/admin/brands/${payload.id}`);
  }

  return <main className="pt-8 max-w-2xl"><div className="font-mono text-xs text-accent uppercase mb-2">Catalog / Brands</div><h1 className="font-display font-bold text-4xl mb-8">Add brand</h1><form onSubmit={save} className="bg-panel border border-line p-6 space-y-5">
    <label className="block"><span className="field-label">ID / slug</span><input className="field-input w-full" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="apple" /></label>
    <label className="block"><span className="field-label">Name</span><input className="field-input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Apple" /></label>
    <label className="block"><span className="field-label">Brand color</span><input className="field-input w-full" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></label>
    {error && <div className="text-sm text-red-400">{error}</div>}<button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Create brand'}</button>
  </form></main>;
}
