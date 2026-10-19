// الحجز الفوري: المواطن يحجز وقتاً متاحاً فيصبح موعداً مؤكداً في نظام العيادة فوراً
// حجز نشط واحد لكل مواطن (يشمل ما سجّله الطبيب من العيادة) + تحقق مزدوج من التوفر ثم إنشاء ذري بمؤشر الفريدة
// مشروع المنصة: الأطباء والطلبات وجدول الربط — مشروع العيادة: المواعيد والأوقات المحجوزة فعلياً
import { SUPABASE_URL, SUPABASE_ANON, json } from './_push.js'
import { platformRpc, clinicRpc } from './_rpc.js'
import { fetchActiveBooking } from './_one-booking.js'

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function extractTime(text) {
  const m = String(text ?? '').match(/(\d{1,2}:\d{2})/)
  return m ? m[1] : null
}

function padTime(t) {
  const [h, m] = String(t ?? '').split(':')
  return `${String(h ?? '').padStart(2, '0')}:${m ?? ''}`
}

export default async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed' })
  const { doctor_id, date, time, name, phone, note } = req.body || {}
  if (!doctor_id || !date || !time || !name || !phone) {
    return json(res, 400, { error: 'missing fields' })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{1,2}:\d{2}$/.test(time)) {
    return json(res, 400, { error: 'invalid date/time format' })
  }

  // 1) بيانات الطبيب + الربط (مشروع المنصة)
  const dRes = await fetch(`${SUPABASE_URL}/rest/v1/doctors?select=id,name&id=eq.${doctor_id}&limit=1`, {
    headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
  }).catch(() => null)
  const docRows = dRes ? await dRes.json().catch(() => []) : []
  const doctor = Array.isArray(docRows) ? docRows[0] : null
  if (!doctor) return json(res, 404, { error: 'unmapped', message: 'الطبيب غير موجود' })

  const mMap = await fetch(
    `${SUPABASE_URL}/rest/v1/bridge_doctor_map?select=clinic_id&platform_doctor_id=eq.${doctor_id}&enabled=eq.true&limit=1`,
    { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
  ).catch(() => null)
  const mapRows = mMap ? await mMap.json().catch(() => []) : []
  const clinicId = Array.isArray(mapRows) ? mapRows[0]?.clinic_id : null

  // 2) حجز نشط واحد فقط لكل مواطن — يشمل ما سجّله الطبيب مباشرة من العيادة
  const active = await fetchActiveBooking(phone)
  if (active) {
    return json(res, 409, { error: 'has_booking', message: active.message, booking: active.booking })
  }

  // 3) تحقق التوفر: طلبات معلقة على المنصة + مواعيد العيادة
  const taken = new Set()
  const pend = await platformRpc('taken_pending_times', { p_doctor_id: doctor_id, p_date: date })
  for (const t of (Array.isArray(pend.data) ? pend.data : [])) {
    if (t) taken.add(padTime(extractTime(t) || t))
  }
  if (clinicId) {
    const clinic = await clinicRpc('bridge_taken_times', { p_clinic_id: clinicId, p_date: date })
    for (const t of (Array.isArray(clinic.data) ? clinic.data : [])) {
      if (t) taken.add(padTime(extractTime(t) || t))
    }
  }
  if (taken.has(padTime(time))) {
    return json(res, 409, { error: 'taken', message: 'عذراً، هذا الوقت حُجز للتو — اختر وقتاً آخر' })
  }

  const dObj = new Date(date + 'T00:00:00')
  const dateLabel = dObj.toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeWithDate = `${time} — ${dObj.toLocaleDateString('ar', { day: 'numeric', month: 'long' })}`

  // 4) تسجيل الحجز في المنصة أولاً (معرف الربط بين النظامين) — عبر RPC آمن
  const rec = await platformRpc('book_record', {
    p_doctor_id: doctor_id, p_doctor_name: doctor.name, p_patient_name: name, p_patient_phone: phone,
    p_preferred_day: DAY_KEYS[dObj.getDay()], p_preferred_time: timeWithDate,
    p_requested_date: date, p_note: note || null,
  })
  const requestId = typeof rec.data === 'string' ? rec.data : null
  if (!requestId) {
    // لا نُبلّغ المواطن بالنجاح دون سجل فعلي — يُعاد المحاولة
    return json(res, 502, { error: 'record_failed', message: 'تعذّر تسجيل طلب الحجز — حاول مجدداً' })
  }

  // 5) طبيب غير مربوط (احتياط): يبقى طلب مراجعة على المنصة
  if (!clinicId) {
    return json(res, 200, {
      ok: true, mode: 'request', request_id: requestId,
      doctor_name: doctor.name, date, time, date_label: dateLabel,
    })
  }

  // 6) الحجز الفوري في نظام العيادة (إنشاء ذري بمؤشر الفريدة)
  const conf = await clinicRpc('bridge_confirm_appointment', {
    p_platform_ref: requestId, p_clinic_id: clinicId, p_doctor_name: doctor.name,
    p_patient_name: name, p_patient_phone: phone,
    p_requested_date: date, p_time: time, p_note: note || null,
  })
  const confErr = conf?.data?.error || null
  if (confErr === 'taken') {
    // تعارض الوقت: حذف سجل المنصة الاحتياطي ثم إبلاغ المواطن
    await platformRpc('book_record_delete', { p_id: requestId })
    return json(res, 409, { error: 'taken', message: 'عذراً، هذا الوقت حُجز للتو — اختر وقتاً آخر' })
  }
  if (!conf?.ok || confErr || conf?.data?.ok !== true) {
    // تعذّر الحجز في العيادة — يبقى الطلب مسجّلاً على المنصة ليؤكده الطبيب
    const detail = String(conf?.data?.message || conf?.data?.details || '')
    if (detail.includes('ONE_PER_DAY')) {
      await platformRpc('book_record_delete', { p_id: requestId })
      return json(res, 409, {
        error: 'has_booking',
        message: 'لديك موعد مسجّل في هذه العيادة في نفس اليوم — لا يمكن حجز موعد آخر.',
        booking: { doctor: doctor.name, date, time },
      })
    }
    return json(res, 200, {
      ok: true, mode: 'request', request_id: requestId, clinic_pending: true,
      doctor_name: doctor.name, date, time, date_label: dateLabel,
    })
  }

  return json(res, 200, {
    ok: true, mode: 'instant', request_id: requestId,
    doctor_name: doctor.name, date, time, date_label: dateLabel,
  })
}
