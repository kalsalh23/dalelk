import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Send, PhoneCall, BadgeCheck, CreditCard, KeyRound, Crown, Sparkles,
  RefreshCw, Lock, Inbox, ArrowUpRight,
} from 'lucide-react'
import { fetchSiteSettings } from '@/services/site'
import {
  createSubscriptionRequest, checkRequestStatus,
  REQUEST_STATUS_LABELS, PENDING_REQUEST_STATUSES, type RequestStatusResult,
} from '@/services/admin'
import { fetchEntities } from '@/services/content'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { Skeletons } from '@/components/ui/States'
import { ENTITY_LABELS } from '@/constants'
import { Seo } from '@/components/seo/Seo'
import { cn, formatDate } from '@/lib/utils'
import type { EntityType } from '@/types'

const TYPE_OPTIONS = (Object.keys(ENTITY_LABELS) as EntityType[]).map((k) => ({
  value: k,
  label: ENTITY_LABELS[k],
}))

const NEXT_STEPS = [
  { icon: PhoneCall, title: 'نتواصل معك', text: 'تتواصل معك إدارة المنصة على الرقم الذي أدخلته للتأكيد وترتيب الاشتراك.' },
  { icon: BadgeCheck, title: 'الموافقة والتفعيل', text: 'بعد الموافقة تُفعّل باقتك لمدة شهر كامل من تاريخ الموافقة.' },
  { icon: KeyRound, title: 'استلام بيانات لوحتك', text: 'تصلك بيانات دخول لوحة تحكم جهتك لتدير ملفك وصورك بنفسك.' },
]

const statusStyle: Record<string, string> = {
  new: 'bg-gold-soft text-gold-dark',
  contacting: 'bg-primary-light text-primary-dark',
  awaiting_payment: 'bg-gold-soft text-gold-dark',
  approved: 'bg-primary text-white',
  rejected: 'bg-wine-soft text-error',
}

function StatusCard({ r }: { r: RequestStatusResult }) {
  const pending = r.status ? PENDING_REQUEST_STATUSES.includes(r.status) : false
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-ink">{r.entity_name ?? 'جهتك'}</p>
          <p className="mt-0.5 text-xs text-muted">
            طلب باقة {r.requested_plan === 'gold' ? 'ذهبية' : 'احترافية'} — {formatDate(r.created_at ?? null)}
          </p>
        </div>
        <span className={cn('rounded-full px-3.5 py-1.5 text-xs font-black', statusStyle[r.status ?? 'new'] ?? 'bg-subtle-strong text-muted')}>
          {REQUEST_STATUS_LABELS[r.status ?? ''] ?? r.status}
        </span>
      </div>
      {r.status === 'approved' && (
        <p className="rounded-xl bg-primary-light/50 px-4 py-3 text-xs leading-6 text-primary-dark">
          تمت الموافقة على طلبك وتفعيل الباقة لمدة شهر — تحقق من صفحتك، وبيانات دخول لوحتك وصلتك من الإدارة.
        </p>
      )}
      {pending && (
        <p className="rounded-xl bg-subtle px-4 py-3 text-xs leading-6 text-muted">
          طلبك ما يزال قيد المعالجة — لا داعي لإرسال طلب آخر، سنتواصل معك على رقمك في أقرب وقت.
        </p>
      )}
      {r.status === 'rejected' && (
        <p className="rounded-xl bg-wine-soft px-4 py-3 text-xs leading-6 text-error">
          تم رفض الطلب — يمكنك التواصل مع الإدارة لمعرفة السبب أو إرسال طلب جديد.
        </p>
      )}
    </div>
  )
}

