// إشعار يومي بالصيدليات المناوبة — cron Vercel (0 6 * * * UTC = 9:00 صباحاً بتوقيت سوريا)
const { configured, sendToSubscription, json } = require('./_push')

const SUPABASE_URL = 'https://nwgtpljltnangevhdsdz.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Z3RwbGpsdG5hbmdldmhkc2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NzMxOTYsImV4cCI6MjEwMjA0OTE5Nn0.BzFe8UYvw0gjwb7RcRbTFDgLa_5AMVn5b_ug-YJvWmo'

module.exports = async (req, res) => {
  if (!configured()) return json(res, 500, { error: 'notifications not configured' })
  const secret = (req.query && req.query.secret) || ''
  if (!secret) return json(res, 401, { error: 'unauthorized' })

  // جلب حمولة اليوم من قاعدة البيانات (تتحقق من السر داخلياً)
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/daily_duty_payload`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_secret: secret }),
  })
  if (!r.ok) return json(res, 502, { error: 'payload fetch failed' })
  const payload = await r.json()
  if (payload.error) return json(res, 401, { error: payload.error })

  const { notification, subscriptions } = payload
  if (!Array.isArray(subscriptions) || !subscriptions.length) {
    return json(res, 200, { ok: true, sent: 0, total: 0 })
  }
  let sent = 0
  for (const s of subscriptions) {
    const result = await sendToSubscription(s, notification)
    if (result.ok) sent++
  }
  return json(res, 200, { ok: true, sent, total: subscriptions.length })
}
