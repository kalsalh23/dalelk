import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MapPin, Phone, Crown, Pill } from 'lucide-react'
import { useFeaturedPharmacies } from '@/hooks/useEntities'
import { SectionTitle } from '@/components/ui/Breadcrumbs'
import { EmptyState, Skeletons } from '@/components/ui/States'
import { getPublicUrl } from '@/lib/supabase'
import { MAP_COLORS } from '@/constants'
import { EntityIcon } from '@/components/ui/EntityIcon'
import { AutoCarousel } from '@/components/shared/AutoCarousel'

export function FeaturedPharmacies() {
  const { data, isLoading } = useFeaturedPharmacies(8)
  const pharmacies = (data ?? []) as unknown as Array<Record<string, unknown>>

  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
      <SectionTitle
        title="الصيدليات المميّزة"
        subtitle="صيدليات مختارة تخدمك بأفضل ما يكون — أدويتك قربك دائماً"
        icon={<Pill className="size-5" />}
      />
      {isLoading ? (
        <Skeletons rows={1} box="!p-6" />
      ) : !pharmacies.length ? (
        <EmptyState
          title="لا توجد صيدليات مميّزة بعد"
          description="ستظهر هنا الصيدليات التي تختارها إدارة المنصة عبر لوحة التحكم."
        />
      ) : (
        <AutoCarousel count={pharmacies.length} accent="gold" ariaLabel="الصيدليات المميزة">
          {pharmacies.map((ph, i) => (
            <motion.div
              key={String(ph.id)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="h-full"
            >
              <FeaturedPharmacyCard ph={ph} index={i} />
            </motion.div>
          ))}
        </AutoCarousel>
      )}

      <div className="mt-6 text-center">
        <Link to="/pharmacies" className="text-sm font-bold text-primary hover:underline">
          عرض كل الصيدليات
        </Link>
      </div>
    </section>
  )
}

function FeaturedPharmacyCard({ ph, index }: { ph: Record<string, unknown>; index: number }) {
  const navigate = useNavigate()
  const id = String(ph.id)
  const slug = String(ph.slug ?? '')
  const name = String(ph.name ?? '')
  const address = (ph.address as string) ?? null
  const phone = (ph.phone as string) ?? null
  const image = getPublicUrl(ph.image as string)
  const link = `/pharmacies/${slug || id}`
  const color = MAP_COLORS.pharmacy

  return (
    <div
      onClick={() => navigate(link)}
      className="group relative h-full cursor-pointer overflow-hidden rounded-[22px] border border-gold/40 bg-gradient-to-l from-gold-soft/50 via-surface to-surface shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-xl"
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-gold to-gold-dark" />
      <div className="absolute -left-10 -top-10 size-32 rounded-full bg-gold/10 blur-2xl transition-all group-hover:bg-gold/20" />
      <div className="flex gap-4 p-5 sm:p-6">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-gold-soft/60 sm:size-28">
          {image ? (
            <img src={image} alt={name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ color }}>
              <EntityIcon type="pharmacy" className="size-12" />
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
            صيدلية
          </p>
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
            <span className="flex items-center gap-1 text-xs font-bold text-gold-dark">
              <Star className="size-3.5 fill-gold text-gold-dark" />
              صيدلية مميّزة
            </span>
          </div>
        </div>
      </div>
      <span className="pointer-events-none absolute left-0 top-0 p-2 text-[9px] font-black text-gold-dark/25">{index + 1}</span>
    </div>
  )
}
