// جسر العيادة ← المنصة: حجز أنشأه الطبيب/الاستقبال داخل نظام إدارة العيادة
// يُسجَّل في المنصة ليعرف النظام أن هذا المريض «لديه حجز سابق» ويظهر للطبيب في لوحته
import { SUPABASE_URL, SUPABASE_ANON, json } from './_push.js'
import { platformRpc, clinicRpc, BRIDGE_SECRET } from './_rpc.js'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export default async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' })
  const key = req.headers['x-bridge-secret'] || ''
  if (key !== BRIDGE_SECRET) return json(res, 401, { error: 'unauthorized' })

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
  if (!platformDoctorId) {
    return json(res, 200, { ok: false, error: 'doctor_unmapped' })
  }
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
