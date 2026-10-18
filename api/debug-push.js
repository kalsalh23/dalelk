// نقطة تشخيص الإشعارات — تعيد سبب فشل الإرسال لكل مشترك مناوبة (محمية بالسر)
import { configured, checkSecret, json } from './_push.js'
import webpush from 'web-push'

const SUPABASE_URL = 'https://nwgtpljltnangevhdsdz.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Z3RwbGpsdG5hbmdldmhkc2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NzMxOTYsImV4cCI6MjEwMjA0OTE5Nn0.BzFe8UYvw0gjwb7RcRbTFDgLa_5AMVn5b_ug-YJvWmo'
const DUTY_RPC_SECRET = 'c50196c783f0cdf26fdfc592590bfbe3'

export default async (req, res) => {
  if (!configured()) return json(res, 500, { error: 'not configured', missing: true })
  if (!checkSecret(req)) return json(res, 401, { error: 'unauthorized' })

  // نفس مسار الكرون: جلب المشتركين عبر RPC آمن (يتجاوز RLS)
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/daily_duty_payload`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_secret: DUTY_RPC_SECRET }),
  })
  const payload = await r.json()
  const subs = payload?.subscriptions ?? []

  const results = []
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } },
        JSON.stringify({ title: 'اختبار تشخيص الإشعارات', body: 'إذا وصلتك هذه الرسالة فالنظام يعمل ✓' }),
        { vapidDetails: { subject: 'mailto:support@dalil-altaybeh.com', publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY } },
      )
      results.push({ endpoint: s.endpoint.slice(0, 70), ok: true })
    } catch (e) {
      results.push({
        endpoint: s.endpoint.slice(0, 70),
        ok: false,
        statusCode: e.statusCode,
        body: String(e.body || e.message || '').slice(0, 400),
      })
    }
  }
  return json(res, 200, { total: subs.length, results })
}
