import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  LogOut, KeyRound, ShieldCheck, AlertTriangle, Sparkles, RefreshCcw,
  Save, CalendarClock,
} from 'lucide-react'
import {
  buildEntityEmail, entityDisplayName, entityDisplayType,
  entityLogin, fetchEntitySession, updateEntityOwn, magicLogin,
  readStoredSession, clearStoredSession, type EntitySessionData,
} from '@/services/entityAccount'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { PlanBadge } from '@/components/ui/Badge'
import { FullPageLoader } from '@/components/ui/States'
import { formatDate } from '@/lib/utils'
import { Seo } from '@/components/seo/Seo'

function daysLeft(expires: string | null): number | null {
  if (!expires) return null
  const diff = new Date(expires).getTime() - Date.now()
  return Math.ceil(diff / (24 * 3600 * 1000))
}

function ExpiryBanner({ plan, expires }: { plan: string | null; expires: string | null }) {
  const days = daysLeft(expires)
  if (plan === 'free' || days === null) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-slate-50 p-4">
        <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-bold text-ink">أنت على الباقة المجانية</p>
          <p className="mt-1 text-xs leading-6 text-muted">
            اشترك لتفعيل شارة الباقة وإبراز صفحتك في الدليل. يمكنك طلب الترقية من صفحة الباقات.
          </p>
        </div>
      </div>
    )
  }
  if (days < 0) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-error/20 bg-red-50 p-4">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-error" />
        <div>
          <p className="text-sm font-bold text-error">انتهى اشتراكك</p>
          <p className="mt-1 text-xs leading-6 text-muted">جدّد اشتراكك للحفاظ على مزايا الباقة وظهور صفحتك المميّز.</p>
          <Link to="/plans" className="mt-2 inline-block text-xs font-bold text-error hover:underline">طلب تجديد →</Link>
        </div>
      </div>
    )
  }
  if (days <= 30) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-bold text-amber-700">اشتراكك سينتهي خلال {days} يوم</p>
          <p className="mt-1 text-xs leading-6 text-muted">
            اشتراكك الحالي (الذهبي) ينتهي بتاريخ {formatDate(expires)} — جدّده لتفادي توقف المزايا.
          </p>
          <Link to="/plans" className="mt-2 inline-block text-xs font-bold text-amber-700 hover:underline">طلب تجديد ←</Link>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-slate-50 p-4">
      <CalendarClock className="mt-0.5 size-5 shrink-0 text-primary" />
      <div>
        <p className="text-sm font-bold text-ink">اشتراكك نشط</p>
        <p className="mt-1 text-xs leading-6 text-muted">ينتهي بتاريخ {formatDate(expires)} — تبقّى {days} يوم.</p>
      </div>
    </div>
  )
}

