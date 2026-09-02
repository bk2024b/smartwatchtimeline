// The main new feature vs. EarbudsTimeline: instead of one generic buy
// link per model, each model can have one "Check Price" button per vendor
// (Amazon confirmed; Best Buy / Walmart / Garmin Store / Samsung Store etc.
// as those partnerships come online — see supabase/schema.sql:product_links).
//
// `links` is the array returned by lib/queries.js:getProductLinks(id) or
// getAllProductLinks() filtered client-side, already sorted by `priority`.
//
// Two sizes: `compact` for catalog/guide cards (one primary button, "+N more"
// if there are others), and the full row for the model detail page.

const VENDOR_STYLE = {
  amazon: { bg: 'bg-[#ff9900]', text: 'text-black' },
  best_buy: { bg: 'bg-[#0046be]', text: 'text-white' },
  walmart: { bg: 'bg-[#0071ce]', text: 'text-white' },
  garmin_store: { bg: 'bg-[#007cc3]', text: 'text-white' },
  samsung_store: { bg: 'bg-[#1428a0]', text: 'text-white' },
  apple_store: { bg: 'bg-black', text: 'text-white' },
};
const DEFAULT_STYLE = { bg: 'bg-accent', text: 'text-black' };

function formatPrice(link) {
  if (!Number.isFinite(Number(link.price))) return null;
  const symbol = link.currency === 'EUR' ? '€' : '$';
  return `${symbol}${Number(link.price).toFixed(0)}`;
}

function VendorButton({ link, className = '' }) {
  const style = VENDOR_STYLE[link.vendor] || DEFAULT_STYLE;
  const price = formatPrice(link);
  return (
    <a
      href={link.url}
      target="_blank"
      rel={link.rel_sponsored ? 'sponsored noopener' : 'noopener'}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.04em] transition-opacity hover:opacity-90 ${style.bg} ${style.text} ${className}`}
    >
      Check price at {link.vendor_label}
      {price && <span className="opacity-70">· {price}</span>}
    </a>
  );
}

// Compact: one primary vendor button (lowest priority number = first) plus a
// small "+N more" affordance, for space-constrained cards (guide grids,
// catalog listing). Clicking through to the model page shows all vendors.
export function VendorButtonsCompact({ links = [], watchId }) {
  if (!links.length) return null;
  const [primary, ...rest] = links;
  return (
    <div className="flex items-center gap-2 mt-3">
      <VendorButton link={primary} className="flex-1" />
      {rest.length > 0 && (
        <a href={`/smartwatches/${watchId}#buy`} className="font-mono text-[10px] text-dim hover:text-accent shrink-0">
          +{rest.length} more
        </a>
      )}
    </div>
  );
}

// Full: every vendor as its own button, for the model detail page.
export function VendorButtonsFull({ links = [] }) {
  if (!links.length) {
    return <p className="text-dim text-sm">No vendor links yet for this model.</p>;
  }
  return (
    <div id="buy" className="grid gap-2.5 sm:grid-cols-2">
      {links.map((link) => (
        <VendorButton key={link.id} link={link} />
      ))}
    </div>
  );
}
