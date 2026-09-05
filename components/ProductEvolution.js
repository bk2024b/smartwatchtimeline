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

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function valueLabel(model, key) {
  if (!model) return '—';
  const value = model[key];
  if (value === null || value === undefined || value === '') return '—';
  if (key === 'battery_life_h') return `${value}h`;
  if (key === 'weight_g') return `${value}g`;
  if (key === 'case_size_mm') return `${value}mm`;
  if (key === 'price') return money(value);
  if (key === 'water_rating') return value;
  return Boolean(value) ? 'Yes' : 'No';
}

function deltaText(previous, current, key) {
  const a = number(previous?.[key]);
  const b = number(current?.[key]);
  if (a === null || b === null || a === b) return null;
  const diff = Math.round((b - a) * 10) / 10;
  return diff > 0 ? `+${diff}` : `${diff}`;
}

const NUMERIC_CHANGES = [
  ['Battery', 'battery_life_h', 'h'],
  ['Weight', 'weight_g', 'g'],
  ['Launch price', 'price', '$'],
  ['Case size', 'case_size_mm', 'mm'],
];

const FEATURE_CHANGES = [
  ['GPS', 'gps'],
  ['Cellular', 'cellular'],
  ['ECG', 'ecg'],
  ['Blood oxygen', 'blood_oxygen'],
  ['NFC payments', 'nfc_payments'],
  ['Always-on display', 'always_on_display'],
];

export default function ProductEvolution({ current, lineup }) {
  if (!current || !Array.isArray(lineup) || lineup.length < 2) return null;

  const index = Math.max(0, lineup.findIndex((item) => item.id === current.id));
  const previous = index > 0 ? lineup[index - 1] : null;
  const next = index < lineup.length - 1 ? lineup[index + 1] : null;
  const first = lineup[0];

  const numericChanges = previous
    ? NUMERIC_CHANGES.map(([label, key, unit]) => {
        const delta = deltaText(previous, current, key);
        if (delta === null) return null;
        return { label, key, unit, delta, from: valueLabel(previous, key), to: valueLabel(current, key) };
      }).filter(Boolean)
    : [];

  const featureChanges = previous
    ? FEATURE_CHANGES.map(([label, key]) => {
        if (Boolean(previous[key]) === Boolean(current[key])) return null;
        return { label, key, from: Boolean(previous[key]), to: Boolean(current[key]) };
      }).filter(Boolean)
    : [];

  return (
    <section className="mt-10 hardware-card overflow-hidden">
      <div className="p-5 sm:p-7 border-b border-line">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em] mb-2">Product evolution</div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl">From generation to generation</h2>
            <p className="text-dim text-sm mt-2 max-w-2xl">See where this model sits in its lineup and what changed from the immediately preceding model.</p>
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

      {previous ? (
        <div className="border-b border-line">
          <div className="p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em]">What changed?</div>
                <h3 className="font-display font-bold text-xl sm:text-2xl mt-1">{previous.name} → {current.name}</h3>
              </div>
              <div className="font-mono text-[10px] text-dim">{yearOf(previous.release_date) || '—'} → {yearOf(current.release_date) || '—'}</div>
            </div>

            {numericChanges.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line mt-5 border border-line rounded-xl overflow-hidden">
                {numericChanges.map(({ label, key, delta, from, to }) => (
                  <div key={key} className="bg-panel p-4">
                    <div className="font-mono text-[9px] uppercase tracking-wider text-dim">{label}</div>
                    <div className="font-display font-bold text-lg mt-1">{to}</div>
                    <div className="font-mono text-[9px] text-dim mt-1">from {from}</div>
                    <div className={`font-mono text-[9px] mt-1 ${key === 'weight_g' || key === 'price' ? (Number(delta) < 0 ? 'text-accent' : 'text-dim') : (Number(delta) > 0 ? 'text-accent' : 'text-dim')}`}>
                      {delta}{key === 'price' ? '' : ` ${key === 'battery_life_h' ? 'h' : key === 'weight_g' ? 'g' : 'mm'}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {featureChanges.length > 0 ? (
              <div className="mt-5">
                <div className="font-mono text-[9px] uppercase tracking-wider text-dim mb-2">Feature changes</div>
                <div className="flex flex-wrap gap-2">
                  {featureChanges.map(({ label, key, from, to }) => (
                    <div key={key} className="font-mono text-[9px] border border-line rounded-full px-3 py-1.5 bg-panel">
                      <span className="text-fg">{label}</span>
                      <span className="text-dim"> · {from ? 'Yes' : 'No'} → </span>
                      <span className={to ? 'text-accent' : 'text-dim'}>{to ? 'Yes' : 'No'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : numericChanges.length === 0 ? (
              <p className="text-dim text-sm mt-5">No tracked specification changes are available for this transition.</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-7 border-b border-line">
          <div className="font-mono text-[10px] text-accent uppercase tracking-[0.14em]">First tracked model</div>
          <p className="text-dim text-sm mt-2">This is the first tracked model in this lineup, so there is no earlier model for a generation-to-generation delta.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line">
        {[
          ['Battery', current.battery_life_h ? `${current.battery_life_h}h` : '—'],
          ['Weight', current.weight_g ? `${current.weight_g}g` : '—'],
          ['Launch price', money(current.price)],
          ['Case size', current.case_size_mm ? `${current.case_size_mm}mm` : '—'],
        ].map(([label, value]) => (
          <div key={label} className="bg-panel p-4 sm:p-5">
            <div className="font-mono text-[9px] uppercase tracking-wider text-dim">{label}</div>
            <div className="font-display font-bold text-lg mt-1">{value}</div>
            {first.id !== current.id && <div className="font-mono text-[9px] text-dim mt-1">vs first: {valueLabel(first, label === 'Battery' ? 'battery_life_h' : label === 'Weight' ? 'weight_g' : label === 'Launch price' ? 'price' : 'case_size_mm')}</div>}
          </div>
        ))}
      </div>

      {(previous || next) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line">
          {previous ? (
            <Link href={`/smartwatches/${previous.id}`} className="bg-panel p-4 sm:p-5 hover:bg-panel2 transition-colors">
              <div className="font-mono text-[9px] text-dim uppercase">Previous in lineup</div>
              <div className="font-display font-semibold mt-2">← {previous.name}</div>
              <div className="font-mono text-[10px] text-dim mt-1">{yearOf(previous.release_date) || '—'} · {money(previous.price)}</div>
            </Link>
          ) : <div className="bg-panel" />}
          {next ? (
            <Link href={`/smartwatches/${next.id}`} className="bg-panel p-4 sm:p-5 hover:bg-panel2 transition-colors sm:text-right">
              <div className="font-mono text-[9px] text-dim uppercase">Next in lineup</div>
              <div className="font-display font-semibold mt-2">{next.name} →</div>
              <div className="font-mono text-[10px] text-dim mt-1">{yearOf(next.release_date) || '—'} · {money(next.price)}</div>
            </Link>
          ) : <div className="bg-panel" />}
        </div>
      )}
    </section>
  );
}
