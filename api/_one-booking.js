// قاعدة «حجز نشط واحد لكل مواطن» — تحقق مشترك عبر RPC آمن
// يغطي الحجوزات التي أنشأها المواطن من المنصة والحجوزات التي سجّلها الطبيب مباشرة من العيادة
import { SUPABASE_URL, SUPABASE_ANON } from './_push.js'

const BRIDGE_SECRET = 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5'

/** يعيد تفاصيل الحجز النشط السابق لهذا الرقم، أو null إن لم يوجد (أو تعذّر التحقق) */
async function fetchActiveBooking(phone) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/book_check_phone`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_secret: BRIDGE_SECRET, p_phone: phone }),
    })
    const cur = await r.json().catch(() => null)
    if (!cur || cur.error || !cur.exists) return null
    const dayTxt = cur.date
      ? new Date(cur.date + 'T00:00:00').toLocaleDateString('ar', { day: 'numeric', month: 'long' })
      : ''
    const whereTxt = cur.doctor ? ` لدى ${cur.doctor}` : ''
    const whenTxt = dayTxt ? ` يوم ${dayTxt}` : ''
    const timeTxt = cur.time ? ` الساعة ${cur.time}` : ''
    return {
      message: `نعتذر منك. لديك حجز مسبق في الدليل${whereTxt}${whenTxt}${timeTxt} — لا يمكن حجز أكثر من موعد واحد. لتعديله أو إلغائه تواصل مع العيادة.`,
      booking: { doctor: cur.doctor ?? null, date: cur.date ?? null, time: cur.time ?? null },
    }
  } catch {
    return null
  }
}

export { BRIDGE_SECRET, fetchActiveBooking }
