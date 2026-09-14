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
 * تفعيل الإشعارات الخارجية وحفظ الاشتراك في قاعدة البيانات.
 * يجب استدعاؤها من داخل حدث ضغطة مستخدم (المتصفح يشترط ذلك لطلب الإذن).
 */
export async function subscribePush(interests: {
  news?: boolean
  dailyDuty?: boolean
  appointmentId?: string | null
}): Promise<PushResult> {
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

    const { error } = await supabase.rpc('save_push_subscription', {
      p_endpoint: json.endpoint,
      p_p256dh: json.keys.p256dh,
      p_auth: json.keys.auth,
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
