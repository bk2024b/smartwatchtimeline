'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

const QUESTIONS = [
  { key: 'budget', title: 'What is your budget?', options: [['under200', 'Under $200'], ['200_400', '$200–400'], ['400_700', '$400–700'], ['over700', 'Over $700'], ['any', 'No fixed budget']] },
  { key: 'priority', title: 'What matters most?', options: [['battery', 'Battery life'], ['health', 'Health & sensors'], ['sport', 'Sports & GPS'], ['smart', 'Smart features'], ['design', 'Design & comfort']] },
  { key: 'phone', title: 'Which ecosystem do you use?', options: [['apple', 'Apple / iPhone'], ['android', 'Android'], ['any', 'Either']] },
  { key: 'connectivity', title: 'Do you need cellular connectivity?', options: [['yes', 'Yes, standalone LTE'], ['no', 'No, Bluetooth is enough'], ['any', 'Not important']] },
  { key: 'battery', title: 'How important is long battery life?', options: [['high', 'Very important'], ['medium', 'Nice to have'], ['low', 'Not a priority']] },
  { key: 'form', title: 'Which watch style do you prefer?', options: [['round', 'Round'], ['square', 'Square / rectangular'], ['any', 'No preference']] },
];

function truthy(value) { return value === true || value === 1 || value === 'true' || value === '1' || (typeof value === 'string' && value.toLowerCase() === 'yes'); }
function number(value) { const n = Number(value); return Number.isFinite(n) ? n : null; }
function priceMatch(price, budget) { if (budget === 'any') return 0; if (price == null) return -10; if (budget === 'under200') return price < 200 ? 25 : -18; if (budget === '200_400') return price >= 200 && price <= 400 ? 25 : -10; if (budget === '400_700') return price > 400 && price <= 700 ? 25 : -8; return price > 700 ? 25 : -5; }

function score(w, answers) {
  let points = 50; const reasons = [];
  const price = number(w.price); const battery = number(w.battery_life_h); const weight = number(w.weight_g);
  points += priceMatch(price, answers.budget);
  if (answers.phone !== 'any') {
    const ecosystem = String(w.ecosystem || '').toLowerCase();
    const apple = ecosystem.includes('apple') || ecosystem.includes('watchos') || String(w.os || '').toLowerCase().includes('watchos');
    const android = !apple;
    if ((answers.phone === 'apple' && apple) || (answers.phone === 'android' && android)) { points += 18; reasons.push('fits your ecosystem'); } else points -= 22;
  }
  if (answers.connectivity !== 'any') {
    const cellular = truthy(w.cellular);
    if ((answers.connectivity === 'yes' && cellular) || (answers.connectivity === 'no' && !cellular)) { points += 12; reasons.push(answers.connectivity === 'yes' ? 'has cellular' : 'Bluetooth is enough'); } else points -= 10;
  }
  if (answers.form !== 'any') {
    const round = truthy(w.round_face);
    if ((answers.form === 'round' && round) || (answers.form === 'square' && !round)) { points += 8; reasons.push(answers.form === 'round' ? 'round design' : 'square design'); } else points -= 4;
  }
  if (answers.battery === 'high') { if (battery >= 7) { points += 16; reasons.push('strong battery life'); } else if (battery >= 3) points += 5; else points -= 6; }
  if (answers.battery === 'medium') points += Math.min(8, Math.max(0, battery || 0));
  if (answers.priority === 'battery' && battery != null) { points += Math.min(24, battery * 2); reasons.push('battery-focused'); }
  if (answers.priority === 'health') {
    if (truthy(w.ecg)) { points += 11; reasons.push('ECG'); }
    if (truthy(w.blood_oxygen)) { points += 9; reasons.push('blood oxygen'); }
    if (truthy(w.heart_rate)) points += 4;
    if (truthy(w.sleep_tracking)) { points += 5; reasons.push('sleep tracking'); }
  }
  if (answers.priority === 'sport') {
    if (truthy(w.gps)) { points += 14; reasons.push('GPS'); }
    if (truthy(w.cellular)) points += 5;
    if (number(w.gps_sports_modes) >= 20) { points += 5; reasons.push('many sports modes'); }
    if (w.water_rating && String(w.water_rating).toLowerCase() !== 'not rated') points += 4;
  }
  if (answers.priority === 'smart') {
    if (truthy(w.nfc_payments)) { points += 9; reasons.push('NFC payments'); }
    if (truthy(w.cellular)) { points += 7; reasons.push('cellular'); }
    if (w.os) points += 3;
  }
  if (answers.priority === 'design') {
    if (answers.form === 'round' && truthy(w.round_face)) points += 6;
    if (weight != null && weight < 50) { points += 7; reasons.push('lightweight'); }
    if (w.case_size_mm) points += 2;
  }
  return { score: Math.max(0, Math.min(99, Math.round(points))), reasons: [...new Set(reasons)].slice(0, 4) };
}