export function AccountPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const [autoEmail, setAutoEmail] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [logging, setLogging] = useState(false)
  const [checking, setChecking] = useState(true)
  const [session, setSession] = useState<EntitySessionData | null>(null)
  const [badLogin, setBadLogin] = useState(false)

  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (slug) setAutoEmail(buildEntityEmail(slug))
  }, [slug])

  useEffect(() => {
    const stored = readStoredSession()
    if (!stored || (slug && stored.slug !== slug)) {
      setChecking(false)
      return
    }
    void fetchEntitySession(stored.token)
      .then((d) => {
        if (d && (!slug || d.slug === slug)) {
          setSession(d)
          const e = d.entity ?? {}
          const workHours = e.work_hours
          setForm({
            name: String(e.name ?? ''),
            specialty: String(e.specialty ?? ''),
            phone: String(e.phone ?? ''),
            whatsapp: String(e.whatsapp ?? ''),
            address: String(e.address ?? ''),
            bio: String(e.bio ?? e.description ?? ''),
            services: Array.isArray(e.services) ? e.services.join('، ') : String(e.services ?? ''),
            video_url: String(e.video_url ?? ''),
            instagram: String(e.instagram ?? ''),
            facebook: String(e.facebook ?? ''),
            work_hours: workHours ? JSON.stringify(workHours, null, 2) : '',
          })
        }
      })
      .finally(() => setChecking(false))
  }, [slug])

  useEffect(() => {
    const tk = searchParams.get('tk')
    if (!tk) return
    setSearchParams((p) => {
      const q = new URLSearchParams(p)
      q.delete('tk')
      return q
    }, { replace: true })
    void magicLogin(tk)
      .then((s) => {
        if (!s) { toast.show('رابط الدخول غير صالح أو منتهي', 'error'); return }
        return fetchEntitySession(s.token)
          .then((d) => {
            if (d) {
              setSession(d)
              const e = d.entity ?? {}
              setForm({
                name: String(e.name ?? ''),
                specialty: String(e.specialty ?? ''),
                phone: String(e.phone ?? ''),
                whatsapp: String(e.whatsapp ?? ''),
                address: String(e.address ?? ''),
                bio: String(e.bio ?? e.description ?? ''),
                services: Array.isArray(e.services) ? e.services.join('، ') : String(e.services ?? ''),
                video_url: String(e.video_url ?? ''),
                instagram: String(e.instagram ?? ''),
                facebook: String(e.facebook ?? ''),
                work_hours: e.work_hours ? JSON.stringify(e.work_hours, null, 2) : '',
              })
            }
          })
      })
      .finally(() => setChecking(false))
  }, [searchParams, setSearchParams, toast])

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPass) { toast.show('أدخل البريد وكلمة السر', 'error'); return }
    setLogging(true)
    setBadLogin(false)
    const s = await entityLogin(loginEmail, loginPass)
    setLogging(false)
    if (!s) { setBadLogin(true); toast.show('بيانات الدخول غير صحيحة', 'error'); return }
    const d = await fetchEntitySession(s.token)
    if (d) {
      setSession(d)
      const ent = d.entity ?? {}
      setForm({
        name: String(ent.name ?? ''),
        specialty: String(ent.specialty ?? ''),
        phone: String(ent.phone ?? ''),
        whatsapp: String(ent.whatsapp ?? ''),
        address: String(ent.address ?? ''),
        bio: String(ent.bio ?? ent.description ?? ''),
        services: Array.isArray(ent.services) ? ent.services.join('، ') : String(ent.services ?? ''),
        video_url: String(ent.video_url ?? ''),
        instagram: String(ent.instagram ?? ''),
        facebook: String(ent.facebook ?? ''),
        work_hours: ent.work_hours ? JSON.stringify(ent.work_hours, null, 2) : '',
      })
    }
  }

  const logout = () => {
    clearStoredSession()
    setSession(null)
    setLoginPass('')
  }

  const save = async () => {
    const stored = readStoredSession()
    if (!stored || !session) return
    setSaving(true)
    const fields: Record<string, unknown> = {
      name: form.name,
      phone: form.phone,
      whatsapp: form.whatsapp,
      address: form.address,
      video_url: form.video_url || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
    }
    const label = session.entity_type === 'doctor' ? 'bio' : 'description'
    fields[label] = form.bio
    if (session.entity_type === 'doctor') fields.specialty = form.specialty
    const services = form.services.split(/[،,،\n]/).map((s) => s.trim()).filter(Boolean)
    fields.services = services
    let workHours: Record<string, string> | null = null
    if (form.work_hours.trim()) {
      try {
        const parsed = JSON.parse(form.work_hours)
        if (parsed && typeof parsed === 'object') workHours = parsed as Record<string, string>
      } catch {
        toast.show('صيغة ساعات الدوام غير صحيحة (يجب أن تكون JSON)', 'error')
        setSaving(false)
        return
      }
    }
    fields.work_hours = workHours
    const ok = await updateEntityOwn(stored.token, fields)
    setSaving(false)
    if (ok) {
      toast.show('تم حفظ التغييرات')
      setSession((prev) =>
        prev ? { ...prev, entity: { ...(prev.entity ?? {}), ...fields } as unknown as Record<string, unknown> } : prev,
      )
    } else {
      toast.show('تعذر الحفظ، حاول مجدداً', 'error')
    }
  }

  if (checking) return <FullPageLoader label="جارٍ التحقق…" />

  const routeLink = session?.entity_type === 'health_center'
    ? 'health-centers'
    : session?.entity_type === 'radiology'
      ? 'radiology'
      : `${session?.entity_type ?? ''}s`

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Seo title="حساب الجهة" description="لوحة تحكم خاصة بالطبيب أو العيادة أو المخبر في دليلك الطبي." />

      {!session ? (
        <Card>
          <CardBody className="py-10">
            <div className="mx-auto max-w-sm">
              <div className="mb-5 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-3xl bg-primary text-white">
                  <KeyRound className="size-7" />
                </div>
                <h1 className="text-xl font-black text-ink">دخول الجهة</h1>
                <p className="mt-1 text-sm text-muted">
                  أدخل البريد وكلمة السر الخاصين بك للوصول إلى لوحة تحكم صفحتك.
                </p>
              </div>
              <form onSubmit={(e) => void doLogin(e)} className="space-y-4">
                <Field label="البريد الإلكتروني">
                  <Input
                    type="text"
                    dir="ltr"
                    placeholder={autoEmail || 'admin-...@gmail.com'}
                    value={loginEmail}
                    onChange={(e) => { setLoginEmail(e.target.value); setBadLogin(false) }}
                  />
                </Field>
                <Field label="كلمة السر">
                  <Input
                    type="password"
                    dir="ltr"
                    placeholder="كلمة السر المرسلة لك"
                    value={loginPass}
                    onChange={(e) => { setLoginPass(e.target.value); setBadLogin(false) }}
                  />
                </Field>
                {badLogin && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-error">بيانات الدخول غير صحيحة</p>}
                <Button type="submit" loading={logging} className="w-full">
                  <KeyRound className="size-4" />
                  دخول
                </Button>
              </form>
              <p className="mt-4 text-center text-[11px] leading-5 text-muted">
                بيانات الدخول تُسلَّم لك عند تفعيل اشتراكك من قبل إدارة المنصة.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          <Seo title={`لوحة تحكم ${entityDisplayName(session.entity)}`} description="لوحة تحكم الجهة" />

          <div className="flex flex-col gap-4 rounded-[18px] border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
                <ShieldCheck className="size-7" />
              </div>
              <div>
                <h1 className="text-xl font-black text-ink">{entityDisplayName(session.entity)}</h1>
                <p className="mt-0.5 flex items-center gap-2 text-sm text-muted">
                  {entityDisplayType(session.entity_type)}
                  <PlanBadge plan={String(session.entity?.plan ?? 'free')} />
                </p>
                <p className="mt-1 text-xs text-muted" dir="ltr">{session.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={logout}>
                <LogOut className="size-4" />
                خروج
              </Button>
              <Button size="sm" asChild>
                <Link to={`/${routeLink}/${session.slug}`}>عرض صفحتي</Link>
              </Button>
            </div>
          </div>

          <ExpiryBanner plan={String(session.entity?.plan ?? 'free')} expires={session.entity?.plan_expires_at as string | null} />

          <Card>
            <CardHeader>
              <CardTitle>تعديل بيانات الصفحة</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="الاسم">
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </Field>
                {session.entity_type === 'doctor' && (
                  <Field label="الاختصاص">
                    <Input value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} />
                  </Field>
                )}
                <Field label="الهاتف">
                  <Input dir="ltr" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </Field>
                <Field label="واتساب">
                  <Input dir="ltr" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} />
                </Field>
                <Field label="العنوان">
                  <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                </Field>
                <Field label="رابط الفيديو التعريفي">
                  <Input dir="ltr" value={form.video_url} onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))} placeholder="https://…" />
                </Field>
              </div>
              <div className="mt-4 space-y-4">
                <Field label="نبذة تعريفية">
                  <Textarea rows={4} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
                </Field>
                <Field label="الخدمات (افصل بينها بفاصلة)">
                  <Textarea rows={2} value={form.services} onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))} />
                </Field>
                <Field label={'ساعات الدوام (JSON بصيغة {"sat":"9-17"}...)'}>
                  <Textarea rows={3} dir="ltr" value={form.work_hours} onChange={(e) => setForm((f) => ({ ...f, work_hours: e.target.value }))} placeholder='{"sat":"9:00 - 17:00","sun":"9:00 - 17:00","fri":"مغلق"}' />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="انستغرام">
                    <Input dir="ltr" value={form.instagram} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))} />
                  </Field>
                  <Field label="فيسبوك">
                    <Input dir="ltr" value={form.facebook} onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))} />
                  </Field>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => void save()} loading={saving}>
                  <Save className="size-4" />
                  حفظ التغييرات
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/plans">
                    <RefreshCcw className="size-4" />
                    طلب تجديد / ترقية
                  </Link>
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      <p className="mt-8 text-center text-[11px] text-muted">
        لوحة تحكم الجهات في دليلك الطبي — <Link to="/" className="hover:underline">العودة للرئيسية</Link>
      </p>
    </div>
  )
}