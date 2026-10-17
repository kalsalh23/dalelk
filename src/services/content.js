import { supabase } from '@/lib/supabase';
import { todaySQL } from '@/lib/utils';
export const ENTITY_TABLES = {
    doctor: 'doctors',
    clinic: 'clinics',
    hospital: 'hospitals',
    health_center: 'health_centers',
    pharmacy: 'pharmacies',
    lab: 'labs',
    radiology: 'radiology_centers',
};
export async function fetchEntities(type, params = {}) {
    const table = ENTITY_TABLES[type];
    const searchable = type === 'doctor' ? { a: 'name', b: 'specialty' } : { a: 'name' };
    const search = params.search?.trim();
    let q = supabase.from(table).select('*', { count: 'exact' });
    if (search) {
        if (searchable.b) {
            q = q.or(`${searchable.a}.ilike.%${search}%,${searchable.b}.ilike.%${search}%`);
        }
        else {
            q = q.ilike(searchable.a, `%${search}%`);
        }
    }
    if (params.cityId)
        q = q.eq('city_id', params.cityId);
    if (params.specialty)
        q = q.eq('specialty', params.specialty);
    if (params.active !== false)
        q = q.eq('is_active', true);
    q = q.order('sort_order', { ascending: true }).order('view_count', { ascending: false });
    if (params.limit != null)
        q = q.range(params.offset ?? 0, (params.offset ?? 0) + params.limit - 1);
    const { data, error, count } = await q;
    if (error)
        throw error;
    return { data: (data ?? []), count: count ?? 0 };
}
/** الأطباء المميّزون (اختيارهم من لوحة التحكم) */
export async function fetchFeaturedDoctors(limit = 8) {
    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .limit(limit);
    if (error)
        return [];
    return (data ?? []);
}
/** الصيدليات المميّزة (اختيارها من لوحة التحكم) */
export async function fetchFeaturedPharmacies(limit = 8) {
    const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .limit(limit);
    if (error)
        return [];
    return (data ?? []);
}
export async function fetchEntity(type, slugOrId) {
    const table = ENTITY_TABLES[type];
    // المصطلح قد يكون slug نصياً أو id UUID — جرّب slug أولاً ثم id
    // تحصين ضد تشوه الترميز عبر تطبيقات المراسلة: تطبيع يونيكود + فك ترميز مزدوج
    let term = (slugOrId ?? '').trim();
    try {
        term = term.normalize('NFC');
    }
    catch { /* تجاهل */ }
    let { data, error } = await supabase.from(table).select('*').eq('slug', term).maybeSingle();
    if (error)
        return null;
    if (data)
        return data;
    try {
        const alt = decodeURIComponent(term).normalize('NFC');
        if (alt !== term) {
            const { data: altData } = await supabase.from(table).select('*').eq('slug', alt).maybeSingle();
            if (altData)
                return altData;
        }
    }
    catch { /* تجاهل */ }
    const { data: byId, error: idError } = await supabase.from(table).select('*').eq('id', slugOrId).maybeSingle();
    if (idError)
        return null;
    return byId ?? null;
}
/** تفويض: كل الكيانات بمعيار المدينة والفعالية */
export async function fetchAllMarkers(cityId) {
    const markers = {};
    for (const type of Object.keys(ENTITY_TABLES)) {
        const table = ENTITY_TABLES[type];
        let q = supabase
            .from(table)
            .select('id, name, specialty, phone, address, lat, lng, image, slug')
            .eq('is_active', true);
        if (cityId)
            q = q.eq('city_id', cityId);
        const { data, error } = await q;
        if (!error && data) {
            markers[type] = data.filter((m) => m.lat && m.lng);
        }
    }
    return markers;
}
export async function fetchDutyPharmacies(cityId) {
    const today = todaySQL();
    let q = supabase
        .from('duty_pharmacies')
        .select('*, pharmacies(*)')
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today)
        .order('end_date', { ascending: true });
    if (cityId)
        q = q.eq('city_id', cityId);
    const { data, error } = await q;
    if (error)
        return [];
    return (data ?? []).map((d) => ({
        ...d,
        pharmacy: (d.pharmacies ?? null),
    }));
}
export async function isTableEmpty(table) {
    const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true });
    if (error)
        return true;
    return (count ?? 0) === 0;
}
