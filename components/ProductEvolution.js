'use client';

import Link from 'next/link';

function yearOf(value) {
  if (!value) return null;
  const year = new Date(value).getFullYear();
  return Number.isFinite(year) ? year : null;
}

function money(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `$${Math.round(n)}` : '—';
}

export default function ProductEvolution({ current, lineup }) {
  if (!current || !Array.isArray(lineup) || lineup.length < 2) return null;

  const index = Math.max(0, lineup.findIndex((item) => item.id === current.id));
  const first = lineup[0];
  const previous = index > 0 ? lineup[index - 1] : null;
  const next = index < lineup.length - 1 ? lineup[index + 1] : null;

  const delta = (key) => {
    const a = Number(current[key]);
    const b = Number(first[key]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
    return Math.round(((a - b) / b) * 100);
  };

  return (
    <section className="mt-10 hardware-card overflow-hidden">
      <div className="p-5 sm:p-7 border-b border-line">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em] mb-2">Product evolution</div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl">From generation to generation</h2>
            <p className="text-dim text-sm mt-2 max-w-2xl">See exactly where this model sits in its lineage and how the hardware changed from the first tracked model.</p>
          </div>
          <div className="font-mono text-[10px] text-dim border border-line rounded-full px-3 py-1.5">{index + 1} / {lineup.length}</div>
        </div>

        <div className="mt-7 overflow-x-auto pb-2">
          <div className="min-w-[620px] relative pt-8">
            <div className="absolute left-3 right-3 top-[43px] h-px bg-line" />
            <div className="relative flex justify-between gap-5">
              {lineup.map((model, i) => {
                const active = model.id === current.id;
                return (
                  <div key={model.id} className="w-28 sm:w-32 shrink-0 text-center">
                    <Link href={`/smartwatches/${model.id}`} className="group block">
                      <div className={`mx-auto relative z-10 w-3.5 h-3.5 rounded-full border-2 transition-all ${active ? 'bg-accent border-accent shadow-[0_0_16px_rgba(34,208,122,.75)] scale-125' : 'bg-page border-dim/50 group-hover:border-accent'}`} />
                      <div className={`mt-4 font-display text-xs sm:text-sm leading-tight group-hover:text-accent ${active ? 'text-accent font-semibold' : ''}`}>{model.name}</div>
                      <div className="font-mono text-[9px] text-dim mt-1">{yearOf(model.release_date) || '—'}</div>
                      <div className="font-mono text-[9px] text-dim">{money(model.price)}</div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line">
        {[
          ['Battery', current.battery_life_h ? `${current.battery_life_h}h` : '—', delta('battery_life_h')],
          ['Weight', current.weight_g ? `${current.weight_g}g` : '—', delta('weight_g')],
          ['Launch price', money(current.price), delta('price')],
          ['Case size', current.case_size_mm ? `${current.case_size_mm}mm` : '—', delta('case_size_mm')],
        ].map(([label, value, change]) => (
          <div key={label} className="bg-panel p-4 sm:p-5">
            <div className="font-mono text-[9px] uppercase tracking-wider text-dim">{label}</div>
            <div className="font-display font-bold text-lg mt-1">{value}</div>
            {change !== null && <div className={`font-mono text-[9px] mt-1 ${change > 0 ? 'text-accent' : change < 0 ? 'text-dim' : 'text-dim'}`}>{change > 0 ? '+' : ''}{change}% vs first</div>}
          </div>
        ))}
      </div>

      {(previous || next) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line">
          {previous ? (
            <Link href={`/smartwatches/${previous.id}`} className="bg-panel p-4 sm:p-5 hover:bg-panel2 transition-colors">
              <div className="font-mono text-[9px] text-dim uppercase">Previous generation</div>
              <div className="font-display font-semibold mt-2">← {previous.name}</div>
              <div className="font-mono text-[10px] text-dim mt-1">{yearOf(previous.release_date) || '—'} · {money(previous.price)}</div>
            </Link>
          ) : <div className="bg-panel" />}
          {next ? (
            <Link href={`/smartwatches/${next.id}`} className="bg-panel p-4 sm:p-5 hover:bg-panel2 transition-colors sm:text-right">
              <div className="font-mono text-[9px] text-dim uppercase">Next generation</div>
              <div className="font-display font-semibold mt-2">{next.name} →</div>
              <div className="font-mono text-[10px] text-dim mt-1">{yearOf(next.release_date) || '—'} · {money(next.price)}</div>
            </Link>
          ) : <div className="bg-panel" />}
        </div>
      )}
    </section>
  );
}
