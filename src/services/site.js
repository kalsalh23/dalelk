import { supabase } from '@/lib/supabase';
export async function fetchAds(placement = 'home') {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .eq('placement', placement)
        .or(`expires_at.is.null,expires_at.gte.${now}`)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(6);
    if (error)
        return [];
    return (data ?? []);
}
export async function fetchAdById(id) {
    const now = new Date().toISOString();
    const { data } = await supabase
        .from('advertisements')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gte.${now}`)
        .maybeSingle();
    return (data ?? null);
}
export async function fetchAllAds() {
    const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error)
        return [];
    return (data ?? []);
}
export async function createAd(values) {
    const { error } = await supabase.from('advertisements').insert(values);
    return !error;
}
export async function updateAd(id, values) {
    const { error } = await supabase.from('advertisements').update(values).eq('id', id);
    return !error;
}
export async function deleteAd(id) {
    const { error } = await supabase.from('advertisements').delete().eq('id', id);
    return !error;
}
export async function incrementAdClick(id) {
    await supabase.rpc('increment_ad_click', { ad_id: id });
}
export async function fetchSiteSettings() {
    const { data, error } = await supabase.from('app_settings').select('value').eq('key', 'site').maybeSingle();
    if (error || !data)
        return {};
    return (data.value ?? {});
}
export async function saveSiteSettings(values) {
    const { error } = await supabase.from('app_settings').upsert({ key: 'site', value: values });
    return !error;
}
