// قاعدة «حجز نشط واحد لكل مواطن» — تحقق مشترك عبر RPC آمن
// يغطي الحجوزات التي أنشأها المواطن من المنصة والحجوزات التي سجّلها الطبيب مباشرة من العيادة
import { platformRpc } from './_rpc.js'

/** يعيد تفاصيل الحجز النشط السابق لهذا الرقم، أو null إن لم يوجد (أو تعذّر التحقق) */
async function fetchActiveBooking(phone) {
  try {
    const cur = await platformRpc('book_check_phone', { p_phone: phone })
    const data = cur?.data
    if (!cur?.ok || !data || data.error || !data.exists) return null
    const dayTxt = data.date
      ? new Date(data.date + 'T00:00:00').toLocaleDateString('ar', { day: 'numeric', month: 'long' })
      : ''
    const whereTxt = data.doctor ? ` لدى ${data.doctor}` : ''
    const whenTxt = dayTxt ? ` يوم ${dayTxt}` : ''
    const timeTxt = data.time ? ` الساعة ${data.time}` : ''
    return {
      message: `نعتذر منك. لديك حجز مسبق في الدليل${whereTxt}${whenTxt}${timeTxt} — لا يمكن حجز أكثر من موعد واحد. لتعديله أو إلغائه تواصل مع العيادة.`,
      booking: { doctor: data.doctor ?? null, date: data.date ?? null, time: data.time ?? null },
    }
  } catch {
    return null
  }
}

export { fetchActiveBooking }
