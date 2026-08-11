import { supabase } from '@/lib/supabase'
import type { EntityType } from '@/types'

export type TrackEvent =
  | 'page_view'
  | 'search'
  | 'phone_click'
  | 'whatsapp_click'
  | 'map_click'
  | 'profile_view'

export async function track(event: TrackEvent, opts?: {
  entityType?: EntityType
  entityId?: string
  path?: string
}): Promise<void> {
  try {
    await supabase.from('statistics').insert({
      event_type: event,
      entity_type: opts?.entityType ?? null,
      entity_id: opts?.entityId ?? null,
      path: opts?.path ?? null,
    })
  } catch {
    // التجاهل الصامت للفشل الإحصائي
  }
}

/** تسجيل زيارة صفحة مختلفة بتخزين محلي لتجنب التكرار */
export function markViewed(key: string): boolean {
  try {
    const k = `dlm_viewed_${key}`
    if (sessionStorage.getItem(k)) return false
    sessionStorage.setItem(k, '1')
    return true
  } catch {
    return true
  }
}

export async function trackPageView(path: string): Promise<void> {
  const key = path.replace(/\//g, '_')
  if (markViewed(key)) await track('page_view', { path })
}

export async function trackProfileView(entityType: EntityType, entityId: string): Promise<void> {
  if (markViewed(`${entityType}_${entityId}`)) await track('profile_view', { entityType, entityId })
}

export async function incrementViewCount(table: string, id: string): Promise<void> {
  await supabase.rpc('increment_view_count', { table_name: table, row_id: id })
}

export async function fetchStatsSummary(): Promise<{
  pageViews: number
  searches: number
  phoneClicks: number
  whatsappClicks: number
  mapClicks: number
  profileViews: number
  topPages: Array<{ path: string; count: number }>
}> {
  const { data: views, error } = await supabase
    .from('statistics')
    .select('event_type, path, entity_id, entity_type')
  if (error) return { pageViews: 0, searches: 0, phoneClicks: 0, whatsappClicks: 0, mapClicks: 0, profileViews: 0, topPages: [] }

  const events = views ?? []
  const countEvent = (t: string) => events.filter((e) => e.event_type === t).length
  const pathCount = new Map<string, number>()
  for (const e of events) {
    if (e.path) pathCount.set(e.path, (pathCount.get(e.path) ?? 0) + 1)
  }
  const topPages = [...pathCount.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return {
    pageViews: countEvent('page_view'),
    searches: countEvent('search'),
    phoneClicks: countEvent('phone_click'),
    whatsappClicks: countEvent('whatsapp_click'),
    mapClicks: countEvent('map_click'),
    profileViews: countEvent('profile_view'),
    topPages,
  }
}