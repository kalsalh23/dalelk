import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MapPin, Phone, Crown } from 'lucide-react'
import { useFeaturedDoctors } from '@/hooks/useEntities'
import { SectionTitle } from '@/components/ui/Breadcrumbs'
import { EmptyState, Skeletons } from '@/components/ui/States'
import { getPublicUrl } from '@/lib/supabase'
import { MAP_COLORS } from '@/constants'
import { EntityIcon } from '@/components/ui/EntityIcon'
import { AutoCarousel } from '@/components/shared/AutoCarousel'

export function FeaturedDoctors() {
  const { data, isLoading } = useFeaturedDoctors(8)
  const doctors = (data ?? []) as unknown as Array<Record<string, unknown>>

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
        <AutoCarousel count={doctors.length} ariaLabel="الأطباء المميزون">
          {doctors.map((doc, i) => (
            <motion.div
              key={String(doc.id)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="h-full"
            >
              <FeaturedDoctorCard doc={doc} index={i} />
            </motion.div>
          ))}
        </AutoCarousel>
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
      className="group relative h-full cursor-pointer overflow-hidden rounded-[22px] border border-primary/25 bg-gradient-to-l from-primary-light/40 via-surface to-surface shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-primary via-gold to-gold-dark" />
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
          <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-gold-dark px-2 py-0.5 text-[10px] font-black text-white shadow">
            <Star className="size-3 fill-white" />
            مميّز
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Crown className="size-4 shrink-0 text-gold-dark" />
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
              <Star className="size-3.5 fill-gold text-gold-dark" />
              طبيب مميّز
            </span>
          </div>
        </div>
      </div>
      <span className="pointer-events-none absolute left-0 top-0 p-2 text-[9px] font-black text-primary/20">{index + 1}</span>
    </div>
  )
}
