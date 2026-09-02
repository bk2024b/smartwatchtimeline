import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabaseServer';

const RESOURCE_CONFIG = {
  watch: {
    tags: ({ id }) => ['watches', 'finder-catalog', 'search-catalog', ...(id ? [`watch:${id}`, `product-links:${id}`] : [])],
    paths: ({ id }) => ['/smartwatches', '/timeline', '/compare', '/finder', '/years', '/technologies', '/insights', '/explore', ...(id ? [`/smartwatches/${id}`] : [])],
  },
  brand: {
    tags: ({ id }) => ['brands', 'search-catalog', 'finder-catalog', ...(id ? [`brand:${id}`] : [])],
    paths: ({ id }) => ['/brands', '/smartwatches', '/timeline', '/compare', '/finder', '/explore', ...(id ? [`/brands/${id}`] : [])],
  },
  'product-links': {
    tags: ({ id }) => ['product-links', ...(id ? [`product-links:${id}`] : [])],
    paths: ({ id }) => ['/smartwatches', '/compare', ...(id ? [`/smartwatches/${id}`] : [])],
  },
  article: {
    tags: ({ id }) => ['articles', ...(id ? [`article:${id}`] : [])],
    paths: ({ id }) => ['/blog', '/sitemap.xml', ...(id ? [`/blog/${id}`] : [])],
  },
  guide: {
    tags: ({ id }) => ['guides', ...(id ? [`guide:${id}`] : [])],
    paths: ({ id }) => ['/guides', '/explore', '/sitemap.xml', ...(id ? [`/guides/${id}`] : [])],
  },
  catalog: {
    tags: () => ['watches', 'brands', 'product-links', 'finder-catalog', 'search-catalog', 'articles', 'guides'],
    paths: () => ['/smartwatches', '/timeline', '/compare', '/finder', '/brands', '/years', '/technologies', '/insights', '/explore', '/blog', '/guides', '/sitemap.xml'],
  },
};

export async function POST(request) {
  try {
    const supabase = getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError || !profile || !['admin', 'editor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const resource = String(body?.resource || '').trim();
    const id = String(body?.id || '').trim();
    const config = RESOURCE_CONFIG[resource];

    if (!config) return NextResponse.json({ error: 'Invalid resource.' }, { status: 400 });
    if (resource !== 'catalog' && !id) return NextResponse.json({ error: 'Resource id is required.' }, { status: 400 });

    for (const tag of config.tags({ id })) revalidateTag(tag);
    for (const path of config.paths({ id })) revalidatePath(path);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin revalidation failed:', error);
    return NextResponse.json({ error: error.message || 'Revalidation failed.' }, { status: 500 });
  }
}