export function UpgradeAccountPage() {
  const toast = useToast()
  const [params] = useSearchParams()
  const [tab, setTab] = useState<'new' | 'track'>('new')

  const [type, setType] = useState<EntityType>('doctor')
  const [search, setSearch] = useState('')
  const [entityId, setEntityId] = useState('')
  const [entityName, setEntityName] = useState('')
  const [requestedPlan, setRequestedPlan] = useState<'pro' | 'gold'>('pro')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const [trackPhone, setTrackPhone] = useState('')
  const [tracking, setTracking] = useState(false)
  const [tracked, setTracked] = useState<RequestStatusResult | null>(null)
  const [trackedError, setTrackedError] = useState('')

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  })
  const enabled = Boolean(settings?.subscriptions_enabled)

  const { data: results, isLoading: searching } = useQuery({
    queryKey: ['upgrade-search', type, search],
    queryFn: () => fetchEntities<{ id: string; name: string }>(type, { search, limit: 8 }),
    enabled: enabled && search.trim().length > 0,
    placeholderData: (prev) => prev,
  })

  // اختيار الباقة مسبقاً من رابط صفحة الباقات (?plan=gold)
  useEffect(() => {
    const p = params.get('plan')
    if (p === 'pro' || p === 'gold') setRequestedPlan(p)
  }, [params])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entityId) { toast.show('اختر الجهة من القائمة', 'error'); return }
    if (!phone.trim()) { toast.show('أدخل رقم الهاتف للتواصل', 'error'); return }
    setSending(true)
    // حماية من التكرار: هل يوجد طلب قيد المعالجة بنفس الرقم؟
    const existing = await checkRequestStatus(phone)
    if (existing?.found && existing.status && PENDING_REQUEST_STATUSES.includes(existing.status)) {
      setSending(false)
      setTrackPhone(phone)
      setTracked(existing)
      setTab('track')
      toast.show('لديك طلب قيد المراجعة بهذا الرقم بالفعل', 'error')
      return
    }
    const ok = await createSubscriptionRequest({
      entity_id: entityId,
      entity_type: type,
      current_plan: 'free',
      requested_plan: requestedPlan,
      phone: phone.trim(),
      notes: notes.trim() || undefined,
    })
    setSending(false)
    if (ok) {
      setDone(true)
      toast.show('تم إرسال طلب الترقية، سنتواصل معك قريباً')
    } else {
      toast.show('تعذر إرسال الطلب، حاول مجدداً', 'error')
    }
  }

  const track = async () => {
    if (!trackPhone.trim()) { toast.show('أدخل رقم الهاتف', 'error'); return }
    setTracking(true)
    setTrackedError('')
    const r = await checkRequestStatus(trackPhone)
    setTracking(false)
    if (!r) { setTrackedError('تعذر التحقق، حاول مجدداً'); return }
    if (!r.found) { setTrackedError('لا يوجد طلب ترقية مسجل بهذا الرقم.'); setTracked(null); return }
    setTracked(r)
  }

  const steps = useMemo(() => NEXT_STEPS, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Seo
        title="ترقية حسابي"
        description="أرسل طلب ترقية باقتك في دليل طيبة الإمام الطبي وتابع حالة طلبك — تفعيل لمدة شهر بعد الموافقة."
        path="/upgrade"
        type="website"
      />

      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-xs font-bold text-primary-dark">
          <ArrowUpRight className="size-3.5" />
          ترقية حسابي
        </span>
        <h1 className="mt-3 text-3xl font-black text-ink">ترقية حسابي في الدليل</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted">
          أرسل طلب ترقية باقتك، وسنتواصل معك لتأكيد الاشتراك — يُفعّل الاشتراك لمدة شهر كامل من تاريخ الموافقة.
        </p>
      </div>

      {/* خطوات ما بعد الطلب */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {steps.map((s, i) => (
          <Card key={s.title}>
            <CardBody className="p-4">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
                  <s.icon className="size-4.5" />
                </span>
                <span className="text-[10px] font-black text-muted">الخطوة {i + 1}</span>
              </div>
              <p className="mt-2.5 text-sm font-black text-ink">{s.title}</p>
              <p className="mt-1 text-xs leading-6 text-muted">{s.text}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {settingsLoading ? (
        <div className="mt-8"><Skeletons rows={4} box="!p-6" /></div>
      ) : !enabled ? (
        <Card className="mt-8">
          <CardBody className="py-14 text-center">
            <Lock className="mx-auto size-10 text-muted" />
            <h2 className="mt-4 text-xl font-black text-ink">الاشتراكات غير مفعّلة حالياً</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              حالياً جميع الجهات مدرجة على الباقة المجانية. عندما تُفعَّل الاشتراكات سيظهر نموذج طلب الترقية هنا.
            </p>
            <Link to="/" className="mt-6 inline-block text-sm font-bold text-primary hover:underline">العودة للرئيسية</Link>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* تبويبات */}
          <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl bg-subtle p-1.5">
            <button
              type="button"
              onClick={() => setTab('new')}
              className={cn(
                'flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition',
                tab === 'new' ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              <Sparkles className="size-4" /> طلب ترقية جديد
            </button>
            <button
              type="button"
              onClick={() => setTab('track')}
              className={cn(
                'flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition',
                tab === 'track' ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-ink',
              )}
            >
              <Inbox className="size-4" /> متابعة طلبي
            </button>
          </div>

          {tab === 'new' && (
            <Card className="mt-5">
              <CardBody>
                {done ? (
                  <div className="py-8 text-center">
                    <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-light text-primary-dark">
                      <BadgeCheck className="size-7" />
                    </span>
                    <h2 className="mt-4 text-xl font-black text-ink">تم إرسال طلبك بنجاح</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
                      طلب ترقية باقة {requestedPlan === 'gold' ? 'ذهبية' : 'احترافية'} قيد المراجعة الآن. سنتواصل معك على
                      <span className="font-bold text-ink" dir="ltr"> {phone}</span> لتأكيد الاشتراك.
                    </p>
                    <div className="mx-auto mt-5 max-w-sm space-y-2 text-right">
                      {steps.map((s, i) => (
                        <div key={s.title} className="flex items-start gap-2.5 rounded-xl bg-subtle px-4 py-2.5">
                          <s.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                          <p className="text-xs leading-6 text-muted"><strong className="text-ink">{i + 1}. {s.title}:</strong> {s.text}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      <Button variant="outline" onClick={() => { setTab('track'); setTrackPhone(phone); setTracked(null) }}>
                        <RefreshCw className="size-4" /> متابعة حالة طلبي
                      </Button>
                      <Button variant="ghost" onClick={() => { setDone(false); setEntityId(''); setEntityName(''); setSearch(''); setNotes('') }}>
                        طلب آخر
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-black text-ink">بيانات طلب الترقية</h2>
                    <p className="mt-1 text-sm text-muted">اختر جهتك والباقة المطلوبة، وسنتواصل معك على رقمك.</p>
                    <form onSubmit={submit} className="mt-5 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="نوع الجهة">
                          <Select value={type} onChange={(e) => { setType(e.target.value as EntityType); setEntityId(''); setEntityName(''); setSearch('') }}>
                            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </Select>
                        </Field>
                        <Field label="الباقة المطلوبة">
                          <Select value={requestedPlan} onChange={(e) => setRequestedPlan(e.target.value as 'pro' | 'gold')}>
                            <option value="pro">الباقة الاحترافية</option>
                            <option value="gold">الباقة الذهبية</option>
                          </Select>
                        </Field>
                      </div>

                      <Field label="جهتك (ابحث بالاسم)" required>
                        <Input value={search} onChange={(e) => { setSearch(e.target.value); setEntityId(''); setEntityName('') }} placeholder="اكتب اسم الطبيب أو الجهة…" />
                      </Field>

                      {search.trim().length > 0 && !entityId && (
                        <div className="overflow-hidden rounded-xl border border-border">
                          {searching ? (
                            <div className="p-3 text-center text-xs text-muted"><Search className="mx-auto size-4 animate-pulse" /> جارٍ البحث…</div>
                          ) : !results?.data.length ? (
                            <div className="p-3 text-center text-xs text-muted">لا توجد نتائج مطابقة — تأكد من وجود جهتك في الدليل أولاً.</div>
                          ) : (
                            <ul className="max-h-48 divide-y divide-border overflow-y-auto">
                              {results.data.map((r) => (
                                <li key={r.id}>
                                  <button
                                    type="button"
                                    onClick={() => { setEntityId(r.id); setEntityName(r.name) }}
                                    className="w-full cursor-pointer px-4 py-2.5 text-right text-sm font-semibold text-ink transition hover:bg-primary-light/40"
                                  >
                                    {r.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {entityId && (
                        <p className="flex items-center gap-2 rounded-xl bg-primary-light/40 px-4 py-2.5 text-sm font-bold text-primary-dark">
                          <BadgeCheck className="size-4" /> تم اختيار: {entityName}
                        </p>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="رقم الهاتف للتواصل" required>
                          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xx xxx xxx" dir="ltr" />
                        </Field>
                        <Field label="ملاحظات (اختياري)">
                          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي تفاصيل إضافية…" />
                        </Field>
                      </div>

                      <Button type="submit" loading={sending} className="w-full sm:w-auto">
                        <Send className="size-4" />
                        إرسال طلب الترقية
                      </Button>
                    </form>
                  </>
                )}
              </CardBody>
            </Card>
          )}

          {tab === 'track' && (
            <Card className="mt-5">
              <CardBody>
                <h2 className="text-lg font-black text-ink">متابعة حالة الطلب</h2>
                <p className="mt-1 text-sm text-muted">أدخل نفس رقم الهاتف الذي أرسلت به الطلب لعرض حالته الأخيرة.</p>
                <form
                  onSubmit={(e) => { e.preventDefault(); void track() }}
                  className="mt-4 flex flex-col gap-3 sm:flex-row"
                >
                  <Input
                    type="tel"
                    value={trackPhone}
                    onChange={(e) => setTrackPhone(e.target.value)}
                    placeholder="09xx xxx xxx"
                    dir="ltr"
                    className="flex-1"
                  />
                  <Button type="submit" loading={tracking} variant="outline">
                    <Inbox className="size-4" /> عرض الحالة
                  </Button>
                </form>

                {trackedError && (
                  <p className="mt-4 rounded-xl bg-wine-soft px-4 py-3 text-xs font-bold text-error">{trackedError}</p>
                )}
                {tracked?.found && (
                  <div className="mt-4 rounded-2xl border border-border bg-subtle p-4">
                    <StatusCard r={tracked} />
                  </div>
                )}

                <p className="mt-5 flex items-start gap-2 text-xs leading-6 text-muted">
                  <CreditCard className="mt-0.5 size-4 shrink-0 text-primary" />
                  تُفعّل الباقة لمدة شهر من تاريخ الموافقة، وعند انتهائها يمكنك التقديم على تجديد جديد من هنا أو من لوحة تحكم جهتك.
                </p>
              </CardBody>
            </Card>
          )}

          {/* دعوة لأصحاب الحسابات */}
          <Card className="mt-6 border-primary/20 bg-primary-light/30">
            <CardBody className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-surface text-primary shadow-sm">
                  <Crown className="size-5" />
                </span>
                <p className="text-sm font-bold text-ink">لديك حساب جهة وتدير ملفك من لوحة التحكم؟</p>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-black text-primary hover:underline"
              >
                التجديد من لوحتك <ArrowUpRight className="size-4" />
              </Link>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
