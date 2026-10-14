import { supabase } from '@/lib/supabase'

const VAPID_PUBLIC = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ?? ''

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(normalized)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export type PushResult = 'ok' | 'denied' | 'unsupported' | 'error'

export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
}

/**
 * طلب الإذن والحصول على اشتراك الدفع الخام (بدون حفظ).
 * يجب استدعاؤها من داخل حدث ضغطة مستخدم. تُستخدم من الفوتر ولوحة الطبيب.
 */
export async function acquirePushSubscription(): Promise<
  { endpoint: string; p256dh: string; auth: string } | 'denied' | 'unsupported' | 'error'
> {
  try {
    if (!pushSupported() || !VAPID_PUBLIC) return 'unsupported'
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return 'denied'
    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as BufferSource,
      }))
    const json = sub.toJSON()
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return 'error'
    return { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth }
  } catch {
    return 'error'
  }
}

/**
 * تفعيل الإشعارات الخارجية وحفظ الاشتراك في قاعدة البيانات.
 * يجب استدعاؤها من داخل حدث ضغطة مستخدم (المتصفح يشترط ذلك لطلب الإذن).
 */
export async function subscribePush(interests: {
  news?: boolean
  dailyDuty?: boolean
  appointmentId?: string | null
}): Promise<PushResult> {
  try {
    const acquired = await acquirePushSubscription()
    if (typeof acquired === 'string') return acquired

    const { error } = await supabase.rpc('save_push_subscription', {
      p_endpoint: acquired.endpoint,
      p_p256dh: acquired.p256dh,
      p_auth: acquired.auth,
      p_wants_news: Boolean(interests.news),
      p_wants_daily_duty: Boolean(interests.dailyDuty),
      p_appointment_id: interests.appointmentId ?? null,
    })
    if (error) return 'error'
    return 'ok'
  } catch {
    return 'error'
  }
}

/* ============================================================
 * الشفاء الذاتي: من فعّل الإشعارات سابقاً (إذن ممنوح) يجدّد
 * اشتراكه تلقائياً عند كل فتح للموقع — بلا أي تدخل من المستخدم.
 * هذا هو العلاج الجذري لموت الإشعارات بعد يوم-يومين على الجوال.
 * ============================================================ */

const HEAL_KEY = 'push_heal_last'

export async function healPushSubscription(): Promise<void> {
  try {
    // مرة كل 12 ساعة كافية — لا نثقل التحميل
    const last = Number(localStorage.getItem(HEAL_KEY) ?? 0)
    if (Date.now() - last < 12 * 3600 * 1000) return
    if (!pushSupported() || !VAPID_PUBLIC) return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()
    // لا اشتراك محلياً رغم منح الإذن: أعد الاشتراك صامتاً (لا يطلب إذناً جديداً)
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC) as BufferSource,
      })
    }
    const j = sub.toJSON()
    if (!j.endpoint || !j.keys?.p256dh || !j.keys?.auth) return

    await supabase.rpc('save_push_subscription', {
      p_endpoint: j.endpoint,
      p_p256dh: j.keys.p256dh,
      p_auth: j.keys.auth,
      p_wants_news: true,      // منطق الدالة يتراكم (OR) ولا يمسح الخيارات القديمة
      p_wants_daily_duty: true,
      p_appointment_id: null,
    })
    localStorage.setItem(HEAL_KEY, String(Date.now()))
  } catch {
    // صامت — المحاولة التالية عند الفتح القادم
  }
}