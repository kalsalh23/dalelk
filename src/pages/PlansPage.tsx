import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check, Crown, Sparkles, Lock, Send, Search } from 'lucide-react'
import { fetchSiteSettings } from '@/services/site'
import { createSubscriptionRequest } from '@/services/admin'
import { fetchEntities } from '@/services/content'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { Skeletons } from '@/components/ui/States'
import { PLANS, ENTITY_LABELS } from '@/constants'
import { Seo } from '@/components/seo/Seo'
import { cn } from '@/lib/utils'
import type { EntityType } from '@/types'

const TYPE_OPTIONS = (Object.keys(ENTITY_LABELS) as EntityType[]).map((k) => ({
  value: k,
  label: ENTITY_LABELS[k],
}))

const planIcon: Record<string, typeof Sparkles> = { free: Lock, pro: Sparkles, gold: Crown }
const planColor: Record<string, string> = {
  free: 'bg-slate-100 text-slate-600',
  pro: 'bg-primary-light text-primary-dark',
  gold: 'bg-amber-100 text-amber-700',
}

export function PlansPage() {
  const toast = useToast()
  const [type, setType] = useState<EntityType>('doctor')
  const [search, setSearch] = useState('')
  const [entityId, setEntityId] = useState('')
  const [entityName, setEntityName] = useState('')
  const [requestedPlan, setRequestedPlan] = useState<'free' | 'pro' | 'gold'>('pro')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  })
  const enabled = Boolean(settings?.subscriptions_enabled)

  const { data: results, isLoading: searching } = useQuery({
    queryKey: ['plans-search', type, search],
    queryFn: () => fetchEntities<{ id: string; name: string }>(type, { search, limit: 8 }),
    enabled: enabled && search.trim().length > 0,
    placeholderData: (prev) => prev,
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entityId) { toast.show('اختر الجهة من القائمة', 'error'); return }
    if (!phone.trim()) { toast.show('أدخل رقم الهاتف للتواصل', 'error'); return }
    setSending(true)
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

  const highlight = useMemo(() => requestedPlan, [requestedPlan])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Seo title="الاشتراكات والترقية" description="باقات الاشتراك لترقية ظهور صفحتك في دليل طيبة الإمام الطبي." />
      <div className="text-center">
        <h1 className="text-3xl font-black text-ink">باقات الاشتراك</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted">
          ارتقِ بظهور صفحتك في الدليل — اختر الباقة التي تناسبك وأرسل طلب الترقية وسنتواصل معك.
        </p>
      </div>

      {settingsLoading ? (
        <Skeletons rows={3} box="!p-6" />
      ) : !enabled ? (
        <Card className="mt-8">
          <CardBody className="py-14 text-center">
            <Lock className="mx-auto size-10 text-muted" />
            <h2 className="mt-4 text-xl font-black text-ink">الاشتراكات غير مفعّلة حالياً</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              حالياً جميع الجهات مدرجة على الباقة المجانية. عندما تُفعَّل الاشتراكات سيظهر هذا القسم مع خيارات الترقية.
            </p>
            <Link to="/" className="mt-6 inline-block text-sm font-bold text-primary hover:underline">العودة للرئيسية</Link>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((p) => {
              const Icon = planIcon[p.key]
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setRequestedPlan(p.key as 'free' | 'pro' | 'gold')}
                  className={cn(
                    'cursor-pointer rounded-[20px] border-2 p-6 text-right transition-all',
                    highlight === p.key ? 'border-primary bg-primary-light/30 shadow-lg' : 'border-border bg-surface hover:border-primary/40',
                    p.key === 'gold' && 'lg:-translate-y-2',
                  )}
                >
                  <div className={cn('mb-4 inline-flex size-12 items-center justify-center rounded-2xl', planColor[p.key])}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-black text-ink">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted">{p.description}</p>
                  <ul className="mt-4 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <span className={cn('mt-5 block rounded-xl py-2.5 text-center text-sm font-black', highlight === p.key ? 'bg-primary text-white' : 'bg-slate-50 text-muted')}>
                    {highlight === p.key ? '✓ الباقة المختارة' : 'اختيار'}
                  </span>
                </button>
              )
            })}
          </div>

          <Card className="mt-8">
            <CardBody>
              <h2 className="text-lg font-black text-ink">إرسال طلب الترقية</h2>
              <p className="mt-1 text-sm text-muted">اختر الجهة التي تريد ترقيتها واملأ بيانات التواصل وسيصلك رد من إدارة المنصة.</p>
              <form onSubmit={submit} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="نوع الجهة">
                    <Select value={type} onChange={(e) => { setType(e.target.value as EntityType); setEntityId(''); setEntityName(''); setSearch('') }}>
                      {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                  </Field>
                  <Field label="الجهة (ابحث بالاسم)">
                    <Input value={search} onChange={(e) => { setSearch(e.target.value); setEntityId(''); setEntityName('') }} placeholder="اكتب اسم الطبيب أو الجهة…" />
                  </Field>
                </div>

                {search.trim().length > 0 && !entityId && (
                  <div className="overflow-hidden rounded-xl border border-border">
                    {searching ? (
                      <div className="p-3 text-center text-xs text-muted"><Search className="mx-auto size-4 animate-pulse" /> جارٍ البحث…</div>
                    ) : !results?.data.length ? (
                      <div className="p-3 text-center text-xs text-muted">لا توجد نتائج مطابقة.</div>
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
                    تم اختيار: {entityName}
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

                {done ? (
                  <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-success">✓ تم إرسال طلبك بنجاح، سنتواصل معك بأقرب وقت.</div>
                ) : (
                  <Button type="submit" loading={sending} className="w-full sm:w-auto">
                    <Send className="size-4" />
                    إرسال طلب الترقية
                  </Button>
                )}
              </form>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
