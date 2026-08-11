import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HelpCircle, ArrowLeft } from 'lucide-react'

export function AskCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[22px] bg-gradient-to-l from-primary-dark to-primary px-6 py-12 text-center text-white shadow-xl shadow-primary/20 sm:px-12"
      >
        <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <HelpCircle className="size-7" />
          </div>
          <h2 className="text-2xl font-black sm:text-3xl">عندك سؤال صحي؟</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-teal-50">
            اسأل دليلك الطبي وسنبحث لك في قاعدة المعلومات الطبية عن الإجابة الأقرب لسؤالك.
          </p>
          <Link
            to="/ask"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3 text-sm font-black text-primary-dark shadow-lg transition-transform hover:scale-[1.03]"
          >
            اسأل دليلك الطبي
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}