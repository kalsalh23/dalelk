// الأوقات المحجوزة فعلياً في نظام إدارة العيادة — عيادة وتاريخ محدَّدان
// GET /api/bridge-taken-slots?secret=…&clinic_id=…&date=YYYY-MM-DD
import { json } from './_push.js'
import { clinicRpc, BRIDGE_SECRET } from './_rpc.js'

export default async (req, res) => {
  const secret = (req.query && req.query.secret) || req.headers['x-bridge-secret'] || ''
  if (secret !== BRIDGE_SECRET) return json(res, 401, { error: 'unauthorized' })

  const clinicId = (req.query && req.query.clinic_id) || ''
  const date = (req.query && req.query.date) || ''
  if (!clinicId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json(res, 400, { error: 'clinic_id and date (YYYY-MM-DD) required' })
  }

  const r = await clinicRpc('bridge_taken_times', { p_clinic_id: clinicId, p_date: date })
  const times = Array.isArray(r?.data) ? r.data : []
  res.setHeader('Cache-Control', 'no-store')
  return json(res, 200, { ok: true, clinic_id: clinicId, date, times })
}