export default function SmartwatchFinder({ watches = [], brands = [] }) {
  const [step, setStep] = useState(0); const [answers, setAnswers] = useState({}); const [done, setDone] = useState(false);
  const brandName = useMemo(() => new Map(brands.map((b) => [String(b.id), b.name])), [brands]);
  const results = useMemo(() => watches.map((w) => ({ w, ...score(w, answers) })).sort((a, b) => b.score - a.score).slice(0, 6), [watches, answers]);
  const question = QUESTIONS[step];
  const choose = (value) => { const next = { ...answers, [question.key]: value }; setAnswers(next); if (step === QUESTIONS.length - 1) setDone(true); else setStep(step + 1); };
  const reset = () => { setAnswers({}); setStep(0); setDone(false); };
  if (done) return <section className="max-w-5xl mx-auto"><div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Your matches</div><h2 className="font-display font-bold text-4xl sm:text-5xl">Watches matched to you.</h2><p className="text-dim mt-4 max-w-2xl">Your ranking combines budget, ecosystem, connectivity, design, battery and your main priority.</p>{results.length === 0 ? <div className="mt-8 bg-panel border border-line rounded-2xl p-8 text-dim">No smartwatch matches are available yet.</div> : <div className="grid md:grid-cols-2 gap-4 mt-8">{results.map(({w, score: points, reasons}, index) => <Link key={w.id} href={`/smartwatches/${w.id}`} className={`bg-panel border rounded-2xl p-5 hover:border-accent transition-colors ${index === 0 ? 'border-accent' : 'border-line'}`}><div className="flex items-center justify-between gap-3"><span className="font-mono text-[10px] text-accent uppercase">#{index + 1} match</span><span className="font-mono text-[10px] text-dim">{points}% fit</span></div><h3 className="font-display font-semibold text-2xl mt-3">{w.name}</h3><p className="text-sm text-dim mt-1">{brandName.get(String(w.brand_id)) || 'Smartwatch'}{w.gamme ? ` · ${w.gamme}` : ''}</p><div className="flex flex-wrap gap-2 mt-4">{reasons.map((r) => <span key={r} className="px-2 py-1 rounded-md bg-panel2 font-mono text-[9px] text-dim">{r}</span>)}</div><div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-line"><div><b className="font-display">{w.price != null ? `$${Number(w.price).toFixed(0)}` : '—'}</b><div className="font-mono text-[8px] text-dim uppercase">price</div></div><div><b className="font-display">{w.battery_life_h ? `${w.battery_life_h}h` : '—'}</b><div className="font-mono text-[8px] text-dim uppercase">battery</div></div><div><b className="font-display">{w.weight_g ? `${w.weight_g}g` : '—'}</b><div className="font-mono text-[8px] text-dim uppercase">weight</div></div></div></Link>)}</div>}<div className="flex flex-wrap gap-3 mt-8"><button type="button" onClick={reset} className="btn-primary">Start over</button><Link href="/compare" className="btn-secondary">Compare models</Link></div></section>;
  return <section className="max-w-3xl mx-auto"><div className="flex justify-between font-mono text-[10px] text-dim uppercase tracking-wider mb-3"><span>Smartwatch Finder</span><span>{step + 1} / {QUESTIONS.length}</span></div><div className="h-1 bg-panel2 rounded-full overflow-hidden mb-8"><div className="h-full bg-accent transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div><div className="bg-panel border border-line rounded-3xl p-6 sm:p-10"><div className="font-mono text-[9px] text-accent uppercase tracking-wider">Find your match</div><h1 className="font-display font-bold text-3xl sm:text-5xl mt-3">{question.title}</h1><div className="grid sm:grid-cols-2 gap-3 mt-8">{question.options.map(([value, label]) => <button key={value} type="button" onClick={() => choose(value)} className="text-left p-5 rounded-2xl border border-line bg-panel2 hover:border-accent hover:-translate-y-0.5 transition-all"><span className="font-display font-semibold text-lg">{label}</span></button>)}</div>{step > 0 && <button type="button" onClick={() => setStep(step - 1)} className="mt-6 font-mono text-xs text-dim hover:text-accent">← Previous</button>}</div></section>;
}
