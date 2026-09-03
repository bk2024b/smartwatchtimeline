'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const supabase = getSupabaseBrowser();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.session) {
      setError(authError?.message || 'Unable to sign in.');
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase.from('admin_profiles').select('user_id').eq('user_id', data.session.user.id).maybeSingle();
    if (!profile) {
      await supabase.auth.signOut();
      setError('This account is not authorized for the admin dashboard.');
      setLoading(false);
      return;
    }
    router.replace(next.startsWith('/admin') ? next : '/admin');
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center py-12">
      <form onSubmit={submit} className="w-full max-w-md bg-panel border border-line p-6 sm:p-8">
        <div className="font-mono text-xs text-accent uppercase tracking-[0.14em] mb-3">SmartwatchTimeline</div>
        <h1 className="font-display font-bold text-3xl">Admin sign in</h1>
        <p className="text-dim text-sm mt-2 mb-7">Use your Supabase Auth account. Admin access is controlled by <code>admin_profiles</code>.</p>
        <label className="block text-xs font-mono uppercase text-dim mb-2">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 mb-4 text-fg outline-none focus:border-accent" />
        <label className="block text-xs font-mono uppercase text-dim mb-2">Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required className="w-full bg-panel2 border border-line rounded-lg px-3 py-2.5 mb-4 text-fg outline-none focus:border-accent" />
        {error && <p className="text-red-400 text-sm mb-4" role="alert">{error}</p>}
        <button disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-panel border border-line p-6 sm:p-8 animate-pulse">
        <div className="h-4 w-36 bg-panel2 rounded mb-4" />
        <div className="h-9 w-48 bg-panel2 rounded mb-3" />
        <div className="h-4 w-full bg-panel2 rounded mb-2" />
        <div className="h-10 w-full bg-panel2 rounded mt-7" />
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
