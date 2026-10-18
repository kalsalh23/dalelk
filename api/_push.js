// مكتبة مشتركة لدوال الإشعارات الخادمية (ESM — type: module في package.json)
import { createClient } from '@supabase/supabase-js'

const NOTIFY_SECRET = process.env.NOTIFY_SECRET

// عميل خدمة لتنظيف الاشتراكات الميتة (يتجاوز RLS عبر service_role عندما يكون متاحاً)
const SUPABASE_URL = 'https://nwgtpljltnangevhdsdz.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Z3RwbGpsdG5hbmdldmhkc2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NzMxOTYsImV4cCI6MjEwMjA0OTE5Nn0.BzFe8UYvw0gjwb7RcRbTFDgLa_5AMVn5b_ug-YJvWmo'
const CRON_SECRET = 'c50196c783f0cdf26fdfc592590bfbe3'

function configured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && NOTIFY_SECRET)
}

function missingEnv() {
  const missing = []
  if (!process.env.VAPID_PUBLIC_KEY) missing.push('VAPID_PUBLIC_KEY')
  if (!process.env.VAPID_PRIVATE_KEY) missing.push('VAPID_PRIVATE_KEY')
  if (!process.env.NOTIFY_SECRET) missing.push('NOTIFY_SECRET')
  return missing.join(', ')
}

function checkSecret(req) {
  const key = req.headers['x-notify-secret'] || req.query.secret
  return configured() && key === NOTIFY_SECRET
}

async function sendToSubscription(subscription, notification) {
  try {
    const webpush = (await import('web-push')).default
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth } },
      JSON.stringify(notification),
      { vapidDetails: { subject: 'mailto:support@dalil-altaybeh.com', publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY } },
    )
    return { ok: true }
  } catch (e) {
    // 404/410: الاشتراك لم يعد صالحاً — نعيد الكود ليتعامل معه المستدعي
    return { ok: false, code: e.statusCode || 0, error: String((e && e.message) || e) }
  }
}

/** حذف الاشتراكات الميتة من القاعدة (410 = ملغى، 404 = مختفٍ، 400 = مفتاح غير صالح) */
async function purgeDead(endpoints) {
  if (!endpoints.length) return
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/purge_dead_push`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_secret: CRON_SECRET, p_endpoints: endpoints }),
    })
  } catch {
    // التنظيف صامت — الاشتراك الميت يُعاد تجربة إرساله فقط دون أذى
  }
}

/** إرسال جماعي مع تنظيف الموتى تلقائياً */
async function sendToAll(subscriptions, notification) {
  let sent = 0
  const dead = []
  for (const s of subscriptions) {
    const r = await sendToSubscription(s, notification)
    if (r.ok) {
      sent++
    } else if (r.code === 404 || r.code === 410 || r.code === 400) {
      dead.push(s.endpoint)
    }
  }
  if (dead.length) await purgeDead(dead)
  return { sent, total: subscriptions.length }
}

function json(res, code, body) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

export { configured, missingEnv, checkSecret, sendToSubscription, sendToAll, purgeDead, json, SUPABASE_URL, SUPABASE_ANON, CRON_SECRET }