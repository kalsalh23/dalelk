// جسر دخول: حجز أنشأه الطبيب مباشرة من نظام العيادة (بدون المرور بالمنصة)
// يُسجَّل في المنصة ليكتشف النظام أن هذا المريض «لديه حجز سابق» عند محاولته الحجز مرة أخرى
import { SUPABASE_URL, SUPABASE_ANON, json } from './_push.js'

const BRIDGE_SECRET = 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5'
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export default async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' })
  const key = req.headers['x-bridge-secret'] || ''
  if (key !== BRIDGE_SECRET) return json(res, 401, { error: 'unauthorized' })

  const {
    doctor_id, doctor_name, patient_name, patient_phone,
    requested_date, time, note, preferred_day,
  } = req.body || {}

  if (!doctor_id || !patient_name || !patient_phone || !requested_date) {
    return json(res, 400, { error: 'missing fields' })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(requested_date)) {
    return json(res, 400, { error: 'invalid date format' })
  }

  const day = preferred_day || DAY_KEYS[new Date(requested_date + 'T00:00:00').getDay()]

  // تسجيل الحجز في المنصة كمؤكد (مصدره العيادة) — RPC آمن + حماية من التكرار
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/book_record_clinic`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      p_secret: BRIDGE_SECRET,
      p_doctor_id: doctor_id,
      p_doctor_name: doctor_name ?? null,
      p_patient_name: patient_name,
      p_patient_phone: patient_phone,
      p_preferred_day: day,
      p_preferred_time: time ?? null,
      p_requested_date: requested_date,
      p_note: note ?? null,
    }),
  }).catch(() => null)

  const body = r ? await r.json().catch(() => null) : null
  const id = typeof body === 'string' ? body : null
  if (!id) {
    // null = الحجز مسجَّل مسبقاً لهذا المريض (حماية التكرار) — لا خطأ
    return json(res, 200, { ok: true, duplicate: true })
  }
  return json(res, 200, { ok: true, id })
}
