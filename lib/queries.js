import { unstable_cache } from 'next/cache';
import { getSupabase } from './supabase';

const CATALOG_REVALIDATE = 3600;

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

// New for this project: fetch every vendor link for a given model, ordered
// the way they should display as "Check Price" buttons. Kept as its own
// query (rather than folded into getWatchById via a join) so a model page
// can render its buy buttons without waiting on this table if it's ever
// slow, and so the finder/catalog views that don't need buy links stay light.
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

// Bulk variant for pages that render many models at once (guides, catalog)
// and need vendor links for each without an N+1 query per card.
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

// Slim column set for the finder tool — same reasoning as EarbudsTimeline's
// getFinderCatalog: the finder's client component doesn't need images or
// long text fields, so select('*') there would just be wasted payload.
export const getFinderCatalog = unstable_cache(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('smartwatches')
    .select('id, name, brand_id, gamme, release_date, price, battery_life_h, weight_g, water_rating, cellular, gps, ecg, blood_oxygen, ecosystem, os, marquant, rugged, round_face')
    .order('release_date', { ascending: true });
  if (error) throw error;
  return data;
}, ['smartwatches-finder-catalog'], { revalidate: CATALOG_REVALIDATE });
