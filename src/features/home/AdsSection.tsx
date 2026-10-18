import { motion } from 'framer-motion'
import { Megaphone } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchAds, incrementAdClick } from '@/services/site'
import { getPublicUrl } from '@/lib/supabase'
import { SectionTitle } from '@/components/ui/Breadcrumbs'
import { cn } from '@/lib/utils'
import type { Advertisement } from '@/types'

function AdCard({ ad, accent }: { ad: Advertisement; accent: boolean }) {
  const href = ad.link || undefined
  const inner = (
    <>
      <div className="flex h-full flex-col overflow-hidden rounded-[18px] border border-dashed border-primary/30 bg-gradient-to-l from-primary-light/40 to-background transition-all duration-300 group-hover:border-primary/50">
        {ad.image ? (
          <div className="relative h-32 w-full overflow-hidden sm:h-36">
            <img
              src={getPublicUrl(ad.image) ?? undefined}
              alt={ad.title}
              loading="lazy"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center bg-primary/10 sm:h-36">
            <Megaphone className="size-10 text-primary/50" />
          </div>
        )}
        <div className="flex flex-1 flex-col p-4 text-right">
          <span className="mb-1.5 inline-flex w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
            إعلان
          </span>
          <h3 className={cn('text-base font-black text-ink', accent && 'text-primary-dark')}>{ad.title}</h3>
          {ad.description ? <p className="mt-1 flex-1 text-xs leading-5 text-muted">{ad.description}</p> : null}
          {ad.link ? (
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              المزيد
            </span>
          ) : null}
        </div>
      </div>
    </>
  )
  return (
    <a
      href={href ?? undefined}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      onClick={() => href && void incrementAdClick(ad.id)}
      className="group block h-full text-right"
    >
      {inner}
    </a>
  )
}

export function AdsSection() {
  const { data: ads, isLoading } = useQuery({ queryKey: ['ads', 'home'], queryFn: () => fetchAds('home'), staleTime: 60_000 })
  const items = ads ?? []

  if (isLoading) return null
  if (!items.length) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
      <SectionTitle title="إعلانات وخدمات مميزة" subtitle="جهات طبية وصحية في منطقتك" icon={<Megaphone className="size-5" />} />
      <div className={cn('grid gap-4', items.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'lg:grid-cols-2')}>
        {items.map((ad, i) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
          >
            <AdCard ad={ad} accent={i === 0 && items.length === 1} />
          </motion.div>
        ))}
      </div>
      {items.length > 1 && (
        <p className="mt-3 text-center text-[11px] text-muted">
          هل تريد إدراج إعلانك هنا؟ ارسل بريداً إلى فريق المنصة من صفحة من نحن.
        </p>
      )}
    </section>
  )
}