import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { SearchBar } from '@/components/shared/SearchBar'
import { APP_NAME } from '@/constants'

const QUICK_STATS = [
  { label: 'أطباء', emoji: '👨‍⚕️' },
  { label: 'عيادات', emoji: '🏥' },
  { label: 'صيدليات', emoji: '💊' },
  { label: 'صيدليات مناوبة', emoji: '🌙' },
  { label: 'مشافي', emoji: '🏨' },
  { label: 'مخابر', emoji: '🧪' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/50 via-primary-light/20 to-background">
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-40 size-80 rounded-full bg-teal-200/30 blur-3xl" />

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
          className="mt-7 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs font-semibold text-muted">اقتراحات سريعة:</span>
          {QUICK_STATS.map((q) => (
            <Link
              key={q.label}
              to={q.label === 'أطباء' ? '/doctors' : q.label === 'عيادات' ? '/clinics' : q.label === 'صيدليات' ? '/pharmacies' : q.label === 'صيدليات مناوبة' ? '/duty-pharmacies' : q.label === 'مشافي' ? '/hospitals' : '/labs'}
              className="group flex items-center gap-1 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-muted shadow-sm transition-all hover:border-primary hover:text-primary"
            >
              <span>{q.emoji}</span>
              {q.label}
              <ArrowLeft className="size-3 opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  )
}