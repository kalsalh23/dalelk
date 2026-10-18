// الأوقات المحجوزة لطبيب في تاريخ محدد — المصدران: طلبات معلقة على المنصة + مواعيد مؤكدة بنظام العيادة
import { SUPABASE_URL, SUPABASE_ANON, json } from './_push.js'

const BRIDGE_SECRET = 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5'
const DASH_BRIDGE = 'https://dashbord-doctor.vercel.app/api/bridge-taken-slots'

function extractTime(text) {
  const m = (text || '').match(/(\d{1,2}:\d{2})/)
  if (!m) return null
  const [h, min] = m[1].split(':')
  return `${h.padStart(2, '0')}:${min}`
}

export default async (req, res) => {
  const doctorId = (req.query && req.query.doctor_id) || ''
  const date = (req.query && req.query.date) || ''
  if (!doctorId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json(res, 400, { error: 'doctor_id and date (YYYY-MM-DD) required' })
  }

  const taken = new Set()

  try {
    // 1) طلبات معلقة (new) لنفس الطبيب والتاريخ — عبر RPC آمن يتجاوز RLS
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/taken_pending_times`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_secret: BRIDGE_SECRET, p_doctor_id: doctorId, p_date: date }),
    })
    const pend = await r.json()
    for (const t of Array.isArray(pend) ? pend : []) {
      if (t) taken.add(extractTime(t) || t)
    }
  } catch { /* تجاهل — الاستقبال حاجز أخير */ }

  try {
    // 2) مواعيد مؤكدة في نظام إدارة العيادة (عبر جسر آمن)
    const m = await fetch(
      `${SUPABASE_URL}/rest/v1/bridge_doctor_map?select=clinic_id&platform_doctor_id=eq.${doctorId}&enabled=eq.true&limit=1`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
    )
    const mapRows = await m.json()
    const clinicId = Array.isArray(mapRows) && mapRows[0]?.clinic_id
    if (clinicId) {
      const c = await fetch(`${DASH_BRIDGE}?secret=${BRIDGE_SECRET}&clinic_id=${clinicId}&date=${date}`)
      const cd = await c.json()
      for (const t of Array.isArray(cd?.times) ? cd.times : []) taken.add(t)
    }
  } catch { /* النظام الآخر متوقف — الاستقبال حاجز أخير */ }

  res.setHeader('Cache-Control', 'no-store')
  return json(res, 200, { taken: [...taken].sort() })
}
