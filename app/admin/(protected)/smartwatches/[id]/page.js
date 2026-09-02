'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

const fields = [
  ['name','Name','text'], ['gamme','Series / gamme','text'], ['tagline','Tagline','text'], ['release_date','Release date','date'], ['price','Launch price','number'],
  ['battery_life_h','Battery life (h)','number'], ['battery_life_h_saver','Battery saver (h)','number'], ['charging_time_h','Charging time (h)','number'], ['weight_g','Weight (g)','number'], ['case_size_mm','Case size (mm)','number'], ['water_rating','Water rating','text'], ['display_type','Display type','text'], ['ecosystem','Ecosystem','text'], ['os','OS','text'],
];

const toggles = ['cellular','gps','nfc_payments','ecg','blood_oxygen','heart_rate','sleep_tracking','always_on_display','rugged','round_face','marquant'];

export default function AdminSmartwatchEditor() {
  const { id } = useParams();
  const router = useRouter();
  const [watch, setWatch] = useState(null);
  const [brands, setBrands] = useState([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowser();
      const [{ data }, { data: brandData }] = await Promise.all([
        supabase.from('smartwatches').select('*').eq('id', id).maybeSingle(),
        supabase.from('brands').select('id,name').order('name'),
      ]);
      setWatch(data);
      setBrands(brandData || []);
    }
    if (id) load();
  }, [id]);

  function set(field, value) { setWatch((current) => ({ ...current, [field]: value })); }
  async function save(event) {
    event.preventDefault(); setSaving(true); setMessage('');
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.from('smartwatches').update({ ...watch, updated_at: new Date().toISOString() }).eq('id', id);
    setSaving(false); setMessage(error ? error.message : 'Saved.');
  }
  async function remove() {
    if (!window.confirm('Delete this smartwatch?')) return;
    const { error } = await getSupabaseBrowser().from('smartwatches').delete().eq('id', id);
    if (error) setMessage(error.message); else router.replace('/admin/smartwatches');
  }

  if (!watch) return <div className="pt-12 text-dim">Loading model…</div>;

  return <main className="pt-8 pb-16"><div className="flex items-end gap-4 mb-8"><div className="mr-auto"><div className="font-mono text-xs text-accent uppercase mb-2">Catalog / Edit</div><h1 className="font-display font-bold text-3xl">{watch.name}</h1><p className="text-dim text-sm mt-1">{watch.id}</p></div><button onClick={remove} className="btn-ghost">Delete</button></div>
    <form onSubmit={save} className="space-y-8">
      <section className="grid sm:grid-cols-2 gap-4 bg-panel border border-line p-5">
        <div><label className="field-label">Brand</label><select value={watch.brand_id || ''} onChange={(e) => set('brand_id', e.target.value)} className="field-input">{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        {fields.map(([field,label,type]) => <div key={field}><label className="field-label">{label}</label><input type={type} value={watch[field] ?? ''} onChange={(e) => set(field, type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)} className="field-input" /></div>)}
      </section>
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-panel border border-line p-5"><h2 className="sm:col-span-2 lg:col-span-3 font-display font-semibold">Features</h2>{toggles.map((field) => <label key={field} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(watch[field])} onChange={(e) => set(field, e.target.checked)} />{field.replaceAll('_',' ')}</label>)}</section>
      <section className="grid sm:grid-cols-2 gap-4 bg-panel border border-line p-5"><div><label className="field-label">QA status</label><select value={watch.qa_status || 'NEEDS_RESEARCH'} onChange={(e) => set('qa_status', e.target.value)} className="field-input">{['VERIFIED','GOOD','INCOMPLETE','NEEDS_RESEARCH'].map((v) => <option key={v}>{v}</option>)}</select></div><div><label className="field-label">Quality score</label><input type="number" min="0" max="100" value={watch.quality_score ?? 0} onChange={(e) => set('quality_score', Number(e.target.value))} className="field-input" /></div></section>
      <div className="flex items-center gap-4"><button disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save changes'}</button>{message && <span className="text-dim text-sm">{message}</span>}</div>
    </form>
  </main>;
}
