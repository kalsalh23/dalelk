# -*- coding: utf-8 -*-
# واجهة الحجز: إرسال للحجز الفوري + شاشة تأكيد بالتفاصيل + اشتراك صامت بالإشعارات
path = r"C:\Users\DELL\Desktop\help\src\components\entities\EntityDetailPage.tsx"
t = open(path, encoding="utf-8").read()

# 1) حالة تفاصيل الحجز الناجح
old = "  const [apptDateISO, setApptDateISO] = useState('')\n  const [takenTimes, setTakenTimes] = useState<string[]>([])\n  const [loadingSlots, setLoadingSlots] = useState(false)"
new = old + "\n  const [bookedInfo, setBookedInfo] = useState<{ doctor: string; dateLabel: string; time: string; instant: boolean } | null>(null)"
assert old in t, "state anchor"
t = t.replace(old, new, 1)

# 2) استبدال دالة الإرسال بالحجز الفوري
old_submit = """  const submitAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready) return
    if (!apptDay) { toast.show('اختر اليوم المناسب', 'error'); return }
    if (!apptName.trim() || !apptPhone.trim()) { toast.show('أدخل الاسم ورقم الهاتف', 'error'); return }
    setApptSending(true)
    const timeWithDate = apptTime.trim()
      ? (apptDateShort ? `${apptTime.trim()} — ${apptDateShort}` : apptTime.trim())
      : null
    const apptId = await createAppointmentRequest({
      doctor_id: String(ready.id),
      doctor_name: String(ready.name ?? ''),
      patient_name: apptName.trim(),
      patient_phone: apptPhone.trim(),
      preferred_day: apptDay,
      preferred_time: timeWithDate,
      requested_date: apptDateISO || null,
      note: apptNote.trim() || null,
    })
    setApptSending(false)
    if (apptId) {
      setApptDone(true)
      void track('appointment_request', { entityType: type, entityId: String(ready.id) })
      // إشعار خارجي عند تحديث حالة الطلب (اختياري — ضمن نفس ضغطة الإرسال)
      if (apptNotify) {
        const r = await subscribePush({ appointmentId: apptId })
        if (r !== 'ok') {
          toast.show('يمكنك متابعة حالة الطلب من الطبيب مباشرة')
        }
      }
    } else {
      toast.show('تعذر إرسال الطلب، حاول مجدداً', 'error')
    }
  }"""
new_submit = """  const submitAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready) return
    if (!apptDay) { toast.show('اختر اليوم المناسب', 'error'); return }
    if (!apptName.trim() || !apptPhone.trim()) { toast.show('أدخل الاسم ورقم الهاتف', 'error'); return }
    if (!apptTime) { toast.show('اختر الوقت المناسب', 'error'); return }
    setApptSending(true)
    try {
      const res = await fetch('/api/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: String(ready.id),
          date: apptDateISO,
          time: apptTime,
          name: apptName.trim(),
          phone: apptPhone.trim(),
          note: apptNote.trim() || null,
        }),
      })
      const d = await res.json().catch(() => ({}))
      if (res.status === 409 || d.error === 'taken') {
        toast.show(d.message || 'عذراً، هذا الوقت حُجز للتو — اختر وقتاً آخر', 'error')
        setApptTime('')
        setApptStep(1)
        if (apptDateISO) setTakenTimes((prev) => (prev.includes(apptTime) ? prev : [...prev, apptTime]))
        return
      }
      if (!res.ok || !d.ok) {
        toast.show(d.message || 'تعذر إتمام الحجز، حاول مجدداً', 'error')
        return
      }
      // نجاح: فوري (مؤكد في نظام العيادة) أو احتياطي (طلب للمراجعة)
      setBookedInfo({
        doctor: d.doctor_name || String(ready.name ?? ''),
        dateLabel: d.date_label || apptDateShort,
        time: apptTime,
        instant: d.mode === 'instant',
      })
      setApptDone(true)
      void track('appointment_request', { entityType: type, entityId: String(ready.id) })
      // اشتراك صامت بالإشعارات لمن فعّلها سابقاً (ليصله أي تحديث مستقبلي دون إزعاج)
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && d.request_id) {
        void subscribePush({ appointmentId: d.request_id })
      }
    } catch {
      toast.show('تعذر إتمام الحجز، حاول مجدداً', 'error')
    } finally {
      setApptSending(false)
    }
  }"""
assert old_submit in t, "submit anchor"
t = t.replace(old_submit, new_submit, 1)

# 3) شاشة النجاح: تم الحجز بالتفاصيل
old_done = """          {apptDone ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-light text-primary-dark">
                <CalendarClock className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-black text-ink">تم إرسال طلب موعدك</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">
                وصل طلبك إلى {name} وسيتم التواصل معك على رقمك
                <span className="font-bold text-ink" dir="ltr"> {apptPhone}</span> لتأكيد الموعد.
              </p>"""
new_done = """          {apptDone ? (
            <div className="py-6 text-center">
              <span className={`mx-auto flex size-14 items-center justify-center rounded-full ${bookedInfo?.instant ? 'bg-emerald-50 text-success' : 'bg-primary-light text-primary-dark'}`}>
                <CalendarClock className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-black text-ink">
                {bookedInfo?.instant ? 'تم الحجز بنجاح ✓' : 'تم إرسال طلب موعدك'}
              </h3>
              {bookedInfo?.instant ? (
                <>
                  <div className="mx-auto mt-3 max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-start">
                    <p className="flex items-center justify-between text-sm">
                      <span className="text-muted">الطبيب</span>
                      <span className="font-bold text-ink">{bookedInfo.doctor}</span>
                    </p>
                    <p className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted">اليوم والتاريخ</span>
                      <span className="font-bold text-ink">{bookedInfo.dateLabel}</span>
                    </p>
                    <p className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted">الساعة</span>
                      <span className="font-bold text-ink" dir="ltr">{bookedInfo.time}</span>
                    </p>
                  </div>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted">
                    موعدك مؤكد في نظام العيادة — احتفظ بهذا الوقت. لتعديله أو إلغائه تواصل مع العيادة هاتفياً
                    <span className="font-bold text-ink" dir="ltr"> {apptPhone ? '' : ''}</span>.
                  </p>
                </>
              ) : (
                <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">
                  وصل طلبك إلى {name} وسيتم التواصل معك على رقمك
                  <span className="font-bold text-ink" dir="ltr"> {apptPhone}</span> لتأكيد الموعد.
                </p>
              )}"""
assert old_done in t, "done screen anchor"
t = t.replace(old_done, new_done, 1)

# 4) زر إغلاق النافذة يعيد تعيين bookedInfo أيضاً
old_close = "setApptDay(''); setApptTime(''); setApptDateISO(''); setApptName(''); setApptPhone(''); setApptNote('')"
if old_close not in t:
    # صيغة أخرى محتملة
    old_close = "setApptOpen(false); setApptDone(false); setApptStep(1); setApptDay(''); setApptTime(''); setApptName(''); setApptPhone(''); setApptNote('')"
    new_close = old_close + "; setApptDateISO(''); setBookedInfo(null)"
else:
    new_close = old_close.replace("setApptNote('')", "setApptNote(''); setApptDateISO(''); setBookedInfo(null)")
assert old_close in t, "close anchor"
t = t.replace(old_close, new_close, 1)

open(path, "w", encoding="utf-8").write(t)
print("citizen instant booking UI applied")
