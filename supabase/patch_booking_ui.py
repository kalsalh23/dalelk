# -*- coding: utf-8 -*-
# إعادة تصميم خطوة اختيار الموعد: شريط أيام + أوقات متاحة (مطابق للنموذج المعتمد)
path = r"C:\Users\DELL\Desktop\help\src\components\entities\EntityDetailPage.tsx"
t = open(path, encoding="utf-8").read()

# 1) أيقونة ChevronDown
old = "Monitor, Siren, Star, CalendarClock, ArrowLeft, User, Share2,"
new = "Monitor, Siren, Star, CalendarClock, ArrowLeft, User, Share2, ChevronDown,"
assert old in t, "icons anchor"
t = t.replace(old, new, 1)

# 2) إزالة APPOINTMENT_DAYS من الاستيراد (لم تعد مستخدمة)
old = "import { createAppointmentRequest, APPOINTMENT_DAYS, dayLabel } from '@/services/appointments'"
new = "import { createAppointmentRequest, dayLabel } from '@/services/appointments'"
assert old in t, "appointments import anchor"
t = t.replace(old, new, 1)

# 3) دوال مساعدة على مستوى الملف (بعد DAY_NAMES)
anchor = """const DAY_NAMES: Record<string, string> = {
  sat: 'السبت', sun: 'الأحد', mon: 'الاثنين', tue: 'الثلاثاء',
  wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة',
}
"""
helpers = anchor + """
// شريط الأيام: 14 يوماً قادمة (اليوم أولاً — RTL يجعله في أقصى اليمين)
const JS_DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
function buildDayStrip(): Array<{ iso: string; dayNum: string; dayName: string; isToday: boolean; key: string }> {
  const out: Array<{ iso: string; dayNum: string; dayName: string; isToday: boolean; key: string }> = []
  const base = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    out.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayNum: String(d.getDate()).padStart(2, '0'),
      dayName: d.toLocaleDateString('ar', { weekday: 'long' }),
      isToday: i === 0,
      key: JS_DAY_KEYS[d.getDay()],
    })
  }
  return out
}

function monthLabelOf(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('ar', { month: 'long', year: 'numeric' })
}

/** توليد الأوقات المتاحة كل 30 دقيقة من نص دوام اليوم (مثل: 9:00 - 17:00 أو 9:00 - 14:00 و 16:00 - 20:00) */
function slotsForHours(text: string): string[] {
  const t = (text ?? '').trim()
  if (!t || t.includes('مغلق') || t.includes('إجازة')) return []
  const re = /(\\d{1,2})(?::(\\d{2}))?\\s*(?:ص|م)?\\s*[-–—]\\s*(\\d{1,2})(?::(\\d{2}))?\\s*(?:ص|م)?/g
  const ranges: Array<[number, number]> = []
  let m: RegExpExecArray | null
  while ((m = re.exec(t))) {
    const s = +m[1] * 60 + (m[2] ? +m[2] : 0)
    const e = +m[3] * 60 + (m[4] ? +m[4] : 0)
    if (e > s && s >= 0 && e <= 24 * 60) ranges.push([s, e])
  }
  if (!ranges.length) return []
  const set = new Set<string>()
  for (const [s, e] of ranges) {
    for (let x = s; x < e; x += 30) {
      set.add(`${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`)
    }
  }
  return [...set].sort()
}
"""
assert anchor in t, "DAY_NAMES anchor"
t = t.replace(anchor, helpers, 1)

# 4) حالة التاريخ المختار
old = "  const [apptTime, setApptTime] = useState('')"
new = "  const [apptTime, setApptTime] = useState('')\n  const [apptDateISO, setApptDateISO] = useState('')"
assert old in t, "apptTime state anchor"
t = t.replace(old, new, 1)

