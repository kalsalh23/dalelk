// مكتبة مشتركة لدوال الإشعارات الخادمية
const webpush = require('web-push')

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
const NOTIFY_SECRET = process.env.NOTIFY_SECRET

function configured() {
  return Boolean(VAPID_PUBLIC && VAPID_PRIVATE && NOTIFY_SECRET)
}

function checkSecret(req) {
  const key = req.headers['x-notify-secret'] || req.query.secret
  return configured() && key === NOTIFY_SECRET
}

async function sendToSubscription(subscription, notification) {
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth } },
      JSON.stringify(notification),
      { vapidDetails: { subject: 'mailto:support@dalil-altaybeh.com', publicKey: VAPID_PUBLIC, privateKey: VAPID_PRIVATE } },
    )
    return { ok: true }
  } catch (e) {
    // 404/410: الاشتراك لم يعد صالحاً — يُتجاهل (يُنصح بتنظيفه لاحقاً)
    return { ok: false, code: e.statusCode || 0 }
  }
}

function json(res, code, body) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

module.exports = { configured, checkSecret, sendToSubscription, json }
