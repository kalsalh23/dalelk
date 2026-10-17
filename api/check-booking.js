// تحقق سريع: هل لدى هذا الرقم حجز سابق؟ — يُستدعى من واجهة الحجز لحظة إدخال رقم الهاتف
import { json } from './_push.js'
import { fetchActiveBooking } from './_one-booking.js'

export default async (req, res) => {
  const phone = (req.query && req.query.phone) || ''
  if (String(phone).replace(/\D/g, '').length < 9) {
    return json(res, 400, { error: 'valid phone required' })
  }
  const active = await fetchActiveBooking(phone)
  if (!active) return json(res, 200, { has: false })
  return json(res, 200, { has: true, message: active.message, booking: active.booking })
}
