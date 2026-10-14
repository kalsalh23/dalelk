// الحجز الفوري: المواطن يحجز وقتاً متاحاً فيصبح موعداً مؤكداً في نظام العيادة فوراً
// تحقق مزدوج من التوفر (طلبات معلقة + مواعيد العيادة) ثم إنشاء ذري بمؤشر الفريدة
import { SUPABASE_URL, SUPABASE_ANON, json } from './_push.js'

const BRIDGE_SECRET = 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5'
const DASH_CONFIRM = 'https://dashbord-doctor.vercel.app/api/bridge-confirm-appointment'
const DASH_TAKEN = 'https://dashbord-doctor.vercel.app/api/bridge-taken-slots'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function extractTime(text) {
  const m = (text || '').match(/(\d{1,2}:\d{2})/)
  return m ? m[1] : null
}

function padTime(t) {
  const [h, m] = t.split(':')
  return `${h.padStart(2, '0')}:${m}`
}

export default async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' })
  const { doctor_id, date, time, name, phone, note } = req.body || {}
  if (!doctor_id || !date || !time || !name || !phone) {
    return json(res, 400, { error: 'missing fields' })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{1,2}:\d{2}$/.test(time)) {
    return json(res, 400, { error: 'invalid date/time format' })
  }

  // 1) بيانات الطبيب + الربط
  const dRes = await fetch(`${SUPABASE_URL}/rest/v1/doctors?select=id,name&id=eq.${doctor_id}&limit=1`, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
  }).catch(() => null)
  const docRows = dRes ? await dRes.json().catch(() => []) : []
  const doctor = Array.isArray(docRows) ? docRows[0] : null
  if (!doctor) return json(res, 404, { error: 'unmapped', message: 'الطبيب غير موجود' })

  const mMap = await fetch(
    `${SUPABASE_URL}/rest/v1/bridge_doctor_map?select=clinic_id&platform_doctor_id=eq.${doctor_id}&enabled=eq.true&limit=1`,
    { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
  ).catch(() => null)
  const mapRows = mMap ? await mMap.json().catch(() => []) : []
  const clinicId = Array.isArray(mapRows) && mapRows[0]?.clinic_id

  // 2) تحقق التوفر: طلبات معلقة + مواعيد العيادة
  const taken = new Set()
  try {
    const p = await fetch(`${SUPABASE_URL}/rest/v1/rpc/taken_pending_times`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_secret: BRIDGE_SECRET, p_doctor_id: doctor_id, p_date: date }),
    })
    for (const t of (await p.json()) || []) if (t) taken.add(padTime(extractTime(t) || t))
  } catch { /* الاستقبال حاجز أخير */ }
  if (clinicId) {
    try {
      const c = await fetch(`${DASH_TAKEN}?secret=${BRIDGE_SECRET}&clinic_id=${clinicId}&date=${date}`)
      const cd = await c.json()
      for (const t of (Array.isArray(cd?.times) ? cd.times : [])) taken.add(t)
    } catch { /* كالسابق */ }
  }
  if (taken.has(padTime(time))) {
    return json(res, 409, { error: 'taken', message: 'عذراً، هذا الوقت حُجز للتو — اختر وقتاً آخر' })
  }

  const dObj = new Date(date + 'T00:00:00')
  const dateLabel = dObj.toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeWithDate = `${time} — ${dObj.toLocaleDateString('ar', { day: 'numeric', month: 'long' })}`

  // 3) سجل الحجز في المنصة أولاً (معرف الربط بين النظامين) — عبر RPC آمن
  let requestId = null
  try {
    const rec = await fetch(`${SUPABASE_URL}/rest/v1/rpc/book_record`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_doctor_id: doctor_id, p_doctor_name: doctor.name, p_patient_name: name, p_patient_phone: phone,
        p_preferred_day: DAY_KEYS[dObj.getDay()], p_preferred_time: timeWithDate,
        p_requested_date: date, p_note: note || null,
      }),
    })
    const rid = await rec.json()
    requestId = typeof rid === 'string' ? rid : null
  } catch { /* يُعاد المحاولة أدناه عند الحاجة */ }

  // 4) طبيب غير مربوط (احتياط): يبقى طلب مراجعة على المنصة
  if (!clinicId) {
    return json(res, 200, {
      ok: true, mode: 'request', request_id: requestId,
      doctor_name: doctor.name, date, time, date_label: dateLabel,
    })
  }

  // 5) الحجز الفوري في نظام العيادة (إنشاء ذري بمؤشر الفريدة)
  const cRes = await fetch(DASH_CONFIRM, {
    method: 'POST',
    headers: { 'x-bridge-secret': BRIDGE_SECRET, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform_ref: requestId,
      clinic_id: clinicId,
      doctor_name: doctor.name,
      patient_name: name,
      patient_phone: phone,
      requested_date: date,
      time,
      note: note || null,
      source: 'dalil-altaybeh',
    }),
  })
  const cData = await cRes.json().catch(() => ({}))
  if (!cRes.ok || cData.error) {
    // تعارض الوقت: حذف سجل المنصة الاحتياطي ثم إبلاغ المواطن
    if (requestId) {
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/book_record_delete`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_secret: BRIDGE_SECRET, p_id: requestId }),
      }).catch(() => {})
    }
    if (cData.error === 'taken') {
      return json(res, 409, { error: 'taken', message: 'عذراً، هذا الوقت حُجز للتو — اختر وقتاً آخر' })
    }
    return json(res, 502, { ok: false, error: cData.error || 'clinic booking failed' })
  }

  return json(res, 200, {
    ok: true, mode: 'instant', request_id: requestId,
    doctor_name: doctor.name, date, time, date_label: dateLabel,
  })
}
