import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Eye, Phone, MessageCircle, MapPin, Share2, CalendarClock, RefreshCcw, Sparkles } from 'lucide-react'
import { useDashboardSession } from '@/layouts/DashboardLayout'
import { readStoredSession, fetchEntityStats, type EntityStatsState } from '@/services/entityAccount'
import { Card, CardBody } from '@/components/ui/Card'
import { Skeletons } from '@/components/ui/States'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/components/seo/Seo'
import { formatDate } from '@/lib/utils'

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Eye; label: string; value: number; accent?: string }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4 p-5">
        <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${accent ?? 'bg-primary-light text-primary-dark'}`}>
          <Icon className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-muted">{label}</p>
          <p className="text-2xl font-black text-ink">{value}</p>
        </div>
      </CardBody>
    </Card>
  )
}

/** إحصائيات صفحة الجهة: زيارات، نقرات التواصل، المشاركات، والمواعيد */
export function DashboardStatsPage() {
  const { session } = useDashboardSession()
  const [data, setData] = useState<EntityStatsState | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const token = readStoredSession()?.token
    if (!token) return
    setLoading(true)
    setData(await fetchEntityStats(token))
    setLoading(false)
  }

  useEffect(() => {
    if (session) void load()
    else setLoading(false)
  }, [session])

  if (!session) {
    return (
      <Card>
        <CardBody className="p-10 text-center">
          <h1 className="text-lg font-black text-ink">سجّل دخولك أولاً</h1>
          <Link to="/dashboard/login" className="mt-4 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark">
            صفحة الدخول
          </Link>
        </CardBody>
      </Card>
    )
  }

  const isDoctor = data?.entity_type === 'doctor'
  const trend = data?.trend ?? []
  const maxTrend = Math.max(1, ...trend.map((t) => t.count))

  return (
    <div className="space-y-6">
      <Seo title="إحصائياتي" description="إحصائيات صفحتي في دليل طيبة الإمام الطبي" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-ink">
            <BarChart3 className="size-6 text-primary" />
            إحصائياتي
          </h1>
          <p className="mt-1 text-sm text-muted">تفاعل الزوار مع صفحتك العامة — تحدَّث تلقائياً مع كل زيارة.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} loading={loading}>
          <RefreshCcw className="size-4" /> تحديث
        </Button>
      </div>

      {loading ? (
        <Skeletons rows={4} />
      ) : !data || data.error ? (
        <Card><CardBody className="p-6 text-sm text-error">{data?.error ?? 'تعذر جلب الإحصائيات'}</CardBody></Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard icon={Eye} label="زيارات صفحتك (الإجمالي)" value={data.view_count ?? 0} />
            <StatCard icon={Phone} label="نقرات الاتصال" value={data.phone_clicks ?? 0} accent="bg-emerald-50 text-success" />
            <StatCard icon={MessageCircle} label="نقرات واتساب" value={data.whatsapp_clicks ?? 0} accent="bg-green-50 text-green-700" />
            <StatCard icon={MapPin} label="فتح الموقع على الخريطة" value={data.map_clicks ?? 0} accent="bg-gold-soft text-gold-dark" />
            <StatCard icon={Share2} label="مشاركات صفحتك" value={data.shares ?? 0} accent="bg-sky-50 text-sky-700" />
            {isDoctor ? (
              <StatCard icon={CalendarClock} label="طلبات المواعيد (الجديدة بأولوية)" value={data.appointments_total ?? 0} accent="bg-wine-soft text-error" />
            ) : null}
          </div>

          {isDoctor && (data.appointments_new ?? 0) > 0 && (
            <Link to="/dashboard/appointments">
              <Card className="border-gold/40 bg-gold-soft/60 transition hover:border-gold">
                <CardBody className="flex items-center gap-3 p-4">
                  <Sparkles className="size-5 shrink-0 text-gold-dark" />
                  <p className="flex-1 text-sm font-bold text-gold-dark">
                    لديك {data.appointments_new} طلب موعد جديد بانتظار مراجعتك
                  </p>
                  <span className="text-xs font-black text-primary">مراجعة الطلبات ←</span>
                </CardBody>
              </Card>
            </Link>
          )}

          <Card>
            <CardBody className="p-5 sm:p-6">
              <h2 className="mb-1 flex items-center gap-2 text-base font-black text-ink">
                <Eye className="size-4.5 text-primary" />
                مشاهدات ملفك خلال 14 يوماً
              </h2>
              <p className="mb-5 text-xs text-muted">عدد الزوار الفريدين يومياً (منع التكرار داخل نفس الجلسة).</p>
              {!trend.length ? (
                <p className="rounded-xl bg-subtle p-4 text-center text-sm text-muted">لا توجد مشاهدات مسجلة خلال الأسبوعين الأخيرين — شارك رابط صفحتك لزيادة الزيارات.</p>
              ) : (
                <div className="flex h-40 items-end gap-1.5" dir="ltr">
                  {trend.map((t) => (
                    <div key={t.day} className="group flex flex-1 flex-col items-center gap-1">
                      <span className="text-[10px] font-black text-primary opacity-0 transition group-hover:opacity-100">{t.count}</span>
                      <div
                        className="w-full rounded-t-lg bg-primary/70 transition-all group-hover:bg-primary"
                        style={{ height: `${Math.max(6, (t.count / maxTrend) * 110)}px` }}
                        title={`${t.day}: ${t.count}`}
                      />
                      <span className="text-[8px] font-bold text-muted" dir="ltr">{t.day.slice(5)}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-4 text-[11px] text-muted">آخر تحديث: {formatDate(new Date().toISOString())}</p>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
