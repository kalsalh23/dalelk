import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, X, Phone, CreditCard, Crown, Sparkles, Lock, Copy } from 'lucide-react'
import { fetchAdminStats, fetchSubscriptionRequests, fetchSettings, saveSettings, updateRequestStatus } from '@/services/admin'
import type { UpdateRequestResult } from '@/services/admin'
import { fetchStatsSummary } from '@/services/stats'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeletons, EmptyState } from '@/components/ui/States'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Dialog } from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/Toast'
import { formatDate, formatNumber } from '@/lib/utils'
import { PLANS, SUBSCRIPTIONS_ENABLED } from '@/constants'
import { cn } from '@/lib/utils'

const planIcons: Record<string, typeof Sparkles> = { free: Lock, pro: Sparkles, gold: Crown }

export function AdminPlansPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [settings, setSettings] = useState<{ subscriptions_enabled: boolean } | null>(null)
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchAdminStats })
  const { data: reqs } = useQuery({ queryKey: ['admin-requests'], queryFn: fetchSubscriptionRequests })

  useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const s = await fetchSettings()
      setSettings({ subscriptions_enabled: Boolean(s.subscriptions_enabled) })
      return s
    },
  })

  const toggle = async () => {
    if (!settings) return
    const next = { subscriptions_enabled: !settings.subscriptions_enabled }
    const ok = await saveSettings(next)
    if (ok) {
      setSettings(next)
      await qc.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.show(next.subscriptions_enabled ? 'تم تفعيل الاشتراكات' : 'تم تعطيل الاشتراكات')
    } else {
      toast.show('تعذر التحديث', 'error')
    }
  }

  const enabled = settings?.subscriptions_enabled ?? SUBSCRIPTIONS_ENABLED
  const counts = { free: stats?.plans.free ?? 0, pro: stats?.plans.pro ?? 0, gold: stats?.plans.gold ?? 0 }
  const active = reqs?.filter((r) => r.status === 'approved').length ?? 0
  const expired = reqs?.filter((r) => r.status === 'rejected').length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">الاشتراكات</h1>
          <p className="mt-0.5 text-sm text-muted">
            {enabled ? 'الاشتراكات مفعّلة — تظهر باقات الترقية للزوار' : 'الاشتراكات معطّلة حالياً — الجميع على الباقة المجانية'}
          </p>
        </div>
        <Button size="sm" variant={enabled ? 'outline' : 'primary'} onClick={() => void toggle()}>
          {enabled ? 'تعطيل الاشتراكات' : 'تفعيل الاشتراكات'}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(['free', 'pro', 'gold'] as const).map((plan) => {
          const def = PLANS.find((p) => p.key === plan)!
          const Icon = planIcons[plan]
          return (
            <Card key={plan}>
              <CardBody>
                <Icon className={cn('size-6', plan === 'gold' ? 'text-amber-500' : plan === 'pro' ? 'text-primary' : 'text-muted')} />
                <p className="mt-2 font-black text-ink">{def.name}</p>
                <p className="mt-1 text-sm font-black text-ink">{formatNumber(counts[plan])} جهة</p>
                <ul className="mt-3 space-y-1 text-[11px] text-muted">
                  {def.features.slice(0, 3).map((f) => <li key={f} className="flex items-center gap-1"><Check className="size-3 text-success" />{f}</li>)}
                </ul>
              </CardBody>
            </Card>
          )
        })}
        <Card className="bg-gradient-to-l from-primary to-primary-dark text-white">
          <CardBody>
            <CreditCard className="size-6" />
            <p className="mt-2 font-black">ملخص عام</p>
            <p className="mt-2 text-sm">{formatNumber(active)} اشتراك نشط</p>
            <p className="text-sm">{formatNumber(expired)} منتهي</p>
            <p className="mt-2 text-xs text-teal-100">يُشغّل الاستلام المالي مستقبلاً بعد انتشار المنصة.</p>
          </CardBody>
        </Card>
      </div>

      {isLoading && <Skeletons rows={2} box="!p-6" />}
    </div>
  )
}

const statusStyle: Record<string, string> = {
  new: 'bg-sky-50 text-sky-700',
  contacting: 'bg-amber-50 text-amber-700',
  awaiting_payment: 'bg-orange-50 text-orange-700',
  approved: 'bg-emerald-50 text-success',
  rejected: 'bg-red-50 text-error',
}
const statusLabel: Record<string, string> = {
  new: 'جديد',
  contacting: 'تم التواصل',
  awaiting_payment: 'بانتظار الدفع',
  approved: 'موافق عليه',
  rejected: 'مرفوض',
}

