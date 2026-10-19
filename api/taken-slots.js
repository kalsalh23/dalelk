// الأوقات المحجوزة لطبيب في تاريخ محدد — المصدران: طلبات معلقة على المنصة + مواعيد مؤكدة بنظام العيادة
import { SUPABASE_URL, SUPABASE_ANON, json } from './_push.js'
import { platformRpc, clinicRpc } from './_rpc.js'

export default async (req, res) => {
  const doctorId = (req.query && req.query.doctor_id) || ''
  const date = (req.query && req.query.date) || ''
  if (!doctorId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json(res, 400, { error: 'doctor_id and date (YYYY-MM-DD) required' })
  }

  const taken = new Set()
  const add = (t) => {
    const m = String(t || '').match(/(\d{1,2}:\d{2})/)
    if (m) taken.add(`${m[1].split(':')[0].padStart(2, '0')}:${m[1].split(':')[1]}`)
  }

  // 1) طلبات معلقة (new/confirmed) لنفس الطبيب والتاريخ — عبر RPC آمن يتجاوز RLS
  const pend = await platformRpc('taken_pending_times', { p_doctor_id: doctorId, p_date: date })
  for (const t of (Array.isArray(pend.data) ? pend.data : [])) add(t)

  // 2) مواعيد مؤكدة في نظام إدارة العيادة (عبر الجسر)
  try {
    const m = await fetch(
      `${SUPABASE_URL}/rest/v1/bridge_doctor_map?select=clinic_id&platform_doctor_id=eq.${doctorId}&enabled=eq.true&limit=1`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
    )
    const mapRows = await m.json().catch(() => [])
    const clinicId = Array.isArray(mapRows) ? mapRows[0]?.clinic_id : null
    if (clinicId) {
      const c = await clinicRpc('bridge_taken_times', { p_clinic_id: clinicId, p_date: date })
      for (const t of (Array.isArray(c.data) ? c.data : [])) add(t)
    }
  } catch { /* النظام الآخر متوقف — الاستقبال حاجز أخير */ }

  res.setHeader('Cache-Control', 'no-store')
  return json(res, 200, { taken: [...taken].sort() })
}
