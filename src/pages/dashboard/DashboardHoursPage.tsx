import { useEffect, useState } from 'react'
import { Clock, Save, Trash2 } from 'lucide-react'
import { useDashboardSession } from '@/layouts/DashboardLayout'
import { readStoredSession, updateEntityOwn } from '@/services/entityAccount'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { Seo } from '@/components/seo/Seo'

const DAYS = [
  { key: 'sat', label: 'السبت' },
  { key: 'sun', label: 'الأحد' },
  { key: 'mon', label: 'الاثنين' },
  { key: 'tue', label: 'الثلاثاء' },
  { key: 'wed', label: 'الأربعاء' },
  { key: 'thu', label: 'الخميس' },
  { key: 'fri', label: 'الجمعة' },
]

export function DashboardHoursPage() {
  const { session, setSession } = useDashboardSession()
  const toast = useToast()
  const [workHours, setWorkHours] = useState<Record<string, string>>({})
  const [openingHours, setOpeningHours] = useState('')
  const [saving, setSaving] = useState(false)
  const isPharmacyLike = session?.entity_type === 'pharmacy' || session?.entity_type === 'lab' || session?.entity_type === 'radiology'

  useEffect(() => {
    if (!session?.entity) return
    const e = session.entity as Record<string, unknown>
    const wh = e.work_hours as Record<string, unknown> | null
    if (wh && typeof wh === 'object') {
      const normalized: Record<string, string> = {}
      for (const [k, v] of Object.entries(wh)) normalized[k] = String(v ?? '')
      setWorkHours(normalized)
    } else setWorkHours({})
    setOpeningHours(String((e.opening_hours as string) ?? ''))
  }, [session])

  const updateDay = (key: string, val: string) => setWorkHours((prev) => ({ ...prev, [key]: val }))

  const save = async () => {
    const stored = readStoredSession()
    if (!stored) return
    setSaving(true)
    const fields: Record<string, unknown> = {}
    if (isPharmacyLike) {
      fields.opening_hours = openingHours.trim() || null
      // أيضاً نحفظ work_hours إن وجد
      if (Object.keys(workHours).some((k) => workHours[k]?.trim())) fields.work_hours = workHours
      else fields.work_hours = null
    } else {
      // نظف الفارغ
      const cleaned: Record<string, string> = {}
      for (const d of DAYS) {
        const v = (workHours[d.key] ?? '').trim()
        if (v) cleaned[d.key] = v
      }
      fields.work_hours = Object.keys(cleaned).length ? cleaned : null
    }
    const ok = await updateEntityOwn(stored.token, fields)
    setSaving(false)
    if (ok) {
      toast.show('تم حفظ أوقات الدوام')
      setSession((prev) => prev ? { ...prev, entity: { ...(prev.entity ?? {}), ...fields } as Record<string, unknown> } : prev)
    } else toast.show('تعذر الحفظ', 'error')
  }

  if (!session) return null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Seo title="أوقات الدوام" description="تعديل أوقات الدوام" />
      <div>
        <h1 className="text-xl font-black text-ink">أوقات الدوام</h1>
        <p className="mt-1 text-sm text-muted">حدّد ساعات العمل لكل يوم — اترك الحقل فارغاً أو اكتب "مغلق" ليوم الإغلاق.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="size-4 text-primary" /> الجدول الأسبوعي</CardTitle></CardHeader>
        <CardBody className="space-y-4">
          {isPharmacyLike ? (
            <>
              <Field label="ساعات العمل (نص حر) " hint="مثال: يومياً 9 صباحاً - 11 مساءً، الجمعة مغلق">
                <Textarea rows={3} value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} placeholder="9:00 ص - 10:00 م" />
              </Field>
              <div className="rounded-xl bg-slate-50 p-4 text-xs text-muted">
                يمكنك أيضاً تعبئة الجدول اليومي أدناه وسيظهر كجدول مفصّل في صفحتك.
              </div>
            </>
          ) : null}

          <div className="grid gap-3">
            {DAYS.map((d) => (
              <div key={d.key} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm font-bold text-ink">{d.label}</span>
                <Input
                  className="flex-1"
                  dir="ltr"
                  placeholder='مثال: 9:00 - 17:00  أو  مغلق'
                  value={workHours[d.key] ?? ''}
                  onChange={(e) => updateDay(d.key, e.target.value)}
                />
                <button
                  onClick={() => updateDay(d.key, 'مغلق')}
                  className="shrink-0 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted hover:bg-slate-50"
                  type="button"
                >
                  مغلق
                </button>
                <button onClick={() => updateDay(d.key, '')} className="shrink-0 text-muted hover:text-error" type="button">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-primary-light/60 px-4 py-3 text-xs leading-6 text-primary-dark">
            <Clock className="size-4 shrink-0" />
            نصيحة: استخدم صيغة "9:00 - 14:00 ، 16:00 - 20:00" للفترتين الصباحية والمسائية.
          </div>

          <Button onClick={() => void save()} loading={saving}><Save className="size-4" /> حفظ الأوقات</Button>
        </CardBody>
      </Card>
    </div>
  )
}
