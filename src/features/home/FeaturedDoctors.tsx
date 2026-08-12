import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Star, MapPin, Phone, Crown } from 'lucide-react'
import { useFeaturedDoctors } from '@/hooks/useEntities'
import { SectionTitle } from '@/components/ui/Breadcrumbs'
import { EmptyState, Skeletons } from '@/components/ui/States'
import { getPublicUrl } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { MAP_COLORS } from '@/constants'
import { EntityIcon } from '@/components/ui/EntityIcon'

const PER_PAGE = 2

export function FeaturedDoctors() {
  const { data, isLoading } = useFeaturedDoctors(8)
  const doctors = (data ?? []) as unknown as Array<Record<string, unknown>>
  const [page, setPage] = useState(0)
  const pages = Math.max(1, Math.ceil(doctors.length / PER_PAGE))
  const clamped = Math.min(page, pages - 1)
  const visible = doctors.slice(clamped * PER_PAGE, clamped * PER_PAGE + PER_PAGE)

  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
      <SectionTitle
        title="الأطباء المميّزون"
        subtitle="نخبة مختارة من أطباء المدينة — يقدّمون خدماتهم قربك"
        icon={<Star className="size-5" />}
      />
      {isLoading ? (
        <Skeletons rows={1} box="!p-6" />
      ) : !doctors.length ? (
        <EmptyState
          title="لا يوجد أطباء مميّزون بعد"
          description="سيظهر هنا الأطباء الذين تختارهم إدارة المنصة عبر لوحة التحكم."
        />
      ) : (
        <div className="relative">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visible.map((doc, i) => (
              <motion.div
                key={String(doc.id)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
              >
                <FeaturedDoctorCard doc={doc} index={clamped * PER_PAGE + i} />
              </motion.div>
            ))}
          </div>

          {doctors.length > PER_PAGE && (
            <>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={clamped === 0}
                aria-label="السابق"
                className={cn(
                  'absolute -right-2 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/20 bg-white text-primary shadow-lg transition hover:bg-primary hover:text-white md:flex',
                  clamped === 0 && 'pointer-events-none opacity-0',
                )}
              >
                <ChevronRight className="size-5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                disabled={clamped >= pages - 1}
                aria-label="التالي"
                className={cn(
                  'absolute -left-2 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-primary/20 bg-white text-primary shadow-lg transition hover:bg-primary hover:text-white md:flex',
                  clamped >= pages - 1 && 'pointer-events-none opacity-0',
                )}
              >
                <ChevronLeft className="size-5" />
              </button>

              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={clamped === 0}
                  aria-label="السابق"
                  className="flex size-9 items-center justify-center rounded-full border border-border bg-surface text-ink transition hover:bg-primary hover:text-white md:hidden disabled:opacity-30"
                >
                  <ChevronRight className="size-4.5" />
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      aria-label={`صفحة ${i + 1}`}
                      className={cn('h-2 rounded-full transition-all', i === clamped ? 'w-6 bg-primary' : 'w-2 bg-slate-200 hover:bg-slate-300')}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                  disabled={clamped >= pages - 1}
                  aria-label="التالي"
                  className="flex size-9 items-center justify-center rounded-full border border-border bg-surface text-ink transition hover:bg-primary hover:text-white md:hidden disabled:opacity-30"
                >
                  <ChevronLeft className="size-4.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link to="/doctors" className="text-sm font-bold text-primary hover:underline">
          عرض كل الأطباء
        </Link>
      </div>
    </section>
  )
}

function FeaturedDoctorCard({ doc, index }: { doc: Record<string, unknown>; index: number }) {
  const navigate = useNavigate()
  const id = String(doc.id)
  const slug = String(doc.slug ?? '')
  const name = String(doc.name ?? '')
  const specialty = (doc.specialty as string) ?? null
  const address = (doc.address as string) ?? null
  const phone = (doc.phone as string) ?? null
  const image = getPublicUrl(doc.image as string)
  const link = `/doctors/${slug || id}`
  const color = MAP_COLORS.doctor

  return (
    <div
      onClick={() => navigate(link)}
      className="group relative cursor-pointer overflow-hidden rounded-[22px] border border-primary/25 bg-gradient-to-l from-primary-light/40 via-surface to-surface shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-primary via-teal-400 to-amber-400" />
      <div className="absolute -left-10 -top-10 size-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
      <div className="flex gap-4 p-5 sm:p-6">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-primary-light/50 sm:size-28">
          {image ? (
            <img src={image} alt={name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ color }}>
              <EntityIcon type="doctor" className="size-12" />
            </div>
          )}
          <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-white shadow">
            <Star className="size-3 fill-white" />
            مميّز
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Crown className="size-4 shrink-0 text-amber-500" />
            <p className="truncate text-lg font-black text-ink transition-colors group-hover:text-primary">{name}</p>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-muted">
            <span className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} />
            {specialty ?? 'طبيب'}
          </p>
          {doc.experience_years ? (
            <p className="mt-0.5 text-xs text-muted">خبرة {Number(doc.experience_years)} سنوات</p>
          ) : null}
          {address ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
              <MapPin className="size-3.5 shrink-0 text-primary" />
              <span className="line-clamp-1">{address}</span>
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {phone ? (
              <a
                href={`tel:${phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-dark"
              >
                <Phone className="size-3.5" />
                <span dir="ltr">{phone}</span>
              </a>
            ) : null}
            <span className="flex items-center gap-1 text-xs font-bold text-primary">
              <Star className="size-3.5 fill-amber-400 text-amber-500" />
              طبيب مميّز
            </span>
          </div>
        </div>
      </div>
      <span className="pointer-events-none absolute left-0 top-0 p-2 text-[9px] font-black text-primary/20">{index + 1}</span>
    </div>
  )
}
