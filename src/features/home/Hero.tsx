import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, ArrowLeft, Stethoscope, Pill, Moon, Building2, Hospital, FlaskConical,
} from 'lucide-react'
import { SearchBar } from '@/components/shared/SearchBar'
import { APP_NAME, FEATURE_CLINICS } from '@/constants'
import { cn } from '@/lib/utils'

const QUICK_LINKS = [
  { label: 'الأطباء', to: '/doctors', icon: Stethoscope, tone: 'primary' },
  { label: 'الصيدليات', to: '/pharmacies', icon: Pill, tone: 'gold' },
  { label: 'صيدليات المناوبة', to: '/duty-pharmacies', icon: Moon, tone: 'primary' },
  { label: 'العيادات', to: '/clinics', icon: Building2, tone: 'gold' },
  { label: 'المشافي', to: '/hospitals', icon: Hospital, tone: 'primary' },
  { label: 'المخابر', to: '/labs', icon: FlaskConical, tone: 'gold' },
].filter((q) => FEATURE_CLINICS || q.to !== '/clinics') as readonly { label: string; to: string; icon: typeof Stethoscope; tone: string }[]

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
          className="mx-auto max-w-3xl text-4xl font-black leading-tight text-ink sm:text-6xl"
        >
          <span className="text-primary">{APP_NAME}</span>
          <span className="block text-2xl font-bold text-ink sm:text-4xl">
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
          className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
        >
          <span className="w-full text-center text-sm font-bold text-muted sm:w-auto">اقتراحات سريعة:</span>
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.label}
              to={q.to}
              className={cn(
                'group flex items-center gap-2.5 rounded-2xl border bg-surface py-2.5 pe-4 ps-2.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
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
                <q.icon className="size-5.5" />
              </span>
              <span className="text-sm font-black text-ink">{q.label}</span>
              <ArrowLeft className="size-4 -translate-x-1 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
