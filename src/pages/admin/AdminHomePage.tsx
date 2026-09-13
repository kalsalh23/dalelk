import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, BarChart3 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchAdminStats } from '@/services/admin'
import { fetchStatsSummary } from '@/services/stats'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeletons } from '@/components/ui/States'
import { formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STAT_CARDS = [
  { table: 'doctors', label: 'الأطباء', to: '/admin/doctors', color: 'emerald' },
  { table: 'clinics', label: 'العيادات', to: '/admin/clinics', color: 'teal' },
  { table: 'hospitals', label: 'المشافي', to: '/admin/hospitals', color: 'sky' },
  { table: 'health_centers', label: 'المراكز الصحية', to: '/admin/health-centers', color: 'amber' },
  { table: 'pharmacies', label: 'الصيدليات', to: '/admin/pharmacies', color: 'green' },
  { table: 'labs', label: 'المخابر', to: '/admin/labs', color: 'orange' },
  { table: 'radiology_centers', label: 'مراكز الأشعة', to: '/admin/radiology', color: 'rose' },
]

const colorStyles: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-primary-light/70', text: 'text-primary-dark' },
  teal: { bg: 'bg-primary-light', text: 'text-primary-dark' },
  sky: { bg: 'bg-gold-soft', text: 'text-gold-dark' },
  amber: { bg: 'bg-gold-soft/70', text: 'text-gold-dark' },
  green: { bg: 'bg-primary-light/50', text: 'text-primary-dark' },
  orange: { bg: 'bg-gold-soft/50', text: 'text-gold-dark' },
  rose: { bg: 'bg-wine-soft', text: 'text-wine' },
}

export function AdminHomePage() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchAdminStats })
  const { data: traffic } = useQuery({ queryKey: ['admin-traffic'], queryFn: fetchStatsSummary })

  const maxPage = useMemo(() => Math.max(1, ...(traffic?.topPages.map((p) => p.count) ?? [1])), [traffic])

  const evMetrics = useMemo(
    () => [
      { label: 'زيارات الصفحات', value: traffic?.pageViews ?? 0, icon: Eye, color: 'text-primary' },
      { label: 'عمليات البحث', value: traffic?.searches ?? 0, icon: BarChart3, color: 'text-primary' },
      { label: 'ضغطات الاتصال', value: traffic?.phoneClicks ?? 0, icon: ArrowLeft, color: 'text-success' },
      { label: 'ضغطات واتساب', value: traffic?.whatsappClicks ?? 0, icon: ArrowLeft, color: 'text-primary' },
      { label: 'ضغطات الخريطة', value: traffic?.mapClicks ?? 0, icon: ArrowLeft, color: 'text-warning' },
      { label: 'مشاهدات الملفات', value: traffic?.profileViews ?? 0, icon: Eye, color: 'text-wine' },
    ],
    [traffic],
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-ink">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-muted">نظرة عامة على محتوى المنصة وإحصاءات الزوار.</p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4">
        {isLoading || !stats ? (
          <div className="col-span-full grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeletons key={i} rows={1} box="!p-5" />)}
          </div>
        ) : (
          <>
            <MetricCard to="/admin/articles" label="المقالات" value={stats.articles} color="violet" />
            <MetricCard to="/admin/questions" label="الأسئلة والأجوبة" value={stats.questions} color="sky" />
            <MetricCard to="/admin/unanswered" label="أسئلة غير مجاب عنها" value={stats.unanswered} color="amber" />
            <MetricCard to="/admin/requests" label="طلبات الترقية" value={stats.requests} color="rose" />
          </>
        )}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-black text-ink">الأدلة الطبية</h2>
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {STAT_CARDS.map((c) => (
            <Link key={c.table} to={c.to}>
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <CardBody className="p-4">
                  <p className="text-2xl font-black text-ink sm:text-3xl">{isLoading ? '—' : formatNumber(stats?.entities[c.table] ?? 0)}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-bold text-muted">
                    <span className={cn('size-2 rounded-full', colorStyles[c.color].bg)} />
                    <span className={colorStyles[c.color].text}>{c.label}</span>
                  </p>
                  <span className="mt-2 flex items-center gap-0.5 text-[11px] font-semibold text-primary">إدارة <ArrowLeft className="size-3" /></span>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid min-w-0 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="size-5 text-primary" />حركة الموقع</CardTitle></CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {evMetrics.map((m) => (
                <div key={m.label} className="rounded-2xl bg-subtle p-3.5 sm:p-4">
                  <m.icon className={cn('size-5', m.color)} />
                  <p className="mt-2 text-xl font-black text-ink sm:text-2xl">{formatNumber(m.value)}</p>
                  <p className="text-[11px] font-semibold text-muted sm:text-xs">{m.label}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="size-5 text-primary" />أكثر الصفحات مشاهدة</CardTitle></CardHeader>
          <CardBody>
            {!traffic?.topPages.length ? (
              <p className="py-8 text-center text-sm text-muted">لا توجد بيانات بعد.</p>
            ) : (
              <div className="space-y-3">
                {traffic.topPages.map((p) => (
                  <div key={p.path}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="truncate font-semibold text-ink" dir="ltr">{p.path === '/' ? 'الرئيسية' : p.path}</span>
                      <span className="font-bold text-muted">{p.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-subtle-strong">
                      <div className="h-full rounded-full bg-gradient-to-l from-primary to-gold transition-all" style={{ width: `${(p.count / maxPage) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-black text-ink">توزيع الباقات</h2>
        <Card>
          <CardBody>
            {isLoading || !stats ? (
              <Skeletons rows={1} box="!p-5" />
            ) : (
              <div className="flex flex-wrap gap-4">
                {[
                  { label: 'مجاني', value: stats.plans.free, color: 'bg-faint' },
                  { label: 'احترافي', value: stats.plans.pro, color: 'bg-primary' },
                  { label: 'ذهبي', value: stats.plans.gold, color: 'bg-gold-soft0' },
                ].map((p) => {
                  const total = stats.plans.free + stats.plans.pro + stats.plans.gold
                  const pct = total ? Math.round((p.value / total) * 100) : 0
                  return (
                    <div key={p.label} className="flex-1 rounded-2xl bg-subtle p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-muted">{p.label}</span>
                        <span className="text-lg font-black text-ink">{p.value}</span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-subtle-strong">
                        <div className={cn('h-full rounded-full', p.color)} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-[11px] text-muted">{pct}%</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/admin/stats" className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-dark">
          <BarChart3 className="size-4.5" />
          عرض الإحصائيات التفصيلية
        </Link>
        <Link to="/admin/settings" className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-sm font-bold text-ink hover:bg-subtle">
          الإعدادات
        </Link>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color, to }: { label: string; value: number; color: string; to: string }) {
  const palette: Record<string, string> = {
    violet: 'bg-wine-soft/70 text-wine-dark',
    sky: 'bg-gold-soft text-gold-dark',
    amber: 'bg-gold-soft/70 text-gold-dark',
    rose: 'bg-wine-soft text-wine',
  }
  return (
    <Link to={to} className="min-w-0">
      <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <CardBody className="p-4">
          <div className={cn('mb-2 inline-flex max-w-full truncate rounded-lg px-2 py-1 text-[10px] font-black', palette[color])}>{label} ↑</div>
          <p className="text-xl font-black text-ink sm:text-2xl">{formatNumber(value)}</p>
        </CardBody>
      </Card>
    </Link>
  )
}