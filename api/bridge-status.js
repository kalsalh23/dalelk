// جسر العيادة ← المنصة: كل communications القادمة من نظام إدارة العيادة تمر من هنا
//   POST ?route=slot-lock  : حجز أنشأه الطبيب/الاستقبال داخل العيادة → يُسجَّل في المنصة
//   POST ?route=hours      : مزامنة أوقات دوام العيادة إلى صفحة الطبيب في المنصة
//   POST (بلا route)       : قبول/رفض/إلغاء موعد → يحدّث طلب المنصة ويُبلّغ المريض
//   GET  ?route=request-status : قراءة حالة الطلب كما تراها العيادة
import { SUPABASE_URL, SUPABASE_ANON, sendToSubscription, json } from './_push.js'
import { platformRpc, clinicRpc, BRIDGE_SECRET } from './_rpc.js'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

/* ------------------------------------------------------------------ */
/* قراءة حالة الطلب من نظام العيادة                                    */
/* ------------------------------------------------------------------ */
async function requestStatus(req, res) {
  const platformRef = (req.query && req.query.platform_ref) || ''
  if (!platformRef) return json(res, 400, { error: 'platform_ref required' })
  const r = await clinicRpc('bridge_request_status', { p_platform_ref: platformRef })
  const d = r?.data
  if (!r?.ok || !d || d.error) {
    const missing = d?.error === 'not_found'
    return json(res, 200, { ok: false, status: missing ? 'not_found' : 'pending', error: d?.error || 'lookup_failed' })
  }
  return json(res, 200, {
    ok: true,
    status: d.status,
    platform_ref: d.platform_ref,
    patient_name: d.patient_name,
    appointment: d.appointment ?? null,
  })
}

/* ------------------------------------------------------------------ */
/* حجز أنشأه الطبيب مباشرة من العيادة → تسجيله في المنصة               */
/* ------------------------------------------------------------------ */
async function slotLock(req, res) {
  const { appointment_id } = req.body || {}
  if (!appointment_id) return json(res, 400, { error: 'appointment_id required' })

  // 1) تفاصيل الموعد من نظام العيادة
  const det = await clinicRpc('bridge_appointment_details', { p_appointment_id: appointment_id })
  const d = det?.data
  if (!det?.ok || !d || d.error || !d.ok) {
    return json(res, 200, { ok: false, error: d?.error || 'lookup_failed' })
  }

  // 2) طبيب المنصة المرتبط بهذه العيادة
  const mapRes = await fetch(
    `${SUPABASE_URL}/rest/v1/bridge_doctor_map?select=platform_doctor_id&clinic_id=eq.${d.clinic_id}&enabled=eq.true&limit=10`,
    { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
  ).catch(() => null)
  const mapRows = mapRes ? await mapRes.json().catch(() => []) : []
  const platformDoctorId = Array.isArray(mapRows) ? mapRows[0]?.platform_doctor_id : null
  if (!platformDoctorId) return json(res, 200, { ok: false, error: 'doctor_unmapped' })

  const docRes = await fetch(
    `${SUPABASE_URL}/rest/v1/doctors?select=id,name&id=eq.${platformDoctorId}&limit=1`,
    { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
  ).catch(() => null)
  const docRows = docRes ? await docRes.json().catch(() => []) : []
  const doctorName = (Array.isArray(docRows) ? docRows[0]?.name : null) || d.doctor_name || null

  // 3) تسجيل الحجز في المنصة (confirmed) — مع حماية التكرار
  const date = d.appointment_date
  const dObj = new Date(`${date}T00:00:00`)
  const rec = await platformRpc('book_record_clinic', {
    p_doctor_id: platformDoctorId,
    p_doctor_name: doctorName,
    p_patient_name: d.patient_name || 'مريض',
    p_patient_phone: d.patient_phone || '',
    p_preferred_day: DAY_KEYS[dObj.getDay()],
    p_preferred_time: d.start_time ? String(d.start_time).slice(0, 5) : null,
    p_requested_date: date,
    p_note: null,
  })
  const id = typeof rec?.data === 'string' ? rec.data : null
  return json(res, 200, { ok: true, platform_ref: id, duplicate: !id })
}

/* ------------------------------------------------------------------ */
/* مزامنة أوقات دوام العيادة إلى المنصة                                */
/* ------------------------------------------------------------------ */
async function hoursSync(req, res) {
  const { clinic_id, work_hours } = req.body || {}
  if (!clinic_id || !work_hours || typeof work_hours !== 'object') {
    return json(res, 400, { error: 'clinic_id and work_hours required' })
  }

  const mapRes = await fetch(
    `${SUPABASE_URL}/rest/v1/bridge_doctor_map?select=platform_doctor_id&clinic_id=eq.${clinic_id}&enabled=eq.true&limit=20`,
    { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
  ).catch(() => null)
  const mapRows = mapRes ? await mapRes.json().catch(() => []) : []
  const doctorIds = (Array.isArray(mapRows) ? mapRows : []).map((r) => r?.platform_doctor_id).filter(Boolean)
  if (!doctorIds.length) return json(res, 200, { ok: true, updated: 0, reason: 'doctor_unmapped' })

  // تنظيف القيم قبل الحفظ (نفس صيغة المنصة: "من - إلى" أو "مغلق")
  const cleaned = {}
  for (const [day, value] of Object.entries(work_hours)) {
    const v = String(value ?? '').trim()
    if (v) cleaned[day] = v
  }
  if (!Object.keys(cleaned).length) return json(res, 200, { ok: true, updated: 0, reason: 'empty' })

  let updated = 0
  for (const id of doctorIds) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/doctors?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json', Prefer: 'return=minimal',
      },
      body: JSON.stringify({ work_hours: cleaned }),
    }).catch(() => null)
    if (r?.ok) updated++
  }
  return json(res, 200, { ok: true, updated })
}

