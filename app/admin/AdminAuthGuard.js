'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

export default function AdminAuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState('loading');

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    let active = true;

    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) {
        router.replace(`/admin/login?next=${encodeURIComponent(pathname || '/admin')}`);
        return;
      }
      const { data: profile } = await supabase.from('admin_profiles').select('user_id, role, display_name').eq('user_id', session.user.id).maybeSingle();
      if (!profile) {
        await supabase.auth.signOut();
        router.replace('/admin/login?error=not-admin');
        return;
      }
      setState('ready');
    }

    check();
    return () => { active = false; };
  }, [pathname, router]);

  if (state !== 'ready') {
    return <div className="min-h-[60vh] flex items-center justify-center text-dim font-mono text-xs uppercase">Checking admin access…</div>;
  }

  return children;
}
