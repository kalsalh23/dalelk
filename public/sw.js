//Service Worker — دليل طيبة الإمام الطبي: استقبال الإشعارات الخارجية
const VAPID_PUBLIC = 'BJjjaHtEEHYnCvV3G8a_hEdvv0hCub2xxI6lMZLU4qb5aFpH3W5KQduJ7J8H_zhW78mC22CqczfppY-nJqwPi4'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(normalized)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

/** إعادة تسجيل الاشتراك عند تدويره من المتصفح — يمنع موت الإشعارات بعد يوم-يومين */
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    (async () => {
      const oldEndpoint = (event.oldSubscription && event.oldSubscription.endpoint) || ''
      try {
        const sub = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
        })
        const j = sub.toJSON()
        if (!j.endpoint || !j.keys?.p256dh || !j.keys?.auth) return
        await fetch('https://nwgtpljltnangevhdsdz.supabase.co/rest/v1/rpc/push_refresh', {
          method: 'POST',
          headers: {
            apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53Z3RwbGpsdG5hbmdldmhkc2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NzMxOTYsImV4cCI6MjEwMjA0OTE5Nn0.BzFe8UYvw0gjwb7RcRbTFDgLa_5AMVn5b_ug-YJvWmo',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            p_old_endpoint: oldEndpoint,
            p_endpoint: j.endpoint,
            p_p256dh: j.keys.p256dh,
            p_auth: j.keys.auth,
          }),
        })
      } catch {
        // التسجيل الصامت: محاولة لاحقة عند فتح الموقع ستكمل
      }
    })(),
  )
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'دليل طيبة الإمام الطبي', body: event.data ? event.data.text() : '' }
  }
  const title = data.title || 'دليل طيبة الإمام الطبي'
  const options = {
    body: data.body || '',
    icon: data.icon || '/favicon.svg',
    badge: '/favicon.svg',
    dir: 'rtl',
    lang: 'ar',
    tag: data.tag || undefined,
    data: { url: data.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url).catch(() => {})
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})
