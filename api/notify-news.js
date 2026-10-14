// إشعار أخبار المنصة (طبيب/صيدلية جديدة، إعلان، تمييز) — يُستدعى من مشغلات قاعدة البيانات
import { configured, checkSecret, sendToAll, json } from './_push.js'

export default async (req, res) => {
  if (!configured()) return json(res, 500, { error: 'notifications not configured' })
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' })
  if (!checkSecret(req)) return json(res, 401, { error: 'unauthorized' })

  const { subscriptions, notification } = req.body || {}
  if (!Array.isArray(subscriptions) || !notification?.title) {
    return json(res, 400, { error: 'missing subscriptions or notification' })
  }
  const { sent, total } = await sendToAll(subscriptions, notification)
  return json(res, 200, { ok: true, sent, total })
}
