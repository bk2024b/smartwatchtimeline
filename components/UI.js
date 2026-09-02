import Link from 'next/link';
import { getBrands, getAllWatches } from '@/lib/queries';

export function Stat({ value, label }) {
  return (
    <div>
      <b className="block font-display font-bold text-[28px]">{value}</b>
      <span className="text-dim text-[12.5px] uppercase tracking-[0.08em]">{label}</span>
    </div>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <div className="font-mono text-[10px] text-dim uppercase tracking-[0.1em] mb-3">{title}</div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }) {
  return (
    <Link href={href} className="text-dim hover:text-accent transition-colors">
      {children}
    </Link>
  );
}

export async function Footer() {
  const [brands, watches] = await Promise.all([getBrands(), getAllWatches()]);
  const topBrands = [...brands]
    .map((b) => ({ ...b, count: watches.filter((w) => w.brand_id === b.id).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <footer className="pt-10 border-t border-line mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8 text-xs">
        <FooterCol title="Explore">
          <FooterLink href="/smartwatches">All models</FooterLink>
          <FooterLink href="/guides">All guides</FooterLink>
          <FooterLink href="/timeline">Timeline</FooterLink>
          <FooterLink href="/compare">Compare tool</FooterLink>
        </FooterCol>

        <FooterCol title="Brands">
          {topBrands.map((b) => (
            <FooterLink key={b.id} href={`/brands/${b.id}`}>
              {b.name}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Popular guides">
          <FooterLink href="/guides/best-smartwatch-under-100">Under $100</FooterLink>
          <FooterLink href="/guides/best-smartwatch-under-200">Under $200</FooterLink>
          <FooterLink href="/guides/best-smartwatch-for-running">For running</FooterLink>
          <FooterLink href="/guides/rugged-smartwatches">Rugged</FooterLink>
        </FooterCol>

        <FooterCol title="Legal">
          <FooterLink href="/privacy">Privacy policy</FooterLink>
        </FooterCol>
      </div>

      <p className="text-dim text-xs text-center pt-5 border-t border-line">
        © {new Date().getFullYear()} SmartwatchTimeline. Some links are affiliate links — we may earn a commission at no extra cost to you.
      </p>
    </footer>
  );
}

export function Nav() {
  return (
    <nav className="flex items-center gap-6 text-sm font-mono">
      <Link href="/" className="font-display font-bold text-lg">SmartwatchTimeline</Link>
      <Link href="/smartwatches" className="text-dim hover:text-accent transition-colors">Models</Link>
      <Link href="/guides" className="text-dim hover:text-accent transition-colors">Guides</Link>
      <Link href="/timeline" className="text-dim hover:text-accent transition-colors">Timeline</Link>
      <Link href="/compare" className="text-dim hover:text-accent transition-colors">Compare</Link>
    </nav>
  );
}
