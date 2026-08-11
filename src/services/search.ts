import { supabase } from '@/lib/supabase'
import { ENTITY_TABLES } from '@/services/content'
import type { EntityType } from '@/types'

export interface SearchResult {
  type: string
  label: string
  items: Array<Record<string, unknown>>
}

const TABLES: { table: string; label: string; type: string }[] = [
  { table: 'doctors', label: 'أطباء', type: 'doctor' },
  { table: 'clinics', label: 'عيادات', type: 'clinic' },
  { table: 'hospitals', label: 'مشافي', type: 'hospital' },
  { table: 'pharmacies', label: 'صيدليات', type: 'pharmacy' },
  { table: 'labs', label: 'مخابر', type: 'lab' },
  { table: 'radiology_centers', label: 'مراكز الأشعة', type: 'radiology' },
  { table: 'health_centers', label: 'مراكز صحية', type: 'health_center' },
]

export async function globalSearch(query: string, cityId?: string | null): Promise<SearchResult[]> {
  const term = query.trim()
  if (!term) return []
  const groups: SearchResult[] = []

  async function searchTable(table: string, label: string, type: string, extra = '') {
    let q = supabase
      .from(table)
      .select('id, name, slug, image, specialty, phone, address, is_verified, plan', { count: 'exact' })
      .eq('is_active', true)
      .or(`name.ilike.%${term}%${extra ? `,${extra}.ilike.%${term}%` : ''}`)
      .limit(5)
    if (cityId) q = q.eq('city_id', cityId)
    const { data, error } = await q
    if (!error && data && data.length) {
      groups.push({ type: type as EntityType, label, items: data })
    }
  }

  await Promise.all([
    ...TABLES.map((t) => searchTable(t.table, t.label, t.type, t.type === 'doctor' ? 'specialty' : '')),
  ])

  // المقالات
  const art = await supabase
    .from('articles')
    .select('id, title, slug, image, excerpt')
    .eq('is_published', true)
    .or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`)
    .limit(5)
  if (!art.error && art.data?.length) {
    groups.push({ type: 'article', label: 'مقالات', items: art.data })
  }

  // الأسئلة الطبية
  const qs = await supabase
    .from('medical_questions')
    .select('id, question, answer')
    .eq('is_active', true)
    .or(`question.ilike.%${term}%,answer.ilike.%${term}%`)
    .limit(5)
  if (!qs.error && qs.data?.length) {
    groups.push({ type: 'question', label: 'أسئلة وأجوبة', items: qs.data })
  }

  return groups
}

export const searchEntityRoute = (type: EntityType): string => {
  return ENTITY_TABLES[type].replace('_', '-') === 'health-centers'
    ? '/health-centers'
    : `/${ENTITY_TABLES[type].replace('radiology_centers', 'radiology').replace('health_centers', 'health-centers')}`
}