import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Sparkles, ArrowLeft, Stethoscope, Pill, Moon, Hospital, FlaskConical, Megaphone,
} from 'lucide-react'
import { SearchBar } from '@/components/shared/SearchBar'
import { APP_NAME, FEATURE_CLINICS } from '@/constants'
import { fetchAds, incrementAdClick } from '@/services/site'
import { getPublicUrl } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Advertisement } from '@/types'

const QUICK_LINKS = [
  { label: 'الأطباء', to: '/doctors', icon: Stethoscope, tone: 'primary' },
  { label: 'الصيدليات', to: '/pharmacies', icon: Pill, tone: 'gold' },
  { label: 'المشافي', to: '/hospitals', icon: Hospital, tone: 'primary' },
  { label: 'المخابر', to: '/labs', icon: FlaskConical, tone: 'gold' },
  { label: 'صيدليات المناوبة', to: '/duty-pharmacies', icon: Moon, tone: 'primary', solo: true },
].filter((q) => FEATURE_CLINICS || q.to !== '/clinics') as readonly { label: string; to: string; icon: typeof Stethoscope; tone: string }[]


/** بطاقة إعلانات دوّارة داخل الهيرو: كل إعلان 10 ثوانٍ، بلا أسهم — توقف عند التمرير عليها */
function HeroAds() {
  const nav = useNavigate()
  const { data: ads } = useQuery({ queryKey: ['ads', 'home'], queryFn: () => fetchAds('home'), staleTime: 60_000 })
  const items = ads ?? []
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 10_000)
    return () => clearInterval(t)
  }, [items.length])

  if (!items.length) return null
  const ad: Advertisement = items[idx % items.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.22 }}
      className="mx-auto mt-8 max-w-2xl"
    >
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={ad.id}
            onClick={() => { void incrementAdClick(ad.id); nav(`/ads/${ad.id}`) }}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.5 }}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-primary/25 bg-surface p-2.5 text-start shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl"
          >
            {ad.image ? (
              <img
                src={getPublicUrl(ad.image) ?? undefined}
                alt={ad.title}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                className="size-20 shrink-0 rounded-xl object-cover sm:size-24"
              />
            ) : (
              <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:size-24">
                <Megaphone className="size-9 text-primary/50" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="mb-1 inline-flex w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">إعلان</span>
              <span className="block truncate text-sm font-black text-ink group-hover:text-primary-dark sm:text-base">{ad.title}</span>
              {ad.description ? <span className="mt-0.5 line-clamp-1 block text-xs text-muted sm:text-[13px]">{ad.description}</span> : null}
              {ad.link ? <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary">المزيد ←</span> : null}
            </span>
          </motion.div>
        </AnimatePresence>

        {items.length > 1 && (
          <div className="mt-2.5 flex items-center justify-center gap-1.5">
            {items.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setIdx(i)}
                aria-label={`إعلان ${i + 1}`}
                className={cn('h-1.5 rounded-full transition-all cursor-pointer', i === idx % items.length ? 'w-5 bg-primary' : 'w-1.5 bg-primary/25 hover:bg-primary/50')}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/50 via-primary-light/20 to-background">
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 size-80 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-24 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface px-4 py-1.5 text-xs font-bold text-primary-dark shadow-sm"
        >
          <Sparkles className="size-3.5" />
          الدليل الصحي الرقمي لمدينة طيبة الإمام
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mx-auto max-w-3xl text-3xl font-black leading-tight text-ink sm:text-5xl"
        >
          <span className="text-primary">{APP_NAME}</span>
          <span className="mt-1 block text-lg font-bold text-ink sm:text-2xl">
            كل ما تحتاجه من خدمات صحية في مدينة طيبة الإمام... في مكان واحد.
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mx-auto mt-8 max-w-2xl"
        >
          <SearchBar big />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-2"
        >
          <span className="col-span-2 w-full text-center text-sm font-bold text-muted">اقتراحات سريعة:</span>
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.label}
              to={q.to}
              className={cn(
                'group relative flex items-center justify-center gap-2.5 rounded-2xl border bg-surface py-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
                'solo' in q && 'col-span-2 mx-auto w-full max-w-[240px]',
                q.tone === 'primary' ? 'border-primary/25 hover:border-primary' : 'border-gold/40 hover:border-gold',
              )}
            >
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                  q.tone === 'primary'
                    ? 'bg-primary-light text-primary-dark group-hover:bg-primary group-hover:text-white'
                    : 'bg-gold-soft text-gold-dark group-hover:bg-gold group-hover:text-primary-dark',
                )}
              >
                <q.icon className="size-6.5" />
              </span>
              <span className="text-base font-bold text-ink sm:text-lg">{q.label}</span>
              <ArrowLeft className="absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-primary opacity-0 transition-all duration-300 group-hover:opacity-100" />
            </Link>
          ))}
        </motion.div>

        <HeroAds />
      </div>
    </section>
  )
}
