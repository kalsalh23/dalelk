import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Phone, MapPin, ExternalLink, Clock } from 'lucide-react'
import { useDutyPharmacies } from '@/hooks/useEntities'
import { SectionTitle } from '@/components/ui/Breadcrumbs'
import { Card } from '@/components/ui/Card'
import { EmptyState, Skeletons } from '@/components/ui/States'
import { formatDateShort, todaySQL } from '@/lib/utils'
import { track } from '@/services/stats'

export function DutyPharmacies() {
  const { data, isLoading } = useDutyPharmacies(null)
  const today = todaySQL()

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <SectionTitle
        title="صيدليات مناوبة اليوم"
        subtitle={`مناوبات يوم ${formatDateShort(today)} — تُحدَّث من إدارة المنصة`}
        icon={<Moon className="size-5" />}
      />
      {isLoading ? (
        <Skeletons rows={3} />
      ) : !data?.length ? (
        <EmptyState
          title="لا توجد مناوبات مسجلة اليوم"
          description="لا توجد صيدليات مناوبة محددّة لهذا اليوم حتى الآن."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((d, i) => {
            const ph = d.pharmacy
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.06, 0.3) }}
              >
                <Card className="relative overflow-hidden border-primary/20">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-primary to-teal-300" />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-ink">{ph?.name ?? 'صيدلية'}</h3>
                        <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                          {ph?.address ?? d.notes}
                        </p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-[11px] font-black text-primary-dark">
                        <Moon className="size-3.5" />
                        مناوبة
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-xs">
                      <span className="flex items-center gap-1.5 text-muted"><Clock className="size-3.5" />ساعات المناوبة</span>
                      <span className="font-bold text-primary-dark">{d.duty_hours ?? 'خلال الليل'}</span>
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
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ph?.address ?? '')}`}
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
      )}

      <div className="mt-6 text-center">
        <Link to="/duty-pharmacies" className="text-sm font-bold text-primary hover:underline">
          عرض كل الصيدليات المناوبة
        </Link>
      </div>
    </section>
  )
}