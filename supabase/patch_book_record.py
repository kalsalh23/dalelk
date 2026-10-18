# -*- coding: utf-8 -*-
# تحديث book-appointment.js: تسجيل السجل عبر RPC الآمن بدل الإدراج المباشر
path = r"C:\Users\DELL\Desktop\help\api\book-appointment.js"
t = open(path, encoding="utf-8").read()

old = """  // 5) سجل الحجز في المنصة (مؤكد) — يظهر في لوحة الطبيب أيضاً
  let requestId = null
  try {
    const ins = await fetch(`${SUPABASE_URL}/rest/v1/appointment_requests`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({
        doctor_id: doctor_id, doctor_name: doctor.name, patient_name: name, patient_phone: phone,
        preferred_day: DAY_KEYS[dObj.getDay()], preferred_time: timeWithDate,
        requested_date: date, note: note || null, status: 'confirmed',
      }),
    })
    const row = await ins.json().catch(() => null)
    requestId = row?.id ?? null
  } catch { /* السجل أمر ثانوي — الحجز تم في العيادة */ }"""
new = """  // 5) سجل الحجز في المنصة (مؤكد) — عبر RPC آمن يعيد المعرف
  let requestId = null
  try {
    const rec = await fetch(`${SUPABASE_URL}/rest/v1/rpc/book_record`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_doctor_id: doctor_id, p_doctor_name: doctor.name, p_patient_name: name, p_patient_phone: phone,
        p_preferred_day: DAY_KEYS[dObj.getDay()], p_preferred_time: timeWithDate,
        p_requested_date: date, p_note: note || null,
      }),
    })
    const rid = await rec.json()
    requestId = typeof rid === 'string' ? rid : null
  } catch { /* السجل أمر ثانوي — الحجز تم في العيادة */ }"""
assert old in t, "record anchor"
t = t.replace(old, new, 1)
open(path, "w", encoding="utf-8").write(t)
print("record RPC wired")
