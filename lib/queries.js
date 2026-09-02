import { unstable_cache } from 'next/cache';
import { getSupabase } from './supabase';

const CATALOG_REVALIDATE = 3600;
const ARTICLE_REVALIDATE = 600;

export const getAllWatches = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('smartwatches').select('*').order('release_date', { ascending: true });
  if (error) throw error;
  return data;
}, ['smartwatches-all'], { revalidate: CATALOG_REVALIDATE });

export const getBrands = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error) throw error;
  return data;
}, ['brands-all'], { revalidate: CATALOG_REVALIDATE });

export async function getBrandById(id) {
  return unstable_cache(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('brands').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }, [`brand-${id}`], { revalidate: CATALOG_REVALIDATE })();
}

export async function getWatchById(id) {
  return unstable_cache(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('smartwatches').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }, [`watch-${id}`], { revalidate: CATALOG_REVALIDATE })();
}

export async function getProductLinks(smartwatchId) {
  return unstable_cache(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('product_links')
      .select('*')
      .eq('smartwatch_id', smartwatchId)
      .order('priority', { ascending: true });
    if (error) return [];
    return data || [];
  }, [`product-links-${smartwatchId}`], { revalidate: CATALOG_REVALIDATE })();
}

export const getAllProductLinks = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('product_links').select('*').order('priority', { ascending: true });
  if (error) return [];
  return data || [];
}, ['product-links-all'], { revalidate: CATALOG_REVALIDATE });

export const getSearchCatalog = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('smartwatches')
    .select('id, name, brand_id, gamme, release_date, price')
    .order('release_date', { ascending: true });
  if (error) throw error;
  return data;
}, ['smartwatches-search-catalog'], { revalidate: CATALOG_REVALIDATE });

export const getFinderCatalog = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('smartwatches')
    .select('id, name, brand_id, gamme, release_date, price, battery_life_h, weight_g, water_rating, cellular, gps, ecg, blood_oxygen, ecosystem, os, marquant, rugged, round_face')
    .order('release_date', { ascending: true });
  if (error) throw error;
  return data;
}, ['smartwatches-finder-catalog'], { revalidate: CATALOG_REVALIDATE });

export const getPublishedArticles = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, excerpt, cover_image_url, reading_minutes, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data || [];
}, ['articles-published'], { revalidate: ARTICLE_REVALIDATE });

export async function getArticleById(id) {
  return unstable_cache(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .maybeSingle();
    if (error) return null;
    return data;
  }, [`article-${id}`], { revalidate: ARTICLE_REVALIDATE })();
}

export const getPublishedGuides = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('guides')
    .select('slug, priority, category, icon, title, description, intro, sections, faq, filter, sort, published_at')
    .eq('status', 'published')
    .order('priority', { ascending: false });
  if (error) throw error;
  return data || [];
}, ['guides-published'], { revalidate: CATALOG_REVALIDATE });

export async function getGuideBySlug(slug) {
  return unstable_cache(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) return null;
    return data;
  }, [`guide-${slug}`], { revalidate: CATALOG_REVALIDATE })();
}
