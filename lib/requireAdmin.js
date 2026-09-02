import { redirect } from 'next/navigation';
import { getSupabaseServer } from './supabaseServer';

export async function requireAdmin() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: profile, error } = await supabase
    .from('admin_profiles')
    .select('user_id, display_name, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !profile || !['admin', 'editor'].includes(profile.role)) {
    redirect('/admin/login?error=not-admin');
  }

  return { user, profile, supabase };
}
