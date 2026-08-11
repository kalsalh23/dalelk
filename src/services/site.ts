import { supabase } from '@/lib/supabase'
import type { Advertisement, SiteSettings } from '@/types'

export async function fetchAds(placement = 'home'): Promise<Advertisement[]> {
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .eq('is_active', true)
    .eq('placement', placement)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(6)
  if (error) return []
  return (data ?? []) as Advertisement[]
}

export async function fetchAllAds(): Promise<Advertisement[]> {
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) return []
  return (data ?? []) as Advertisement[]
}

export async function createAd(values: Partial<Advertisement>): Promise<boolean> {
  const { error } = await supabase.from('advertisements').insert(values)
  return !error
}

export async function updateAd(id: string, values: Partial<Advertisement>): Promise<boolean> {
  const { error } = await supabase.from('advertisements').update(values).eq('id', id)
  return !error
}

export async function deleteAd(id: string): Promise<boolean> {
  const { error } = await supabase.from('advertisements').delete().eq('id', id)
  return !error
}

export async function incrementAdClick(id: string): Promise<void> {
  await supabase.rpc('increment_ad_click', { ad_id: id })
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from('app_settings').select('value').eq('key', 'site').maybeSingle()
  if (error || !data) return {}
  return (data.value ?? {}) as SiteSettings
}

export async function saveSiteSettings(values: SiteSettings): Promise<boolean> {
  const { error } = await supabase.from('app_settings').upsert({ key: 'site', value: values })
  return !error
}