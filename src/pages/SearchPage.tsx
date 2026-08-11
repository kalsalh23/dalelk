import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SearchX } from 'lucide-react'
import { globalSearch, type SearchResult } from '@/services/search'
import { getPublicUrl } from '@/lib/supabase'
import { Spinner } from '@/components/ui/States'
import { Seo } from '@/components/seo/Seo'
import { track } from '@/services/stats'

const TYPE_META: Record<string, { label: string; route: (slug: string, id: string) => string; titleKey: string; descKey?: string }> = {
  doctor: { label: 'أطباء', titleKey: 'name', descKey: 'specialty', route: (s, id) => `/doctors/${s || id}` },
  clinic: { label: 'عيادات', titleKey: 'name', descKey: 'specialty', route: (s, id) => `/clinics/${s || id}` },
  hospital: { label: 'مشافي', titleKey: 'name', route: (s, id) => `/hospitals/${s || id}` },
  health_center: { label: 'مراكز صحية', titleKey: 'name', route: (s, id) => `/health-centers/${s || id}` },
  pharmacy: { label: 'صيدليات', titleKey: 'name', route: (s, id) => `/pharmacies/${s || id}` },
  lab: { label: 'مخابر', titleKey: 'name', route: (s, id) => `/labs/${s || id}` },
  radiology: { label: 'مراكز الأشعة', titleKey: 'name', route: (s, id) => `/radiology/${s || id}` },
  article: { label: 'مقالات', titleKey: 'title', descKey: 'excerpt', route: (s) => `/articles/${s}` },
  question: { label: 'أسئلة وأجوبة', titleKey: 'question', descKey: 'answer', route: (s, id) => `/ask?s=${encodeURIComponent(String(s || id))}` },
}

export function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    void track('search', { path: `/search?q=${encodeURIComponent(q)}` })
    globalSearch(q, null).then((res) => {
      if (alive) {
        setResults(res)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [q])

  const searchUrl = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''

  const filtered = results.filter((r) => r.items.length > 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Seo title={q ? `نتائج البحث عن «${q}»` : 'البحث'} path={`/search${searchUrl}`} />
      <h1 className="text-2xl font-black text-ink">البحث في دليلك الطبي</h1>

      <form action="/search" method="get" className="relative mt-5">
        <Search className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          name="q"
          defaultValue={q}
          placeholder="ابحث عن طبيب، اختصاص، عيادة، صيدلية أو خدمة طبية..."
          className="h-14 w-full rounded-2xl border border-border bg-surface pr-12 pl-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
        <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark cursor-pointer">
          بحث
        </button>
      </form>

      <div className="mt-8 space-y-8">
        {loading ? (
          <div className="flex items-center gap-2 py-10 text-muted">
            <Spinner /> جارٍ البحث…
          </div>
        ) : !q.trim() ? (
          <p className="py-10 text-center text-sm text-muted">اكتب كلمة بحث للبدء.</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <SearchX className="size-12 text-slate-300" />
            <p className="font-bold text-ink">لا توجد نتائج لـ «{q}»</p>
            <p className="text-sm text-muted">جرّب كلمات بحث أخرى أو تصفح الأقسام الرئيسية.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {[['الأطباء', '/doctors'], ['العيادات', '/clinics'], ['الصيدليات', '/pharmacies'], ['النصائح', '/articles'], ['اسأل', '/ask']].map(([l, to]) => (
                <Link key={to} to={to} className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold text-primary hover:bg-primary-light/40">{l}</Link>
              ))}
            </div>
          </div>
        ) : (
          filtered.map((group) => {
            const meta = TYPE_META[group.type]
            if (!meta) return null
            return (
              <motion.section key={group.type} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-ink">
                  <span className="h-6 w-9 rounded-lg bg-primary-light" />
                  {meta.label}
                  <span className="text-xs font-semibold text-muted">({group.items.length})</span>
                </h2>
                <div className="space-y-2">
                  {group.items.map((item) => {
                    const id = String(item.id)
                    const slug = String(item.slug ?? '')
                    const title = String(item[meta.titleKey] ?? '')
                    const desc = meta.descKey ? String(item[meta.descKey] ?? '') : ''
                    return (
                      <Link
                        key={id}
                        to={meta.route(slug, id)}
                        className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-3.5 transition-all hover:border-primary/40 hover:shadow-md"
                      >
                        {item.image ? (
                          <img src={getPublicUrl(item.image as string) ?? ''} alt="" className="size-12 rounded-xl object-cover" />
                        ) : (
                          <div className="flex size-12 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
                            <Search className="size-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink">{title}</p>
                          {desc && <p className="mt-0.5 line-clamp-1 text-xs text-muted">{desc}</p>}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </motion.section>
            )
          })
        )}
      </div>
    </div>
  )
}