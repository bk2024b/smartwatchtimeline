import Link from 'next/link';
import { requireAdmin } from '@/lib/requireAdmin';
import { getAllWatches, getBrands, getPublishedArticles, getPublishedGuides, getAllProductLinks } from '@/lib/queries';

const cards = [
  ['Smartwatches', '/admin/smartwatches', 'Manage catalog data, specs and QA status.'],
  ['Brands', '/admin/brands', 'Manage manufacturers and brand metadata.'],
  ['Articles', '/admin/articles', 'Create, edit and publish editorial content.'],
  ['Guides', '/admin/guides', 'Manage buying guides and recommendation rules.'],
  ['Product links', '/admin/product-links', 'Maintain vendors, prices and affiliate links.'],
];

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [watches, brands, articles, guides, links] = await Promise.all([
    getAllWatches(), getBrands(), getPublishedArticles(), getPublishedGuides(), getAllProductLinks(),
  ]);
  const stats = [['Models', watches.length], ['Brands', brands.length], ['Published articles', articles.length], ['Published guides', guides.length], ['Vendor links', links.length]];

  return (
    <main className="pt-8">
      <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">Control center</div>
      <div className="flex flex-wrap items-end gap-4 mb-8">
        <div className="mr-auto"><h1 className="font-display font-bold text-[36px] sm:text-[48px] leading-tight">Admin dashboard</h1><p className="text-dim mt-2">Manage the SmartwatchTimeline catalog and editorial system.</p></div>
        <Link href="/admin/smartwatches/new" className="btn-primary">+ Add smartwatch</Link>
      </div>
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
        {stats.map(([label, value]) => <div key={label} className="bg-panel border border-line p-4"><div className="font-display font-bold text-2xl text-accent">{value}</div><div className="text-dim text-[10px] font-mono uppercase mt-1">{label}</div></div>)}
      </section>
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(([title, href, description]) => <Link key={href} href={href} className="group bg-panel border border-line p-5 hover:border-accent transition-colors"><div className="font-display font-semibold text-lg group-hover:text-accent transition-colors">{title}</div><p className="text-dim text-sm leading-6 mt-2">{description}</p><div className="font-mono text-[10px] text-accent uppercase mt-5">Open section →</div></Link>)}
      </section>
    </main>
  );
}
