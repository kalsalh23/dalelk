// إشعار الصيدليات المناوبة — كل 8 ساعات (pg_cron) + شبكة أمان يومية (vercel cron)
// موثوقية: تنظيف الاشتراكات الميتة (410/404) تلقائياً + تسجيل الدفعة في push_log
// لضمان عدم انقطاع التذكير: إن لم تُسجل دفعة منذ 9 ساعات يُرسل الآن (شبكة الأمان اليومية)
import { configured, sendToAll, purgeDead, json, SUPABASE_URL, SUPABASE_ANON, CRON_SECRET } from './_push.js'

export default async (req, res) => {
  if (!configured()) return json(res, 500, { error: 'notifications not configured' })
  const secret = (req.query && req.query.secret) || ''
  if (!secret) return json(res, 401, { error: 'unauthorized' })
  const force = req.query.force === '1'

  try {
    // شبكة الأمان: إن أرسلت pg_cron دفعة خلال 9 ساعات الماضية فلا داعي لإعادة الإرسال اليومي
    if (!force) {
      const st = await fetch(`${SUPABASE_URL}/rest/v1/rpc/duty_push_status`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_secret: CRON_SECRET }),
      })
      const status = await st.json()
      if (status?.ok && status.stale === false) {
        return json(res, 200, { ok: true, skipped: true, last_push: status.last_push })
      }
    }

    // حمولة اليوم من قاعدة البيانات
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
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/duty_log_mark`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_secret: CRON_SECRET, p_sent: 0, p_total: 0 }),
      })
      return json(res, 200, { ok: true, sent: 0, total: 0 })
    }

    const { sent, total } = await sendToAll(subscriptions, notification)

    // تسجيل الدفعة (شبكة الأمان تعتمد عليها)
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/duty_log_mark`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_secret: CRON_SECRET, p_sent: sent, p_total: total }),
    })

    return json(res, 200, { ok: true, sent, total })
  } catch (e) {
    return json(res, 500, { error: String((e && e.message) || e).slice(0, 200) })
  }
}
