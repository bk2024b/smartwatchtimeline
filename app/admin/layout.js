import Link from 'next/link';

export const metadata = {
  title: 'Admin | SmartwatchTimeline',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <div className="force-dark min-h-screen bg-page text-fg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <header className="flex flex-wrap items-center gap-4 pb-6 border-b border-line">
          <Link href="/admin" className="font-display font-bold text-lg mr-auto">SmartwatchTimeline <span className="text-accent">/ Admin</span></Link>
          <Link href="/" className="text-dim hover:text-accent text-sm">View site ↗</Link>
        </header>
        {children}
      </div>
    </div>
  );
}
