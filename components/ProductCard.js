import Link from 'next/link';
import { VendorButtonsCompact } from './VendorButtons';

function value(value, suffix = '') {
  return value === null || value === undefined || value === '' ? '—' : `${value}${suffix}`;
}

export default function ProductCard({ watch, brand, rank, productLinks = [] }) {
  return (
    <article className="group bg-panel border border-line rounded-2xl overflow-hidden hover:border-accent transition-colors duration-200">
      <Link href={`/smartwatches/${watch.id}`} className="block">
        <div className="relative h-52 sm:h-56 bg-panel2 flex items-center justify-center overflow-hidden border-b border-line">
          <div className="absolute inset-0 bg-radial from-accent/10 to-transparent pointer-events-none" />
          {watch.image_url ? (
            <img
              src={watch.image_url}
              alt={watch.name}
              loading="lazy"
              className="relative max-h-[82%] max-w-[82%] object-contain floating-hardware transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Smartwatch</span>
          )}
          {rank && (
            <span className="absolute top-3 left-3 font-mono text-[10px] text-accent bg-page/80 border border-line rounded-md px-2 py-1">#{rank}</span>
          )}
          {watch.marquant && (
            <span className="absolute top-3 right-3 font-mono text-[9px] uppercase tracking-wider text-amber bg-page/80 border border-amber/40 rounded-md px-2 py-1">Notable</span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-mono text-[10px] text-accent uppercase tracking-[0.12em] mb-1">{brand?.name || watch.brand_id}</div>
              <h3 className="font-display font-semibold text-[17px] leading-tight">{watch.name}</h3>
              {watch.gamme && <div className="font-mono text-[10px] text-dim mt-1">{watch.gamme}</div>}
            </div>
            {Number.isFinite(Number(watch.price)) && (
              <div className="text-right shrink-0">
                <div className="font-display font-bold text-xl">${Number(watch.price).toFixed(0)}</div>
                <div className="font-mono text-[9px] text-dim uppercase">launch</div>
              </div>
            )}
          </div>

          {watch.tagline && <p className="text-dim text-xs leading-5 mt-3 line-clamp-2">{watch.tagline}</p>}

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="rounded-lg border border-line p-2">
              <div className="font-mono text-[8px] text-dim uppercase">Battery</div>
              <div className="font-mono text-xs mt-1">{value(watch.battery_life_h, 'h')}</div>
            </div>
            <div className="rounded-lg border border-line p-2">
              <div className="font-mono text-[8px] text-dim uppercase">Weight</div>
              <div className="font-mono text-xs mt-1">{value(watch.weight_g, 'g')}</div>
            </div>
            <div className="rounded-lg border border-line p-2">
              <div className="font-mono text-[8px] text-dim uppercase">Water</div>
              <div className="font-mono text-[10px] mt-1 truncate">{watch.water_rating || '—'}</div>
            </div>
            <div className="rounded-lg border border-line p-2">
              <div className="font-mono text-[8px] text-dim uppercase">GPS</div>
              <div className="font-mono text-xs mt-1">{watch.gps ? 'Yes' : 'No'}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {watch.ecg && <span className="font-mono text-[9px] px-2 py-1 rounded-md bg-accent/10 text-accent">ECG</span>}
            {watch.blood_oxygen && <span className="font-mono text-[9px] px-2 py-1 rounded-md bg-accent/10 text-accent">SpO2</span>}
            {watch.cellular && <span className="font-mono text-[9px] px-2 py-1 rounded-md bg-panel2 text-dim border border-line">Cellular</span>}
            {watch.nfc_payments && <span className="font-mono text-[9px] px-2 py-1 rounded-md bg-panel2 text-dim border border-line">NFC</span>}
          </div>
        </div>
      </Link>
      {productLinks.length > 0 && <div className="px-5 pb-5"><VendorButtonsCompact links={productLinks} watchId={watch.id} /></div>}
    </article>
  );
}
