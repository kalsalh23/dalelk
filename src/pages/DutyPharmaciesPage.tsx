import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Phone, MapPin, ExternalLink, Clock, CalendarDays } from 'lucide-react'
import { useDutyPharmacies } from '@/hooks/useEntities'
import { Breadcrumbs, SectionTitle } from '@/components/ui/Breadcrumbs'
import { Card } from '@/components/ui/Card'
import { EmptyState, Skeletons } from '@/components/ui/States'
import { formatDateShort, todaySQL } from '@/lib/utils'
import { track } from '@/services/stats'
import { Seo } from '@/components/seo/Seo'
import type { DutyPharmacy } from '@/types'

export function DutyPharmaciesPage() {
  const { data, isLoading } = useDutyPharmacies(null)
  const today = todaySQL()

  const grouped = useMemo(() => {
    const map = new Map<string, DutyPharmacy[]>()
    for (const d of data ?? []) map.set(d.end_date, [...(map.get(d.end_date) ?? []), d])
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))
  }, [data])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Seo
        title="الصيدليات المناوبة"
        description="تعرف على الصيدليات المناوبة اليوم في مدينة طيبة الإمام مع أوقات المناوبة وأرقام الهاتف والعناوين."
        path="/duty-pharmacies"
      />
      <Breadcrumbs items={[{ label: 'الصيدليات المناوبة' }]} />
      <div className="mb-6 mt-3 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
          <Moon className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-ink">الصيدليات المناوبة</h1>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <CalendarDays className="size-4" />
            مناوبات اليوم {formatDateShort(today)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeletons rows={4} />
      ) : !data?.length ? (
        <EmptyState
          title="لا توجد مناوبات مسجلة اليوم"
          description="لم تُحدَّد أي صيدلية مناوبة لهذا اليوم بعد. تتوفر المناوبات عادة خارج أوقات الدوام الرسمي."
        />
      ) : (
        <div className="space-y-8">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <SectionTitle
                title={`حتى ${formatDateShort(date)}`}
                icon={<Clock className="size-5" />}
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((d, i) => {
                  const ph = d.pharmacy
                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.06, 0.3) }}
                    >
                      <Card className="h-full border-primary/20">
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-black text-ink">{ph?.name ?? 'صيدلية'}</h3>
                            <span className="shrink-0 rounded-full bg-primary-light px-3 py-1 text-[11px] font-black text-primary-dark">
                              مناوبة
                            </span>
                          </div>
                          {ph?.address ? (
                            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted">
                              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                              {ph.address}
                            </p>
                          ) : null}
                          <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-muted"><Clock className="size-4" />ساعات المناوبة</span>
                              <span className="font-bold text-primary-dark">{d.duty_hours ?? 'خلال الليل'}</span>
                            </div>
                            {d.notes ? <p className="text-xs text-muted">{d.notes}</p> : null}
                          </div>
                          <div className="mt-4 flex gap-2">
                            {ph?.phone ? (
                              <a
                                href={`tel:${ph.phone}`}
                                onClick={() => void track('phone_click', { entityType: 'pharmacy', entityId: ph.id })}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark"
                              >
                                <Phone className="size-4" />
                                اتصال
                              </a>
                            ) : null}
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ph?.address ?? 'طيبة الإمام')}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary-light/40 px-4 py-2.5 text-sm font-bold text-primary-dark transition hover:bg-primary-light"
                            >
                              <ExternalLink className="size-4" />
                              فتح الخريطة
                            </a>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-primary/20 bg-primary-light/30 p-5 text-center text-sm text-muted">
        هل تحتاج صيدلية في وقت متأخر؟
        <Link to="/ask" className="mx-1 font-bold text-primary hover:underline">اسأل دليلك الطبي</Link>
        وسنجيبك في أقرب وقت.
      </div>
    </div>
  )
}