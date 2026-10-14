import { useEffect, useMemo, useState } from 'react'
import {
  CalendarClock, Phone, MessageCircle, RefreshCcw, Check, X, Inbox,
} from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeletons } from '@/components/ui/States'
import { Seo } from '@/components/seo/Seo'
import { useToast } from '@/components/ui/Toast'
import {
  fetchAllAppointments, adminSetAppointmentStatus, dayLabel,
  APPOINTMENT_STATUS_LABELS, type AppointmentRequest, type AppointmentStatus,
} from '@/services/appointments'
import { formatDate, waLink, cn } from '@/lib/utils'

const TABS: { key: 'all' | AppointmentStatus; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'new', label: 'جديدة' },
  { key: 'confirmed', label: 'مؤكدة' },
  { key: 'rejected', label: 'مرفوضة' },
  { key: 'done', label: 'منجزة' },
]

const statusStyle: Record<string, string> = {
  new: 'bg-gold-soft text-gold-dark',
  confirmed: 'bg-primary-light text-primary-dark',
  rejected: 'bg-wine-soft text-error',
  done: 'bg-subtle-strong text-muted',
}

export function AdminAppointmentsPage() {
  const toast = useToast()
  const [items, setItems] = useState<AppointmentRequest[] | null>(null)
  const [tab, setTab] = useState<'all' | AppointmentStatus>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    const list = await fetchAllAppointments()
    setItems(list)
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const list = items ?? []
    return tab === 'all' ? list : list.filter((a) => a.status === tab)
  }, [items, tab])

  const counts = useMemo(() => {
    const list = items ?? []
    return {
      all: list.length,
      new: list.filter((a) => a.status === 'new').length,
      confirmed: list.filter((a) => a.status === 'confirmed').length,
      rejected: list.filter((a) => a.status === 'rejected').length,
      done: list.filter((a) => a.status === 'done').length,
    }
  }, [items])

  const setStatus = async (a: AppointmentRequest, status: AppointmentStatus) => {
    setBusyId(a.id)
    const ok = await adminSetAppointmentStatus(a.id, status)
    setBusyId(null)
    if (ok) {
      setItems((prev) => (prev ?? []).map((x) => (x.id === a.id ? { ...x, status } : x)))
      toast.show('تم تحديث الحالة')
    } else {
      toast.show('تعذر التحديث', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <Seo title="طلبات المواعيد" description="مراقبة طلبات المواعيد الواردة للجهات" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">طلبات المواعيد</h1>
          <p className="mt-1 text-sm text-muted">كل طلبات المواعيد الواردة من صفحات الأطباء — للتأكد أن الأطباء يستجيبون لها.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} loading={items === null}>
          <RefreshCcw className="size-4" /> تحديث
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-black transition',
              tab === t.key ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-muted hover:border-primary/40',
            )}
          >
            {t.label} {counts[t.key] ? `(${counts[t.key]})` : ''}
          </button>
        ))}
      </div>

      {items === null ? (
        <Skeletons rows={4} box="!p-5" />
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody className="py-14 text-center">
            <Inbox className="mx-auto size-10 text-muted" />
            <h2 className="mt-4 text-lg font-black text-ink">لا توجد طلبات مواعيد بعد</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              عند إرسال أي مريض طلب موعد من صفحة طبيب سيظهر هنا مباشرة.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
                  <CalendarClock className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-ink">{a.doctor_name ?? 'طبيب'}</p>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold', statusStyle[a.status])}>
                      {APPOINTMENT_STATUS_LABELS[a.status]}
                    </span>
                    <span className="text-[11px] text-muted">{formatDate(a.created_at)}</span>
                  </div>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                    <span className="font-bold text-ink">المريض: {a.patient_name}</span>
                    <span className="inline-flex items-center gap-1"><CalendarClock className="size-3.5 text-primary" /> {dayLabel(a.preferred_day)}</span>
                    {a.preferred_time && <span>الوقت: {a.preferred_time}</span>}
                  </p>
                  {a.note && <p className="mt-1 text-xs leading-6 text-muted">ملاحظة: {a.note}</p>}
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted" dir="ltr">
                    <Phone className="size-3.5 shrink-0 text-primary" /> {a.patient_phone}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="whatsapp" asChild>
                    <a
                      href={waLink(a.patient_phone, `مرحباً ${a.patient_name}، بخصوص طلب الموعد لدى ${a.doctor_name ?? 'الطبيب'} يوم ${dayLabel(a.preferred_day)}`)}
                      target="_blank" rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-4" /> واتساب
                    </a>
                  </Button>
                  {a.status !== 'confirmed' && a.status !== 'done' && (
                    <Button size="sm" variant="outline" loading={busyId === a.id} onClick={() => void setStatus(a, 'confirmed')}>
                      <Check className="size-4" /> تأكيد
                    </Button>
                  )}
                  {a.status !== 'rejected' && a.status !== 'done' && (
                    <Button size="sm" variant="danger" loading={busyId === a.id} onClick={() => void setStatus(a, 'rejected')}>
                      <X className="size-4" /> رفض
                    </Button>
                  )}
                  {a.status === 'confirmed' && (
                    <Button size="sm" variant="outline" loading={busyId === a.id} onClick={() => void setStatus(a, 'done')}>
                      تم الحضور
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
