import { supabase } from '@/lib/supabase'
import type { EntityType, Pharmacy, DutyPharmacy, Doctor } from '@/types'
import { todaySQL } from '@/lib/utils'

export type EntityTable = Record<EntityType, string>

export const ENTITY_TABLES: EntityTable = {
  doctor: 'doctors',
  clinic: 'clinics',
  hospital: 'hospitals',
  health_center: 'health_centers',
  pharmacy: 'pharmacies',
  lab: 'labs',
  radiology: 'radiology_centers',
}

export interface ListParams {
  search?: string
  cityId?: string | null
  specialty?: string | null
  active?: boolean
  limit?: number
  offset?: number
}

export interface ListResult<T> {
  data: T[]
  count: number
}

export async function fetchEntities<T>(
  type: EntityType,
  params: ListParams = {},
): Promise<ListResult<T>> {
  const table = ENTITY_TABLES[type]
  const searchable = type === 'doctor' ? { a: 'name', b: 'specialty' } : { a: 'name' }
  const search = params.search?.trim()

  let q = supabase.from(table).select('*', { count: 'exact' })

  if (search) {
    if (searchable.b) {
      q = q.or(`${searchable.a}.ilike.%${search}%,${searchable.b}.ilike.%${search}%`)
    } else {
      q = q.ilike(searchable.a, `%${search}%`)
    }
  }
  if (params.cityId) q = q.eq('city_id', params.cityId)
  if (params.specialty) q = q.eq('specialty', params.specialty)
  if (params.active !== false) q = q.eq('is_active', true)

  q = q.order('sort_order', { ascending: true }).order('view_count', { ascending: false })

  if (params.limit != null) q = q.range(params.offset ?? 0, (params.offset ?? 0) + params.limit - 1)

  const { data, error, count } = await q
  if (error) throw error
  return { data: (data ?? []) as T[], count: count ?? 0 }
}

/** الأطباء المميّزون (اختيارهم من لوحة التحكم) */
export async function fetchFeaturedDoctors(limit = 8): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order', { ascending: true })
    .limit(limit)
  if (error) return []
  return (data ?? []) as Doctor[]
}

export async function fetchEntity<T>(type: EntityType, slugOrId: string): Promise<T | null> {
  const table = ENTITY_TABLES[type]
  // المصطلح قد يكون slug نصياً أو id UUID — جرّب slug أولاً ثم id
  let { data, error } = await supabase.from(table).select('*').eq('slug', slugOrId).maybeSingle()
  if (error) return null
  if (data) return data as T
  const { data: byId, error: idError } = await supabase.from(table).select('*').eq('id', slugOrId).maybeSingle()
  if (idError) return null
  return (byId as T) ?? null
}

/** تفويض: كل الكيانات بمعيار المدينة والفعالية */
export async function fetchAllMarkers(cityId?: string | null): Promise<MarkersByType> {
  const markers: MarkersByType = {}
  for (const type of Object.keys(ENTITY_TABLES) as EntityType[]) {
    const table = ENTITY_TABLES[type]
    let q = supabase
      .from(table)
      .select('id, name, specialty, phone, address, lat, lng, image, slug')
      .eq('is_active', true)
    if (cityId) q = q.eq('city_id', cityId)
    const { data, error } = await q
    if (!error && data) {
      markers[type] = (data as Array<Record<string, unknown>>).filter((m) => m.lat && m.lng)
    }
  }
  return markers
}

export interface MarkersByType {
  doctor?: Array<Record<string, unknown>>
  clinic?: Array<Record<string, unknown>>
  hospital?: Array<Record<string, unknown>>
  health_center?: Array<Record<string, unknown>>
  pharmacy?: Array<Record<string, unknown>>
  lab?: Array<Record<string, unknown>>
  radiology?: Array<Record<string, unknown>>
}

export async function fetchDutyPharmacies(cityId?: string | null): Promise<DutyPharmacy[]> {
  const today = todaySQL()
  let q = supabase
    .from('duty_pharmacies')
    .select('*, pharmacies(*)')
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today)
    .order('end_date', { ascending: true })
  if (cityId) q = q.eq('city_id', cityId)
  const { data, error } = await q
  if (error) return []
  return (data ?? []).map((d) => ({
    ...d,
    pharmacy: (d.pharmacies ?? null) as Pharmacy | null,
  })) as DutyPharmacy[]
}

export async function isTableEmpty(table: string): Promise<boolean> {
  const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true })
  if (error) return true
  return (count ?? 0) === 0
}