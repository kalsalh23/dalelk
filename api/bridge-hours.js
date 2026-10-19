// جسر العيادة ← المنصة: مزامنة أوقات دوام العيادة إلى صفحة الطبيب في المنصة
// تستدعيه قاعدة البيانات عند تعديل جدول المواعيد أو إعدادات الفترات في نظام العيادة
import { SUPABASE_URL, SUPABASE_ANON, json } from './_push.js'
import { BRIDGE_SECRET } from './_rpc.js'

export default async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' })
  const key = req.headers['x-bridge-secret'] || ''
  if (key !== BRIDGE_SECRET) return json(res, 401, { error: 'unauthorized' })

  const { clinic_id, work_hours } = req.body || {}
  if (!clinic_id || !work_hours || typeof work_hours !== 'object') {
    return json(res, 400, { error: 'clinic_id and work_hours required' })
  }

  // الأطباء المرتبطون بهذه العيادة في المنصة
  const mapRes = await fetch(
    `${SUPABASE_URL}/rest/v1/bridge_doctor_map?select=platform_doctor_id&clinic_id=eq.${clinic_id}&enabled=eq.true&limit=20`,
    { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
  ).catch(() => null)
  const mapRows = mapRes ? await mapRes.json().catch(() => []) : []
  const doctorIds = (Array.isArray(mapRows) ? mapRows : []).map((r) => r?.platform_doctor_id).filter(Boolean)
  if (!doctorIds.length) {
    return json(res, 200, { ok: true, updated: 0, reason: 'doctor_unmapped' })
  }

  // تنظيف القيم قبل الحفظ (نفس صيغة المنصة: "من - إلى" أو "مغلق")
  const cleaned = {}
  for (const [day, value] of Object.entries(work_hours)) {
    const v = String(value ?? '').trim()
    if (v) cleaned[day] = v
  }
  if (!Object.keys(cleaned).length) {
    return json(res, 200, { ok: true, updated: 0, reason: 'empty' })
  }

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
