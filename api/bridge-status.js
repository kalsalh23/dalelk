// جسر عودة حالة الموعد: يستقبل قبول/رفض/إلغاء من نظام إدارة العيادة
// ويحدّث طلب المنصة ويُبلّغ المريض بإشعار الدفع برسالة مناسبة لحالته
import { SUPABASE_URL, SUPABASE_ANON, sendToSubscription, json } from './_push.js'
import { clinicRpc } from './_rpc.js'

const BRIDGE_SECRET = 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5'

export default async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' })
  const key = req.headers['x-bridge-secret'] || ''
  if (key !== BRIDGE_SECRET) return json(res, 401, { error: 'unauthorized' })

  const { platform_ref, status } = req.body || {}
  if (!platform_ref || !status) return json(res, 400, { error: 'missing platform_ref or status' })

  // 1) تحديث حالة الطلب في المنصة (يعيد الحالة السابقة لصياغة الرسالة)
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/bridge_update_status`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_secret: BRIDGE_SECRET, p_platform_ref: platform_ref, p_status: status }),
  })
  const result = await r.json()
  if (!r.ok || result.error) return json(res, 400, { ok: false, error: result.error || 'update failed' })
  if (result.ignored) return json(res, 200, { ok: true, ignored: status })

  // 1.1) مزامنة الحالة داخل نظام العيادة أيضاً (حتى تصل الحالة نفسها إلى استقصاء الواجهة)
  await clinicRpc('bridge_set_request_status', { p_platform_ref: platform_ref, p_status: status })

  // 2) إشعار المريض — الرسالة بحسب الحالة السابقة والجديدة
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
