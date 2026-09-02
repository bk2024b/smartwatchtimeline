import Link from 'next/link';
import { VendorButtonsCompact } from './VendorButtons';

// Unlike EarbudsTimeline (where this was an inline function defined once
// inside the guide page and never reused elsewhere), this is a standalone
// component from the start — it's used on guide pages, the catalog, and
// brand hub pages, so a change here doesn't need to be copy-pasted three
// times as new page types are added.
export default function ProductCard({ watch, brand, rank, productLinks = [] }) {
  return (
    <div className="bg-panel border border-line rounded-2xl p-5 hover:border-accent transition-colors">
      <Link href={`/smartwatches/${watch.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3 min-w-0">
            {rank && <span className="font-mono text-accent text-sm shrink-0">#{rank}</span>}
            <div className="min-w-0">
              <div className="font-mono text-[10px] text-accent uppercase tracking-[0.12em] mb-1">{brand?.name || watch.brand_id}</div>
              <h3 className="font-display font-semibold text-[16px] leading-tight">{watch.name}</h3>
            </div>
          </div>
          {Number.isFinite(Number(watch.price)) && (
            <div className="text-right shrink-0">
              <div className="font-display font-bold text-xl">${Number(watch.price).toFixed(0)}</div>
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-line p-2">
            <div className="font-mono text-[9px] text-dim">Battery</div>
            <div className="font-mono text-sm mt-1">{watch.battery_life_h ? `${watch.battery_life_h}h` : '—'}</div>
          </div>
          <div className="rounded-lg border border-line p-2">
            <div className="font-mono text-[9px] text-dim">Water</div>
            <div className="font-mono text-[11px] mt-1 truncate">{watch.water_rating || '—'}</div>
          </div>
          <div className="rounded-lg border border-line p-2">
            <div className="font-mono text-[9px] text-dim">Weight</div>
            <div className="font-mono text-sm mt-1">{watch.weight_g ? `${watch.weight_g}g` : '—'}</div>
          </div>
        </div>
      </Link>
      <VendorButtonsCompact links={productLinks} watchId={watch.id} />
    </div>
  );
}
