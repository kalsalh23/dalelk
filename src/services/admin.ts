import { supabase } from '@/lib/supabase'
import type { Profile, SubscriptionRequest } from '@/types'
import { ENTITY_TABLES } from '@/services/content'
import type { EntityType } from '@/types'

export const BUCKET = 'medical'

const BUCKET_FOLDERS: Record<EntityType, string> = {
  doctor: 'doctors',
  clinic: 'clinics',
  hospital: 'hospitals',
  health_center: 'health_centers',
  pharmacy: 'pharmacies',
  lab: 'labs',
  radiology: 'radiology',
}

export const ADMIN_TABLE_LAYOUT: Record<string, { label: string; type: string }> = {
  doctors: { label: 'الأطباء', type: 'doctor' },
  clinics: { label: 'العيادات', type: 'clinic' },
  hospitals: { label: 'المشافي', type: 'hospital' },
  health_centers: { label: 'المراكز الصحية', type: 'health_center' },
  pharmacies: { label: 'الصيدليات', type: 'pharmacy' },
  labs: { label: 'المخابر', type: 'lab' },
  radiology_centers: { label: 'مراكز الأشعة', type: 'radiology' },
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (error) return null
  return data as Profile
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  await supabase.auth.signOut()
}

/** ضغط الصور وتحسينها قبل الرفع */
export async function compressImage(file: File, maxSize = 1200, quality = 0.82): Promise<File> {
  const img = await createImageBitmap(file)
  const w = Math.min(img.width, maxSize)
  const h = Math.round((img.height * w) / img.width)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  return await new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('تعذر ضغط الصورة'))
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
      },
      'image/jpeg',
      quality,
    )
  })
}

export async function uploadImage(entity: EntityType, file: File): Promise<string | null> {
  return uploadToFolder(BUCKET_FOLDERS[entity], file)
}