/* ------------------------------------------------------------------ */
/* قبول/رفض/إلغاء موعد → تحديث طلب المنصة + إشعار المريض              */
/* ------------------------------------------------------------------ */
async function updateStatus(req, res) {
  const { platform_ref, status } = req.body || {}
  if (!platform_ref || !status) return json(res, 400, { error: 'missing platform_ref or status' })

  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/bridge_update_status`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_secret: BRIDGE_SECRET, p_platform_ref: platform_ref, p_status: status }),
  })
  const result = await r.json()
  if (!r.ok || result.error) return json(res, 400, { ok: false, error: result.error || 'update failed' })
  if (result.ignored) return json(res, 200, { ok: true, ignored: status })

  // مزامنة الحالة داخل نظام العيادة أيضاً (حتى تصل الحالة نفسها إلى استقصاء الواجهة)
  await clinicRpc('bridge_set_request_status', { p_platform_ref: platform_ref, p_status: status })

  // إشعار المريض — الرسالة بحسب الحالة السابقة والجديدة
  const subRes = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?appointment_id=eq.${platform_ref}&select=endpoint,p256dh,auth`, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
  })
  const subs = await subRes.json()
  let sent = 0
  let title = ''
  let body = ''
  if (result.status === 'confirmed') {
    title = 'تم تأكيد موعدك ✓'
    body = `تم تأكيد موعدك${result.patient_name ? ' يا ' + result.patient_name : ''} — سيتم التواصل معك لتثبيت التفاصيل.`
  } else if (result.status === 'rejected' && result.prev === 'confirmed') {
    title = 'إلغاء موعد'
    body = 'تم إلغاء موعدك — يرجى التواصل مع العيادة لإعادة الجدولة.'
  } else {
    title = 'بخصوص طلب موعدك'
    body = 'لم يتم تأكيد طلب الموعد حالياً — يمكنك المحاولة لاحقاً أو التواصل مع العيادة.'
  }
  for (const s of Array.isArray(subs) ? subs : []) {
    const rr = await sendToSubscription(
      { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
      { title, body, url: '/duty-pharmacies' },
    )
    if (rr.ok) sent++
  }
  return json(res, 200, { ok: true, status: result.status, notified: sent })
}

/* ------------------------------------------------------------------ */

export default async (req, res) => {
  const route = (req.query && req.query.route) || ''

  // قراءة الحالة: GET ?route=request-status&secret=…&platform_ref=…
  if (req.method === 'GET') {
    const secret = (req.query && req.query.secret) || req.headers['x-bridge-secret'] || ''
    if (secret !== BRIDGE_SECRET) return json(res, 401, { error: 'unauthorized' })
    return requestStatus(req, res)
  }

  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' })
  const key = req.headers['x-bridge-secret'] || ''
  if (key !== BRIDGE_SECRET) return json(res, 401, { error: 'unauthorized' })

  if (route === 'slot-lock') return slotLock(req, res)
  if (route === 'hours') return hoursSync(req, res)
  return updateStatus(req, res)
}
