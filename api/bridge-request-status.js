// حالة طلب الموعد كما تراها العيادة — تستقصئها الواجهة كل 15 ثانية
// GET /api/bridge-request-status?secret=…&platform_ref=…
import { json } from './_push.js'
import { clinicRpc, BRIDGE_SECRET } from './_rpc.js'

export default async (req, res) => {
  const secret = (req.query && req.query.secret) || req.headers['x-bridge-secret'] || ''
  if (secret !== BRIDGE_SECRET) return json(res, 401, { error: 'unauthorized' })

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