/** رفع صورة داخل مجلد مخصّص (مثل ads / articles) مع ضغط مسبق */
export async function uploadToFolder(folder: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const name = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  const path = `${folder}/${name}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (error) throw error
  return path
}

export async function deleteImage(path: string | null | undefined): Promise<void> {
  if (!path || path.startsWith('http') || path.startsWith('/')) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.warn('فشل حذف الصورة', error)
}

export async function createEntity(type: EntityType, values: Record<string, unknown>) {
  const table = ENTITY_TABLES[type]
  const { data, error } = await supabase.from(table).insert(values).select().single()
  return { data, error }
}

export async function updateEntity(type: EntityType, id: string, values: Record<string, unknown>) {
  const table = ENTITY_TABLES[type]
  const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single()
  return { data, error }
}

export async function deleteEntity(type: EntityType, id: string): Promise<boolean> {
  const table = ENTITY_TABLES[type]
  const { error } = await supabase.from(table).delete().eq('id', id)
  return !error
}

export async function fetchSubscriptionRequests(): Promise<SubscriptionRequest[]> {
  const { data, error } = await supabase
    .from('subscription_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as SubscriptionRequest[]
}

export interface UpdateRequestResult {
  ok: boolean
  email?: string
  password?: string
  slug?: string
  name?: string
  linkToken?: string
  accountError?: string
}

/** إنشاء/تجديد حساب جهة (كلمة سر ورابط سحري جديدان) — يُستخدم عند الموافقة وعند إعادة إرسال البيانات */
export async function ensureEntityAccount(entityType: EntityType, entityId: string): Promise<UpdateRequestResult> {
  const table = ENTITY_TABLES[entityType]
  if (!table) return { ok: false, accountError: 'نوع جهة غير صالح' }
  const { data: ent } = await supabase.from(table).select('slug, name').eq('id', entityId).maybeSingle()
  const slug = String(ent?.slug ?? entityId).replace(/[^a-z0-9.-]/gi, '-').replace(/^-+|-+$/g, '')
  const email = `admin-${slug}@gmail.com`
  const password = genEntityPassword()
  const { data: acct, error: acctErr } = await supabase.rpc('entity_create_account', {
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_email: email,
    p_password: password,
  })
  const a = acct as Record<string, unknown> | null
  if (acctErr) return { ok: true, slug, name: (ent?.name as string) ?? '', accountError: acctErr.message }
  if (!a || a.error) return { ok: true, slug, name: (ent?.name as string) ?? '', accountError: String(a?.error ?? 'تعذر إنشاء الحساب') }
  return {
    ok: true,
    email: (a.email as string) ?? email,
    password,
    slug,
    name: (a.name as string) ?? (ent?.name as string) ?? '',
    linkToken: (a.magic_token as string) ?? undefined,
  }
}

export async function updateRequestStatus(
  id: string,
  status: SubscriptionRequest['status'],
  notes?: string,
): Promise<UpdateRequestResult> {
  const { data: req, error: fetchErr } = await supabase
    .from('subscription_requests')
    .select('*')
    .eq('id', id)
    .single()
  if (fetchErr || !req) return { ok: false }

  const updates: Record<string, unknown> = { status, notes: notes ?? req.notes }
  if (status === 'approved' && req.requested_plan) {
    updates.current_plan = req.requested_plan
  }

  const { error } = await supabase.from('subscription_requests').update(updates).eq('id', id)
  if (error) return { ok: false }

  // تطبيق الخطة المطلوبة فعلياً على جهة (الطبيب/العيادة/…) عند الموافقة — لمدة شهر واحد
  if (status === 'approved') {
    const table = ENTITY_TABLES[req.entity_type as EntityType]
    if (table) {
      const { error: entErr } = await supabase
        .from(table)
        .update({
          plan: req.requested_plan,
          plan_expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        })
        .eq('id', req.entity_id)
      if (entErr) return { ok: false }

      // إنشاء حساب الجهة تلقائياً: البريد وكلمة السر والرابط السحري تُسلَّم للإدارة لتمريرها للجهة
      const res = await ensureEntityAccount(req.entity_type as EntityType, req.entity_id)
      if (res.accountError) return { ...res, accountError: res.accountError }
      return res
    }
  }
  return { ok: true }
}

export async function createSubscriptionRequest(v: {
  entity_id: string
  entity_type: EntityType
  current_plan: string
  requested_plan: string
  phone?: string
  notes?: string
}): Promise<boolean> {
  const { error } = await supabase.from('subscription_requests').insert(v)
  return !error
}

export interface RequestStatusResult {
  found: boolean
  status?: string
  requested_plan?: string
  created_at?: string
  entity_type?: EntityType
  entity_name?: string | null
}

/** متابعة حالة طلب الترقية برقم الهاتف (دالة آمنة في قاعدة البيانات) */
export async function checkRequestStatus(phone: string): Promise<RequestStatusResult | null> {
  const { data, error } = await supabase.rpc('request_status_by_phone', { p_phone: phone.trim() })
  if (error) return null
  return (data ?? null) as RequestStatusResult | null
}

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  new: 'قيد المراجعة',
  contacting: 'تم التواصل معك',
  awaiting_payment: 'بانتظار الدفع',
  approved: 'تمت الموافقة',
  rejected: 'مرفوض',
}

/** الطلبات التي ما تزال قيد المعالجة (لمنع التكرار) */
export const PENDING_REQUEST_STATUSES = ['new', 'contacting', 'awaiting_payment']

export async function fetchSettings(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.from('app_settings').select('*').eq('key', 'site')
  if (error || !data?.length) return {}
  return (data[0].value ?? {}) as Record<string, unknown>
}

export async function saveSettings(values: Record<string, unknown>): Promise<boolean> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: 'site', value: values }, { onConflict: 'key' })
  return !error
}

export async function fetchAdminUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at')
  if (error) return []
  return (data ?? []) as Profile[]
}

/** توليد كلمة سر عشوائية قوية (خاصة بجهة واحدة ولا تُعاد) */
export function genEntityPassword(len = 16): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'
  const arr = new Uint32Array(len)
  crypto.getRandomValues(arr)
  let out = ''
  for (let i = 0; i < len; i++) out += charset[arr[i] % charset.length]
  return out
}

/** إحصاءات لوحة التحكم */
export interface AdminStats {
  entities: Record<string, number>
  articles: number
  questions: number
  unanswered: number
  requests: number
  plans: { free: number; pro: number; gold: number }
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const stats: AdminStats = {
    entities: {},
    articles: 0,
    questions: 0,
    unanswered: 0,
    requests: 0,
    plans: { free: 0, pro: 0, gold: 0 },
  }
  for (const table of Object.keys(ADMIN_TABLE_LAYOUT)) {
    const { count } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
    stats.entities[table] = count ?? 0
    const plan = await supabase.from(table).select('plan')
    if (!plan.error && plan.data) {
      for (const p of plan.data as Array<{ plan: string }>) {
        if (p.plan === 'free' || p.plan === 'pro' || p.plan === 'gold') stats.plans[p.plan]++
      }
    }
  }
  const art = await supabase.from('articles').select('id', { count: 'exact', head: true })
  stats.articles = art.count ?? 0
  const qs = await supabase.from('medical_questions').select('id', { count: 'exact', head: true })
  stats.questions = qs.count ?? 0
  const un = await supabase.from('unanswered_questions').select('id', { count: 'exact', head: true })
  stats.unanswered = un.count ?? 0
  const req = await supabase.from('subscription_requests').select('id', { count: 'exact', head: true })
  stats.requests = req.count ?? 0
  return stats
}