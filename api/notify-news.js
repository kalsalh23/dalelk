// إشعار أخبار المنصة (طبيب/صيدلية جديدة) — يُستدعى من مشغلات قاعدة البيانات
const { configured, checkSecret, sendToSubscription, json } = require('./_push')

module.exports = async (req, res) => {
  if (!configured()) return json(res, 500, { error: 'notifications not configured' })
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' })
  if (!checkSecret(req)) return json(res, 401, { error: 'unauthorized' })

  const { subscriptions, notification } = req.body || {}
  if (!Array.isArray(subscriptions) || !notification?.title) {
    return json(res, 400, { error: 'missing subscriptions or notification' })
  }
  let sent = 0
  for (const s of subscriptions) {
    const r = await sendToSubscription(s, notification)
    if (r.ok) sent++
  }
  return json(res, 200, { ok: true, sent, total: subscriptions.length })
}