export function AdminRequestsPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [selected, setSelected] = useState<{ id: string; status: string } | null>(null)
  const [creds, setCreds] = useState<UpdateRequestResult & { status: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const { data: requests, isLoading } = useQuery({ queryKey: ['admin-requests'], queryFn: fetchSubscriptionRequests })

  const mut = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const res = await updateRequestStatus(id, status as never, notes)
      if (!res.ok) throw new Error()
      return { res, status }
    },
    onSuccess: ({ res, status }) => {
      void qc.invalidateQueries({ queryKey: ['admin-requests'] })
      toast.show('تم تحديث الحالة')
      setSelected(null)
      if (status === 'approved') setCreds({ ...res, status })
    },
    onError: () => toast.show('تعذر التحديث', 'error'),
  })

  const accountLink = creds?.slug ? `${window.location.origin}/account/${creds.slug}` : ''

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1200)
    } catch {
      toast.show('تعذر النسخ', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">طلبات الترقية</h1>
        <p className="mt-0.5 text-sm text-muted">طلبات الأطباء والعيادات لترقية صفحه {requests?.length ? `(${requests.length})` : ''}</p>
      </div>

      {isLoading ? (
        <Skeletons rows={4} box="!p-5" />
      ) : !requests?.length ? (
        <EmptyState title="لا توجد طلبات" description="عند تفعيل الاشتراكات ستظهر هنا طلبات ترقية الصفحات." />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-black text-ink">{r.entity_type}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-muted" dir="ltr">{r.entity_id.slice(0, 8)}</span>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold', statusStyle[r.status])}>{statusLabel[r.status]}</span>
                </div>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-muted">
                  <span className="font-semibold text-ink">{r.current_plan === 'free' ? 'مجاني' : r.current_plan}</span>
                  ←
                  <span className="font-bold text-primary">{r.requested_plan === 'gold' ? 'ذهبي' : r.requested_plan === 'pro' ? 'احترافي' : 'مجاني'}</span>
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <Phone className="size-3.5 text-primary" />
                  <span dir="ltr">{r.phone ?? '—'}</span>
                  <span className="mx-1">·</span>
                  {formatDate(r.created_at)}
                </p>
                {r.notes && <p className="mt-1 text-xs text-muted">ملاحظات: {r.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setSelected({ id: r.id, status: 'contacting' })}>تم التواصل</Button>
                <Button size="sm" onClick={() => setSelected({ id: r.id, status: 'approved' })}>موافقة</Button>
                <Button size="sm" variant="outline" onClick={() => setSelected({ id: r.id, status: 'rejected' })}>رفض</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={selected !== null} onClose={() => setSelected(null)} title="تحديث حالة الطلب" size="sm">
        <div className="space-y-5">
          <p className="text-sm text-muted">اختر الحالة الجديدة وأضف ملاحظات إن لزم:</p>
          <StatusPicker
            onPick={(status, notes) => selected && mut.mutate({ id: selected.id, status, notes })}
            loading={mut.isPending}
          />
        </div>
      </Dialog>

      <Dialog open={creds !== null} onClose={() => setCreds(null)} title="تم تفعيل الاشتراك — بيانات دخول الجهة" size="md">
        <div className="space-y-5">
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-success">
            ✓ تم تفعيل الاشتراك وتم إنشاء حساب خاص بـ{creds?.name ? ` "${creds.name}"` : ' الجهة'}.
          </p>
          <p className="text-xs leading-6 text-muted">
            أرسل هذه البيانات للطبيب/الجهة عبر رقم الهاتف أو واتساب المذكور في الطلب ليتمكن من الدخول إلى لوحة تحكم صفحته.
          </p>
          <div className="space-y-3">
            <CredRow
              label="رابط لوحة التحكم"
              value={accountLink}
              copied={copied === 'link'}
              onCopy={() => void copy(accountLink, 'link')}
            />
            <CredRow label="البريد الإلكتروني" value={creds?.email ?? ''} copied={copied === 'email'} onCopy={() => void copy(creds?.email ?? '', 'email')} />
            <CredRow label="كلمة السر" value={creds?.password ?? ''} copied={copied === 'pass'} onCopy={() => void copy(creds?.password ?? '', 'pass')} />
          </div>
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => void copy(`${accountLink}\n${creds?.email ?? ''}\n${creds?.password ?? ''}`, 'all')}
          >
            {copied === 'all' ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied === 'all' ? 'تم نسخ الكل' : 'نسخ الرابط والبريد وكلمة السر معاً'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

function CredRow({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-slate-50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-ink" dir="ltr">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:text-primary cursor-pointer"
        aria-label={`نسخ ${label}`}
      >
        {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      </button>
    </div>
  )
}

function StatusPicker({ onPick, loading }: { onPick: (s: string, n?: string) => void; loading: boolean }) {
  const [notes, setNotes] = useState('')
  return (
    <div className="space-y-3">
      <Input placeholder="ملاحظات (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        {(['approved', 'rejected', 'awaiting_payment', 'contacting'] as const).map((s) => (
          <Button key={s} variant={s === 'approved' ? 'primary' : s === 'rejected' ? 'danger' : 'outline'} size="sm" loading={loading} onClick={() => onPick(s, notes)}>
            {s === 'approved' ? <Check className="size-4" /> : s === 'rejected' ? <X className="size-4" /> : null}
            {statusLabel[s]}
          </Button>
        ))}
      </div>
    </div>
  )
}

export function AdminStatsPage() {
  const { data: traffic, isLoading } = useQuery({ queryKey: ['admin-traffic'], queryFn: fetchStatsSummary })
  if (isLoading) return <Skeletons rows={5} box="!p-5" />
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">الإحصائيات</h1>
        <p className="mt-0.5 text-sm text-muted">سجل مجاني للأحداث الإحصائية لجميع المستخدمين</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          ['زيارات الصفحات', traffic?.pageViews ?? 0],
          ['عمليات البحث', traffic?.searches ?? 0],
          ['مشاهدات الملفات', traffic?.profileViews ?? 0],
          ['ضغطات الاتصال', traffic?.phoneClicks ?? 0],
          ['ضغطات واتساب', traffic?.whatsappClicks ?? 0],
          ['ضغطات الخريطة', traffic?.mapClicks ?? 0],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardBody className="text-center">
              <p className="text-3xl font-black text-primary">{formatNumber(Number(value))}</p>
              <p className="mt-1 text-xs font-bold text-muted">{label}</p>
            </CardBody>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>أكثر الصفحات مشاهدة</CardTitle></CardHeader>
        <CardBody>
          {!traffic?.topPages.length ? <p className="py-6 text-center text-sm text-muted">لا توجد بيانات بعد</p> : (
            <ul className="divide-y divide-border">
              {traffic.topPages.map((p, i) => (
                <li key={p.path} className="flex items-center gap-3 py-3">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary-light text-xs font-black text-primary-dark">{i + 1}</span>
                  <span className="flex-1 truncate text-sm font-semibold text-ink" dir="ltr">{p.path === '/' ? '/' : p.path}</span>
                  <span className="text-sm font-black text-ink">{formatNumber(p.count)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

export function AdminSettingsPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null)
  const [saving, setSaving] = useState(false)

  const { isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const s = await fetchSettings()
      setSettings({ subscriptions_enabled: Boolean(s.subscriptions_enabled), notification_email: String(s.notification_email ?? '') })
      return s
    },
  })

  const save = async () => {
    if (!settings) return
    setSaving(true)
    const ok = await saveSettings(settings)
    setSaving(false)
    if (ok) { await qc.invalidateQueries({ queryKey: ['admin-settings'] }); toast.show('تم حفظ الإعدادات') } else toast.show('تعذر الحفظ', 'error')
  }

  if (isLoading || !settings) return <Skeletons rows={4} box="!p-5" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">الإعدادات</h1>
        <p className="mt-0.5 text-sm text-muted">إعدادات عامة للمنصة</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            نظام الاشتراكات
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <Field label="تفعيل الاشتراكات" hint="في النسخة الأولى يكون معطلاً (false). عند التفعيل ستظهر خيارات الترقية للزوار."
            >
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="text-sm font-bold text-ink">{settings.subscriptions_enabled ? 'مفعّلة' : 'معطّلة'}</p>
                <p className="text-xs text-muted">عند التفعيل يعرض القطاع الحرفي Free Pro Gold</p>
              </div>
              <div onClick={() => setSettings((s) => ({ ...(s ?? {}), subscriptions_enabled: !settings.subscriptions_enabled }))} className={cn('relative h-7 w-12 rounded-full transition-colors', settings.subscriptions_enabled ? 'bg-primary' : 'bg-slate-300')}>
                <span className={cn('absolute top-1 size-5 rounded-full bg-white shadow transition-all', settings.subscriptions_enabled ? 'right-6' : 'right-1')} />
              </div>
            </label>
          </Field>
          <Field label="بريد إشعارات الطلبات">
            <Input type="email" value={String(settings.notification_email ?? '')} onChange={(e) => setSettings((s) => ({ ...(s ?? {}), notification_email: e.target.value }))} />
          </Field>
          <Button onClick={() => void save()} loading={saving}>حفظ الإعدادات</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>الأمان</CardTitle></CardHeader>
        <CardBody className="space-y-3 text-sm text-muted">
          <p>• الحسابات الإدارية تُدار عبر Supabase Auth.</p>
          <p>• طبقات الحماية RLS تفصل بين القراءة العامة والكتابة الإدارية.</p>
          <p>• لا تُخزَّن أي بيانات سرية داخل المتصفح؛ المفاتيح الحساسة تبقى في بيئة الخادم.</p>
        </CardBody>
      </Card>
    </div>
  )
}