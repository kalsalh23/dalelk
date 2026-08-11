import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HelpCircle, Search, Send, ClipboardList, Stethoscope, Newspaper, MessageSquareText } from 'lucide-react'
import { searchQuestions, saveUnansweredQuestion } from '@/services/articles'
import { useArticles } from '@/hooks/useArticles'
import { useEntities } from '@/hooks/useEntities'
import { Skeletons } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { Card, CardBody } from '@/components/ui/Card'
import { SPECIALTIES } from '@/constants'
import type { MedicalQuestion } from '@/types'
import { Seo } from '@/components/seo/Seo'
import { track } from '@/services/stats'

export function AskPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<MedicalQuestion[]>([])
  const [selected, setSelected] = useState<MedicalQuestion | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [suggestions, setSuggestions] = useState<{
    articles: Array<Record<string, unknown>>
    doctors: Array<Record<string, unknown>>
    clinics: Array<Record<string, unknown>>
  }>({ articles: [], doctors: [], clinics: [] })
  const toast = useToast()

  const { data: tips } = useArticles({ limit: 4 })
  const { data: doctors } = useEntities('doctor', { limit: 4 })
  const { data: clinics } = useEntities('clinic', { limit: 4 })

  const handleSearch = async () => {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setSelected(null)
    setAnswered(false)
    setNotFound(false)
    void track('search', { path: `/ask?q=${encodeURIComponent(q)}` })
    const found = await searchQuestions(q)
    setLoading(false)
    if (found.length) {
      const needDisambiguation = found.length > 1 && found[0]._score === found[1]._score
      setResults(found)
      if (!needDisambiguation) {
        setSelected(found[0])
        setMatched(found[0])
      } else {
        setMatched(null)
      }
    } else {
      setResults([])
      setNotFound(true)
      setSuggestions({
        articles: (tips?.data ?? []) as unknown as Array<Record<string, unknown>>,
        doctors: (doctors?.data ?? []) as unknown as Array<Record<string, unknown>>,
        clinics: (clinics?.data ?? []) as unknown as Array<Record<string, unknown>>,
      })
    }
  }

  const setMatched = (item: MedicalQuestion | null) => {
    setSelected(item)
    setAnswered(true)
    setNotFound(false)
  }

  const matchedUs = useMemo(() => results, [results])

  const saveQuestion = async () => {
    const ok = await saveUnansweredQuestion(query.trim())
    if (ok) {
      toast.show('تم إرسال سؤالك لإدارة المنصة، شكراً لك!', 'success')
    } else {
      toast.show('تعذر إرسال السؤال، حاول مجدداً', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Seo
        title="اسأل دليلك الطبي"
        description="اكتب سؤالك الصحي وسنبحث لك في قاعدة المعلومات الطبية عن الإجابة الأقرب لسؤالك."
        path="/ask"
      />

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-l from-primary-dark to-primary px-6 py-10 text-center text-white sm:px-10">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <HelpCircle className="size-7" />
          </div>
          <h1 className="text-2xl font-black sm:text-3xl">اسأل دليلك الطبي</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-teal-50">
            اكتب سؤالك الصحي وسنبحث لك في قاعدة المعلومات الطبية.
          </p>
        </div>
        <CardBody className="p-5 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <MessageSquareText className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); if (selected || notFound) { setSelected(null); setNotFound(false) } }}
                onKeyDown={(e) => e.key === 'Enter' && void handleSearch()}
                placeholder="اكتب سؤالك الصحي… مثل: ما علاج السعال؟"
                className="h-13 w-full rounded-2xl border border-border bg-surface py-3.5 pl-4 pr-12 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </div>
            <button
              onClick={() => void handleSearch()}
              disabled={loading || !query.trim()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
            >
              {loading ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Search className="size-4.5" />}
              بحث
            </button>
          </div>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8">
                <Skeletons rows={2} box="!p-4" />
              </motion.div>
            )}

            {!loading && matchedUs.length > 1 && !selected && (
              <motion.div key="didyou" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                <h2 className="mb-3 text-sm font-black text-ink">هل تقصد؟</h2>
                <div className="space-y-2">
                  {matchedUs.slice(0, 6).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMatched(m)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 text-right transition hover:border-primary hover:bg-primary-light/30 cursor-pointer"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
                        <Search className="size-4" />
                      </span>
                      <span className="text-sm font-semibold text-ink">{m.question}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {!loading && selected && (
              <motion.div key="answer" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mt-8 rounded-2xl border border-primary/20 bg-primary-light/30 p-5 sm:p-6">
                  <p className="text-[11px] font-bold text-primary-dark">الإجابة على سؤالك</p>
                  <h2 className="mt-1 text-lg font-black text-ink">{selected.question}</h2>
                  <div className="mt-3 whitespace-pre-line text-sm leading-8 text-ink">{selected.answer}</div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>هل كان هذا مفيداً؟ يمكنك دائماً:</span>
                  <Link to="/articles" className="font-bold text-primary hover:underline">تصفح النصائح الطبية</Link>
                  <span>أو</span>
                  <Link to="/doctors" className="font-bold text-primary hover:underline">البحث عن طبيب</Link>
                </div>
              </motion.div>
            )}

            {!loading && notFound && (
              <motion.div key="notfound" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
                  <h2 className="flex items-center gap-2 text-base font-black text-ink">
                    <ClipboardList className="size-5 text-warning" />
                    لم نجد إجابة مناسبة لسؤالك حاليًا.
                  </h2>
                  <p className="mt-2 text-sm text-muted">ربما يفيدك البحث في الأقسام التالية:</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-surface p-4">
                      <p className="flex items-center gap-1.5 text-xs font-black text-ink"><Newspaper className="size-4 text-primary" />نصائح طبية</p>
                      <ul className="mt-2 space-y-1.5 text-xs text-muted">
                        {(suggestions.articles.slice(0, 3) as Array<{ slug: string; title: string }>).map((a) => (
                          <li key={a.slug}><Link to={`/articles/${a.slug}`} className="line-clamp-1 hover:text-primary hover:underline">{a.title}</Link></li>
                        ))}
                      </ul>
                      <Link to="/articles" className="mt-2 block text-[11px] font-bold text-primary hover:underline">عرض الكل ←</Link>
                    </div>
                    <div className="rounded-xl border border-border bg-surface p-4">
                      <p className="flex items-center gap-1.5 text-xs font-black text-ink"><Stethoscope className="size-4 text-primary" />أطباء</p>
                      <ul className="mt-2 space-y-1.5 text-xs text-muted">
                        {(suggestions.doctors as Array<{ slug: string; name: string; specialty: string | null }>).map((d) => (
                          <li key={d.slug}><Link to={`/doctors/${d.slug}`} className="line-clamp-1 hover:text-primary hover:underline">{d.name}</Link></li>
                        ))}
                      </ul>
                      <Link to="/doctors" className="mt-2 block text-[11px] font-bold text-primary hover:underline">عرض الكل ←</Link>
                    </div>
                    <div className="rounded-xl border border-border bg-surface p-4">
                      <p className="flex items-center gap-1.5 text-xs font-black text-ink">🏥عيادات</p>
                      <ul className="mt-2 space-y-1.5 text-xs text-muted">
                        {(suggestions.clinics as Array<{ slug: string; name: string; specialty: string | null }>).map((c) => (
                          <li key={c.slug}><Link to={`/clinics/${c.slug}`} className="line-clamp-1 hover:text-primary hover:underline">{c.name}</Link></li>
                        ))}
                      </ul>
                      <Link to="/clinics" className="mt-2 block text-[11px] font-bold text-primary hover:underline">عرض الكل ←</Link>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                    <span className="font-semibold">اختصاصات متوفرة:</span>
                    {SPECIALTIES.slice(0, 6).map((s) => (
                      <Link key={s} to={`/doctors?specialty=${encodeURIComponent(s)}`} className="rounded-full bg-surface border border-border px-2.5 py-1 font-bold text-primary hover:bg-primary-light/40">
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-surface p-6 text-center sm:flex-row sm:text-right">
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-ink">إرسال السؤال لإدارة الموقع</h3>
                    <p className="mt-1 text-xs text-muted">سيتم حفظ سؤالك وإضافته لقاعدة الأسئلة والأجوبة بمجرد توفر إجابة.</p>
                  </div>
                  <button
                    onClick={() => void saveQuestion()}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-dark cursor-pointer"
                  >
                    <Send className="size-4" />
                    إرسال السؤال
                  </button>
                </div>
              </motion.div>
            )}

            {!loading && !results.length && !selected && !notFound && !answered && (
              <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 rounded-2xl bg-slate-50 p-5 text-center text-sm text-muted">
                جرّب أسئلة شائعة مثل: «ما علاج السعال؟»، «كيف أخفض الضغط؟»، «ما أعراض السكري؟»
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-6 text-amber-900">
            <HelpCircle className="mt-0.5 size-4 shrink-0" />
            المعلومات المنشورة للتثقيف الصحي فقط ولا تُغني عن استشارة الطبيب أو المختص.
          </div>
        </CardBody>
      </Card>
    </div>
  )
}