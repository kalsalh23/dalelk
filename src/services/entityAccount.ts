import { supabase } from '@/lib/supabase'
import type { EntityType } from '@/types'

/** مفتاح تخزين جلسة الجهة محلياً */
export const ENTITY_SESSION_KEY = 'entity_session'

export interface EntitySession {
  token: string
  slug: string
  email: string
  entity_type: EntityType
}

export interface EntityAccountInfo {
  ok: boolean
  email: string
  slug: string
  name: string
}

export interface EntitySessionData {
  id: string
  entity_type: EntityType
  entity_id: string
  slug: string
  email: string
  entity: Record<string, unknown> | null
}

function sanitizeSlug(slug: string): string {
  return slug.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, '')
}

/** توليد بريد الجهة: admin-<slug>@gmail.com */
export function buildEntityEmail(slug: string): string {
  return `admin-${sanitizeSlug(slug)}@gmail.com`
}

/** توليد كلمة سر فريدة على القاعدة dalil@2026<رقم> */
export function buildEntityPassword(): string {
  const random = Math.floor(100000 + Math.random() * 900000)
  return `dalil@2026${random}`
}

/** إنشاء حساب جهة (يستدعي RPC — يُسمح للمدير فقط) */
export async function createEntityAccount(
  entityType: EntityType,
  entityId: string,
  email: string,
  password: string,
): Promise<EntityAccountInfo | null> {
  const { data, error } = await supabase.rpc('entity_create_account', {
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_email: email,
    p_password: password,
  })
  if (error || !data?.ok) return null
  return data as EntityAccountInfo
}

/** دخول الجهة — يعيد كائن جلسة أو null عند خطأ */
export async function entityLogin(email: string, password: string): Promise<EntitySession | null> {
  const { data, error } = await supabase.rpc('entity_login', {
    p_email: email.trim(),
    p_password: password,
  })
  if (error || !data?.session_token) return null
  const sess: EntitySession = {
    token: data.session_token as string,
    slug: data.slug as string,
    email: data.email as string,
    entity_type: data.entity_type as EntityType,
  }
  localStorage.setItem(ENTITY_SESSION_KEY, JSON.stringify(sess))
  return sess
}

/** جلب بيانات الجهة للجلسة النشطة */
export async function fetchEntitySession(token: string): Promise<EntitySessionData | null> {
  const { data, error } = await supabase.rpc('entity_session', { p_token: token })
  if (error || !data?.entity_id) return null
  return {
    id: data.id,
    entity_type: data.entity_type as EntityType,
    entity_id: data.entity_id as string,
    slug: data.slug as string,
    email: data.email as string,
    entity: (data.entity ?? null) as Record<string, unknown> | null,
  }
}

/** تحديث بيانات الجهة من لوحتها */
export async function updateEntityOwn(token: string, fields: Record<string, unknown>): Promise<boolean> {
  const { data, error } = await supabase.rpc('entity_update_own', {
    p_token: token,
    p_fields: fields,
  })
  return !error && data === true
}

export function readStoredSession(): EntitySession | null {
  try {
    const raw = localStorage.getItem(ENTITY_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as EntitySession
  } catch {
    return null
  }
}

export function clearStoredSession(): void {
  localStorage.removeItem(ENTITY_SESSION_KEY)
}

/** الملف الشخصي للجهة من البيانات الخام */
export function entityDisplayName(entity: Record<string, unknown> | null): string {
  return String(entity?.name ?? '')
}

export function entityDisplayType(type: EntityType): string {
  const labels: Record<EntityType, string> = {
    doctor: 'طبيب',
    clinic: 'عيادة',
    hospital: 'مشفى',
    health_center: 'مركز صحي',
    pharmacy: 'صيدلية',
    lab: 'مخبر',
    radiology: 'مركز أشعة',
  }
  return labels[type] ?? type
}