import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, LayoutGrid } from 'lucide-react'
import { SERVICES, DEFAULT_CITY } from '@/constants'
import { countLabel } from '@/lib/utils'
import { SectionTitle } from '@/components/ui/Breadcrumbs'
import { ServiceIcon } from '@/components/ui/EntityIcon'
import { useEntities, useDutyPharmacies } from '@/hooks/useEntities'
import { cn } from '@/lib/utils'

const CARD_BG: Record<string, string> = {
  emerald: 'bg-emerald-100/70 text-emerald-700',
  teal: 'bg-teal-100/70 text-teal-700',
  sky: 'bg-sky-100/70 text-sky-700',
  green: 'bg-green-100/70 text-green-700',
  indigo: 'bg-indigo-100/70 text-indigo-700',
  amber: 'bg-amber-100/70 text-amber-700',
  rose: 'bg-rose-100/70 text-rose-700',
  orange: 'bg-orange-100/70 text-orange-700',
}

export function ServicesGrid() {
  const counts: Record<string, number | undefined> = {
    doctor: useEntities('doctor', { limit: 1 }).data?.count,
    clinic: useEntities('clinic', { limit: 1 }).data?.count,
    hospital: useEntities('hospital', { limit: 1 }).data?.count,
    pharmacy: useEntities('pharmacy', { limit: 1 }).data?.count,
    lab: useEntities('lab', { limit: 1 }).data?.count,
    radiology: useEntities('radiology', { limit: 1 }).data?.count,
    health_center: useEntities('health_center', { limit: 1 }).data?.count,
  }
  const dutyCount = useDutyPharmacies().data?.length ?? 0

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
      <SectionTitle
        title="الخدمات الرئيسية"
        subtitle={`كل الخدمات الطبية في مدينة ${DEFAULT_CITY}`}
        icon={<LayoutGrid className="size-5" />}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((svc, i) => (
          <motion.div
            key={svc.key}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.35) }}
          >
            <Link to={svc.route} className="group block h-full">
              <div className="flex h-full flex-col rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-primary/30 group-hover:shadow-xl">
                <div className={cn('mb-4 flex size-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110', CARD_BG[svc.color])}>
                  <ServiceIcon name={svc.icon} className="size-7" />
                </div>
                <h3 className="text-lg font-black text-ink group-hover:text-primary">{svc.name}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-6 text-muted">{svc.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-muted">
                    {svc.key === 'duty'
                      ? dutyCount > 0
                        ? `${dutyCount} ${countLabel(dutyCount).split(' ').slice(-1)[0]} اليوم`
                        : 'اليوم'
                      : counts[svc.key] != null
                        ? countLabel(counts[svc.key]!)
                        : '…'}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-primary">
                    تصفح
                    <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}