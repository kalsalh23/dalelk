// إشعار تحديث طلب موعد — يُستدعى من قاعدة البيانات (pg_net) عند تأكيد/رفض الطبيب
const { configured, checkSecret, sendToSubscription, json } = require('./_push')

module.exports = async (req, res) => {
  if (!configured()) return json(res, 500, { error: 'notifications not configured' })
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' })
  if (!checkSecret(req)) return json(res, 401, { error: 'unauthorized' })

  const { subscription, notification } = req.body || {}
  if (!subscription?.endpoint || !notification?.title) {
    return json(res, 400, { error: 'missing subscription or notification' })
  }
  const result = await sendToSubscription(subscription, notification)
  return json(res, 200, { ok: result.ok })
}
