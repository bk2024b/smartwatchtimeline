'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

const items = [
  ['Dashboard', '/admin'],
  ['Smartwatches', '/admin/smartwatches'],
  ['Brands', '/admin/brands'],
  ['Articles', '/admin/articles'],
  ['Guides', '/admin/guides'],
  ['Product links', '/admin/product-links'],
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await getSupabaseBrowser().auth.signOut();
    router.replace('/admin/login');
  }

  return (
    <div className="grid lg:grid-cols-[190px_minmax(0,1fr)] gap-8 pt-6">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1" aria-label="Admin navigation">
          {items.map(([label, href]) => {
            const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
            return <Link key={href} href={href} className={`px-3 py-2.5 text-sm rounded-lg transition-colors ${active ? 'bg-accent text-ink font-semibold' : 'text-dim hover:text-fg hover:bg-panel2'}`}>{label}</Link>;
          })}
        </nav>
        <button type="button" onClick={signOut} className="mt-4 px-3 py-2 text-xs text-dim hover:text-accent font-mono">Sign out</button>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
