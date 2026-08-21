import { Link } from 'react-router-dom'
import { Crown, Eye, CalendarClock, AlertTriangle, Sparkles, ArrowUpRight, Image as ImageIcon, Clock, MapPin, Phone, Star } from 'lucide-react'
import { useDashboardSession } from '@/layouts/DashboardLayout'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PlanBadge } from '@/components/ui/Badge'
import { formatDate, mapsLink } from '@/lib/utils'
import { getPublicUrl } from '@/lib/supabase'
import { Seo } from '@/components/seo/Seo'

function daysLeft(exp: string | null): number | null {
  if (!exp) return null
  const diff = new Date(exp).getTime() - Date.now()
  return Math.ceil(diff / (24 * 3600 * 1000))
}

export function DashboardHomePage() {
  const { session } = useDashboardSession()
  if (!session) return null
  const e = (session.entity ?? {}) as Record<string, unknown>
  const plan = String(e.plan ?? 'free')
  const expires = (e.plan_expires_at as string | null) ?? null
  const days = daysLeft(expires)
  const views = Number(e.view_count ?? 0)
  const routeLink = session.entity_type === 'health_center' ? 'health-centers' : session.entity_type === 'radiology' ? 'radiology' : `${session.entity_type}s`
  const img = getPublicUrl((e.image as string) ?? null) ?? (e.image as string) ?? null

  return (
    <div className="space-y-6">
      <Seo title="لوحة التحكم" description="لوحة تحكم الجهة" />
      <div>
        <h1 className="text-2xl font-black text-ink">مرحباً، {String(e.name ?? session.slug)}</h1>
        <p className="mt-1 text-sm text-muted">هنا يمكنك إدارة ملفك بالكامل — الصور، أوقات الدوام، الموقع، والبيانات.</p>
      </div>

      {/* expiry / plan banner */}
      {plan === 'free' || days === null ? (
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-slate-50 p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-bold text-ink">أنت على الباقة المجانية <PlanBadge plan={plan} /></p>
            <p className="mt-1 text-xs leading-6 text-muted">اشترك لتفعيل شارة الباقة وإبراز صفحتك في النتائج والخريطة.</p>
          </div>
          <Button asChild size="sm"><Link to="/plans">عرض الباقات <ArrowUpRight className="size-4" /></Link></Button>
        </div>
      ) : days < 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-error/20 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 size-5 text-error" />
          <div className="flex-1">
            <p className="text-sm font-bold text-error">انتهى اشتراكك</p>
            <p className="text-xs text-muted">جدّد اشتراكك للحفاظ على مزايا الباقة.</p>
          </div>
          <Button variant="danger" size="sm" asChild><Link to="/plans">طلب تجديد</Link></Button>
        </div>
      ) : days <= 30 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="size-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-700">اشتراكك سينتهي خلال {days} يوم</p>
            <p className="text-xs text-muted">ينتهي بتاريخ {formatDate(expires)}.</p>
          </div>
          <Button size="sm" variant="outline" asChild><Link to="/plans">طلب تجديد</Link></Button>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4">
          <CalendarClock className="size-5 text-primary" />
          <div>
            <p className="text-sm font-bold text-ink">اشتراكك نشط <PlanBadge plan={plan} /></p>
            <p className="text-xs text-muted">ينتهي {formatDate(expires)} — تبقّى {days} يوم</p>
          </div>
        </div>
      )}

      {/* stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardBody className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-primary-light text-primary"><Eye className="size-5" /></div><div><p className="text-xs text-muted">المشاهدات</p><p className="text-xl font-black text-ink">{views.toLocaleString('ar-SY')}</p></div></CardBody></Card>
        <Card><CardBody className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><Crown className="size-5" /></div><div><p className="text-xs text-muted">الباقة</p><p className="text-sm font-bold text-ink flex items-center gap-2"><PlanBadge plan={plan} /> {plan === 'gold' ? 'ذهبية' : plan === 'pro' ? 'احترافية' : 'مجانية'}</p></div></CardBody></Card>
        <Card><CardBody className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Star className="size-5" /></div><div><p className="text-xs text-muted">التقييم</p><p className="text-lg font-black text-ink">{String((e.rating as string) ?? '—')}</p></div></CardBody></Card>
      </div>

      {/* quick overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>نظرة سريعة على ملفك</CardTitle></CardHeader>
          <CardBody className="space-y-4">
            <div className="flex gap-4">
              <div className="size-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-slate-100">
                {img ? <img src={img} alt="" className="size-full object-cover" /> : <div className="flex size-full items-center justify-center text-muted"><ImageIcon className="size-8" /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-ink">{String(e.name ?? '—')}</h3>
                <p className="text-xs text-muted line-clamp-2">{String((e.bio as string) ?? (e.description as string) ?? 'لا توجد نبذة بعد — أضفها من تبويب الملف الشخصي')}</p>
                <p className="mt-1 flex flex-wrap gap-2 text-xs">
                  {(e.phone as string | null) ? <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-muted"><Phone className="size-3" /> {String(e.phone)}</span> : null}
                  {(e.address as string | null) ? <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-muted"><MapPin className="size-3" /> {String(e.address)}</span> : null}
                </p>
              </div>
            </div>
            {(e.services as string[] | null)?.length ? (
              <div className="flex flex-wrap gap-2">{(e.services as string[]).slice(0, 6).map((s) => <span key={s} className="rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-primary-dark">{s}</span>)} {(e.services as string[]).length > 6 ? <span className="text-xs text-muted">+{ (e.services as string[]).length - 6 } أخرى</span> : null}</div>
            ) : <p className="text-xs text-muted">لم تضف خدمات بعد.</p>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild><Link to="/dashboard/profile">تعديل الملف</Link></Button>
              <Button size="sm" variant="outline" asChild><Link to="/dashboard/media"><ImageIcon className="size-4" /> إدارة الصور</Link></Button>
              <Button size="sm" variant="outline" asChild><Link to={`/${routeLink}/${session.slug}`}><Eye className="size-4" /> معاينة الصفحة</Link></Button>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>إجراءات سريعة</CardTitle></CardHeader>
            <CardBody className="grid gap-2">
              <Link to="/dashboard/profile" className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-bold hover:bg-slate-50"><Phone className="size-4 text-primary" /> تحديث الهاتف والعنوان</Link>
              <Link to="/dashboard/hours" className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-bold hover:bg-slate-50"><Clock className="size-4 text-primary" /> تعديل أوقات الدوام</Link>
              <Link to="/dashboard/location" className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-bold hover:bg-slate-50"><MapPin className="size-4 text-primary" /> تحديد الموقع على الخريطة</Link>
              <a href={mapsLink(e.lat as number | null, e.lng as number | null, e.address as string | null)} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark"><MapPin className="size-4" /> عرض موقعي على خرائط Google</a>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-xs leading-6 text-muted">
              <p className="font-bold text-ink">ملاحظة</p>
              <p className="mt-1">أي تعديل تحفظه يظهر مباشرة على صفحتك العامة بعد إعادة تحميلها. الصور تُرفع تلقائياً وتُحفظ في التخزين الآمن.</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
