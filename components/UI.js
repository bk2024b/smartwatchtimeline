import Link from 'next/link';
import { getBrands, getAllWatches } from '@/lib/queries';

export function Stat({ value, label }) {
  return (
    <div className="flex flex-col">
      <b className="block font-display font-bold text-3xl sm:text-4xl text-accent tracking-tight leading-none mb-1.5">{value}</b>
      <span className="text-dim text-[11px] font-mono uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function Badge({ children, gold = false }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-mono ${gold ? 'bg-amber/15 border-amber text-amber' : 'bg-panel2 border-line text-dim'}`}>
      {children}
    </span>
  );
}

function FooterCol({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-dim uppercase tracking-[0.08em] text-[11px] m-0 mb-1">{title}</p>
      {children}
    </div>
  );
}

function FooterLink({ href, children }) {
  return <Link href={href} className="text-dim hover:text-accent transition-colors">{children}</Link>;
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
          <FooterLink href="/timeline">Timeline</FooterLink>
          <FooterLink href="/brands">All brands</FooterLink>
          <FooterLink href="/guides">All guides</FooterLink>
          <FooterLink href="/compare">Compare tool</FooterLink>
        </FooterCol>
        <FooterCol title="Brands">
          {topBrands.map((b) => <FooterLink key={b.id} href={`/brands/${b.id}`}>{b.name}</FooterLink>)}
        </FooterCol>
        <FooterCol title="Popular guides">
          <FooterLink href="/guides/best-smartwatch-under-100">Under $100</FooterLink>
          <FooterLink href="/guides/best-smartwatch-under-200">Under $200</FooterLink>
          <FooterLink href="/guides/best-smartwatch-for-running">For running</FooterLink>
          <FooterLink href="/guides/rugged-smartwatches">Rugged</FooterLink>
        </FooterCol>
        <FooterCol title="Legal">
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/privacy">Privacy policy</FooterLink>
        </FooterCol>
      </div>
      <p className="text-dim text-xs text-center pt-5 border-t border-line flex items-center justify-center gap-3 flex-wrap">
        <span>© {new Date().getFullYear()} SmartwatchTimeline</span>
        <span>·</span>
        <span>Some links are affiliate links — we may earn a commission at no extra cost to you.</span>
      </p>
    </footer>
  );
}

export function Nav() {
  return (
    <nav className="flex items-center gap-5 sm:gap-6 text-sm font-mono flex-wrap" aria-label="Main navigation">
      <Link href="/" className="font-display font-bold text-lg tracking-tight mr-auto">SmartwatchTimeline</Link>
      <Link href="/smartwatches" className="text-dim hover:text-accent transition-colors">Models</Link>
      <Link href="/brands" className="text-dim hover:text-accent transition-colors">Brands</Link>
      <Link href="/guides" className="text-dim hover:text-accent transition-colors">Guides</Link>
      <Link href="/timeline" className="text-dim hover:text-accent transition-colors">Timeline</Link>
      <Link href="/compare" className="text-dim hover:text-accent transition-colors">Compare</Link>
    </nav>
  );
}
