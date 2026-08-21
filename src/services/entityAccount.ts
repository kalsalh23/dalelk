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

/** دخول الجهة عبر الرابط السحري (magic link) — يخص الجهة صاحبة الرابط فقط */
export async function magicLogin(token: string): Promise<EntitySession | null> {
  const { data, error } = await supabase.rpc('entity_login_magic', { p_token: token })
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

/** توليد رابط لوحة التحكم الكامل مع الرمز السحري */
export function buildMagicLink(slug: string, magicToken: string): string {
  return `${window.location.origin}/account/${slug}?tk=${encodeURIComponent(magicToken)}`
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

/** تغيير كلمة سر الجهة (يتطلب معرفة القديمة أو عبر الجلسة) */
export async function changeEntityPassword(token: string, oldPass: string, newPass: string): Promise<boolean> {
  // لا توجد RPC مخصصة، نستخدم entity_login للتحقق ثم تحديث عبر supabase مباشرة غير متاح للجهة
  // لذا نتحقق أولاً ثم نطلب من الخادم توليد hash جديد عبر rpc مستحدث إن وجد
  // كحل مؤقت: نستخدم RPC غير موجود → سنحتاج ترحيل إضافي. حالياً نعيد false مع رسالة
  // سنطبق التغيير عبر استدعاء supabase.rpc('entity_change_password', ...)
  const { data, error } = await supabase.rpc('entity_change_password' as never, {
    p_token: token,
    p_old_password: oldPass,
    p_new_password: newPass,
  } as never)
  if (!error && data === true) return true
  // fallback: تحقق من كلمة السر القديمة عبر entity_login ثم أنشئ حساباً جديداً بنفس البريد
  const sess = await fetchEntitySession(token)
  if (!sess) return false
  const login = await entityLogin(sess.email, oldPass)
  if (!login) return false
  // إعادة إنشاء الحساب بنفس البريد وكلمة سر جديدة (يتطلب is_admin؟ لا يمكن)
  // لذلك نفشل بصراحة ونطلب من المدير إعادة التعيين
  return false
}

/** رفع صورة للجهة (يتطلب entity session — يستخدم anon policy الجديد) */
export async function uploadEntityImage(
  file: File,
  folder: string,
): Promise<string | null> {
  const { compressImage, uploadToFolder } = await import('@/services/admin')
  try {
    const compressed = await compressImage(file)
    return await uploadToFolder(folder, compressed)
  } catch {
    return null
  }
}

export const ENTITY_FOLDER: Record<string, string> = {
  doctor: 'doctors',
  clinic: 'clinics',
  hospital: 'hospitals',
  health_center: 'health_centers',
  pharmacy: 'pharmacies',
  lab: 'labs',
  radiology: 'radiology_centers',
  radiology_centers: 'radiology',
}

export function folderForType(entityType: string): string {
  return ENTITY_FOLDER[entityType] ?? 'entities'
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