# 5) مشتقات الشريط والأوقات (بعد early returns مع باقي المشتقات)
old = "  const rating = ready.rating ? Number(ready.rating) : null"
new = """  const rating = ready.rating ? Number(ready.rating) : null

  // شريط الحجز: الأيام + حالة الفتح + الأوقات المتاحة لليوم المختار
  const stripDays = buildDayStrip()
  const dayOpen = (key: string) => !hours || !Object.keys(hours).length || Boolean((hours[key] ?? '').trim())
  const daySlots = apptDay ? slotsForHours(String(hours?.[apptDay] ?? '')) : []
  const apptDateShort = apptDateISO
    ? new Date(apptDateISO + 'T00:00:00').toLocaleDateString('ar', { day: 'numeric', month: 'long' })
    : ''"""
assert old in t, "rating anchor"
t = t.replace(old, new, 1)

# 6) زر فتح النافذة: تهيئة اليوم الافتراضي (أول يوم مفتوح)
old = "onClick={() => { if (plan !== 'free' && !onVacation) { setApptOpen(true); setApptDone(false); setApptStep(1) } }}"
new = "onClick={() => { if (plan !== 'free' && !onVacation) { const d0 = buildDayStrip().find((d) => !hours || !Object.keys(hours).length || Boolean((hours[d.key] ?? '').trim())) ?? buildDayStrip()[0]; setApptOpen(true); setApptDone(false); setApptStep(1); setApptDay(d0.key); setApptDateISO(d0.iso); setApptTime('') } }}"
assert old in t, "open button anchor"
t = t.replace(old, new, 1)

# 7) الإرسال: إرفاق التاريخ بوقت الموعد (مفيد للطبيب: 11:30 — 29 سبتمبر)
old = "    setApptSending(true)\n    const apptId = await createAppointmentRequest({"
new = "    setApptSending(true)\n    const timeWithDate = apptTime.trim()\n      ? (apptDateShort ? `${apptTime.trim()} — ${apptDateShort}` : apptTime.trim())\n      : null\n    const apptId = await createAppointmentRequest({"
assert old in t, "submit anchor"
t = t.replace(old, new, 1)

old = "      preferred_time: apptTime.trim() || null,"
new = "      preferred_time: timeWithDate,"
assert old in t, "preferred_time anchor"
t = t.replace(old, new, 1)

# 8) ملخص الخطوة الثانية يعرض التاريخ أيضاً
old = "{dayLabel(apptDay)}{apptTime ? ` — الساعة ${apptTime}` : ''}"
new = "{dayLabel(apptDay)}{apptTime ? ` — الساعة ${apptTime}` : ''}{apptDateShort ? ` (${apptDateShort})` : ''}"
assert old in t, "summary anchor"
t = t.replace(old, new, 1)

# 9) استبدال كتلة الخطوة الأولى بالتصميم الجديد
old_block = """              {apptStep === 1 ? (
                <>
                  <p className="rounded-xl bg-subtle px-4 py-3 text-xs leading-6 text-muted">
                    هذه خدمة <strong className="text-ink">طلب موعد</strong> — يصل طلبك إلى الطبيب ليؤكده، وستتم تسوية الوقت النهائي معكم هاتفياً أو عبر واتساب.
                  </p>

                  <div>
                    <p className="mb-2 text-sm font-bold text-ink">اختر اليوم:</p>
                    <div className="flex flex-wrap gap-2">
                      {APPOINTMENT_DAYS.map((d) => {
                        const available = !hours || !Object.keys(hours).length || Boolean(hours[d.key]?.trim())
                        if (!available) return null
                        return (
                          <button
                            key={d.key}
                            type="button"
                            onClick={() => setApptDay(d.key)}
                            className={cn(
                              'cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-bold transition',
                              apptDay === d.key ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-ink hover:border-primary/50',
                            )}
                          >
                            {d.label}
                          </button>
                        )
                      })}
                    </div>
                    {hours && Object.keys(hours).length > 0 && (
                      <p className="mt-2 text-[11px] text-muted">أيام دوام الطبيب المذكورة أعلاه فقط.</p>
                    )}
                  </div>

                  <Field label="الوقت المفضل (تقريبي)">
                    <Input value={apptTime} onChange={(e) => setApptTime(e.target.value)} placeholder="مثال: 10:00 صباحاً" />
                  </Field>

                  <Button
                    type="button"
                    className="w-full"
                    disabled={!apptDay}
                    onClick={() => setApptStep(2)}
                  >
                    التالي
                    <ArrowLeft className="size-4" />
                  </Button>
                </>
              ) : ("""
