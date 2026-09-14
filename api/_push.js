// مكتبة مشتركة لدوال الإشعارات الخادمية
const NOTIFY_SECRET = process.env.NOTIFY_SECRET

function configured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && NOTIFY_SECRET)
}

function checkSecret(req) {
  const key = req.headers['x-notify-secret'] || req.query.secret
  return configured() && key === NOTIFY_SECRET
}

function missingEnv() {
  const missing = []
  if (!process.env.VAPID_PUBLIC_KEY) missing.push('VAPID_PUBLIC_KEY')
  if (!process.env.VAPID_PRIVATE_KEY) missing.push('VAPID_PRIVATE_KEY')
  if (!process.env.NOTIFY_SECRET) missing.push('NOTIFY_SECRET')
  return missing.join(', ')
}

async function sendToSubscription(subscription, notification) {
  try {
    // تحميل مؤجل مع التقاط رسالة الخطأ الفعلية
    const webpush = require('web-push')
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth } },
      JSON.stringify(notification),
      { vapidDetails: { subject: 'mailto:support@dalil-altaybeh.com', publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY } },
    )
    return { ok: true }
  } catch (e) {
    // 404/410: الاشتراك لم يعد صالحاً
    return { ok: false, code: e.statusCode || 0, error: String((e && e.message) || e) }
  }
}

function json(res, code, body) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

module.exports = { configured, checkSecret, sendToSubscription, json, missingEnv }