new_block = """              {apptStep === 1 ? (
                <>
                  <p className="rounded-xl bg-subtle px-4 py-3 text-xs leading-6 text-muted">
                    هذه خدمة <strong className="text-ink">طلب موعد</strong> — يصل طلبك إلى الطبيب ليؤكده، وستتم تسوية الوقت النهائي معكم هاتفياً أو عبر واتساب.
                  </p>

                  {/* الشهر */}
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-black text-ink">{monthLabelOf(apptDateISO || stripDays[0].iso)}</p>
                    <ChevronDown className="size-4 text-muted" />
                  </div>

                  {/* شريط الأيام */}
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {stripDays.map((d) => {
                      const open = dayOpen(d.key)
                      const selected = apptDateISO === d.iso
                      return (
                        <button
                          key={d.iso}
                          type="button"
                          disabled={!open}
                          onClick={() => { setApptDateISO(d.iso); setApptDay(d.key); setApptTime('') }}
                          className={cn(
                            'flex h-28 w-[68px] shrink-0 flex-col items-center justify-center gap-2.5 rounded-[30px] border transition',
                            selected
                              ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25'
                              : open
                                ? 'cursor-pointer border-transparent bg-subtle text-ink hover:bg-subtle-strong/60'
                                : 'cursor-not-allowed border-transparent bg-subtle/40 text-muted/50',
                          )}
                        >
                          <span className="text-[13px] font-bold">{d.isToday ? 'اليوم' : d.dayName}</span>
                          <span className={cn('flex size-9 items-center justify-center rounded-full text-base font-black', selected && 'bg-white text-primary-dark')}>
                            {d.dayNum}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* الأوقات المتاحة */}
                  <div className="rounded-2xl bg-subtle/70 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-black text-ink">الأوقات المتاحة</p>
                      {daySlots.length > 0 && <p className="text-sm font-bold text-muted">{daySlots.length} الأوقات المتاحة</p>}
                    </div>
                    {daySlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {daySlots.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setApptTime(s)}
                            className={cn(
                              'cursor-pointer rounded-xl border bg-surface py-3 text-sm font-black transition',
                              apptTime === s ? 'border-primary text-primary-dark ring-2 ring-primary/25' : 'border-transparent text-ink hover:border-primary/40',
                            )}
                            dir="ltr"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Field label="الوقت المفضل (تقريبي)" hint="أوقات دوام الطبيب غير محددة بدقة لهذا اليوم — اكتب الوقت المناسب لك">
                        <Input value={apptTime} onChange={(e) => setApptTime(e.target.value)} placeholder="مثال: 10:00 صباحاً" />
                      </Field>
                    )}
                    {daySlots.length === 0 && hours && Object.keys(hours).length > 0 && (
                      <p className="mt-2 text-[11px] text-muted">أيام دوام الطبيب فقط — الأيام الرمادية مغلقة.</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    disabled={!apptDay || (daySlots.length > 0 && !apptTime)}
                    onClick={() => setApptStep(2)}
                  >
                    التالي
                    <ArrowLeft className="size-4" />
                  </Button>
                </>
              ) : ("""
assert old_block in t, "step1 block anchor"
t = t.replace(old_block, new_block, 1)

# 10) إعادة ضبط التاريخ عند الإغلاق
old = "setApptDay(''); setApptTime('');"
new = "setApptDay(''); setApptTime(''); setApptDateISO('');"
assert old in t, "reset anchor"
t = t.replace(old, new, 1)

open(path, "w", encoding="utf-8").write(t)
print("all patches applied")
