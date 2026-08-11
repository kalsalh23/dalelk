import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import { globalSearch, type SearchResult } from '@/services/search'
import { cn } from '@/lib/utils'
import { getPublicUrl } from '@/lib/supabase'
import { track } from '@/services/stats'
import { EntityIcon } from '@/components/ui/EntityIcon'
import type { EntityType } from '@/types'

const TYPE_STYLES: Record<string, { label: string; color: string }> = {
  doctor: { label: 'طبيب', color: '#0F766E' },
  clinic: { label: 'عيادة', color: '#0D9488' },
  hospital: { label: 'مشفى', color: '#0284C7' },
  pharmacy: { label: 'صيدلية', color: '#16A34A' },
  lab: { label: 'مخبر', color: '#D97706' },
  radiology: { label: 'أشعة', color: '#E11D48' },
  health_center: { label: 'مركز صحي', color: '#F59E0B' },
  article: { label: 'مقال', color: '#7C3AED' },
  question: { label: 'سؤال', color: '#DB2777' },
}

export function SearchBar({
  big,
  className,
  autoFocus,
  onSubmitted,
}: {
  big?: boolean
  className?: string
  autoFocus?: boolean
  onSubmitted?: () => void
}) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (q.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    timer.current = setTimeout(async () => {
      const res = await globalSearch(q, null)
      setResults(res)
      setLoading(false)
      setOpen(true)
    }, 300)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [q])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!q.trim()) return
    void track('search', { path: `/search?q=${encodeURIComponent(q)}` })
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(q.trim())}`)
    onSubmitted?.()
  }

  return (
    <div ref={boxRef} className={cn('relative', className)}>
      <form onSubmit={submit} className={big ? 'relative' : ''}>
        <div className="relative">
          <Search
            className={cn('absolute right-4 top-1/2 -translate-y-1/2 text-muted', big ? 'size-6' : 'size-4.5')}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            autoFocus={autoFocus}
            placeholder="ابحث عن طبيب، اختصاص، عيادة، صيدلية أو خدمة طبية..."
            className={cn(
              'w-full rounded-2xl bg-surface text-ink outline-none transition-all ring-border placeholder:text-muted/70',
              big
                ? 'h-14 pr-13 pl-24 text-base shadow-lg shadow-slate-200/60 focus:ring-4 focus:ring-primary/15 sm:h-16 sm:text-lg'
                : 'h-11 pr-11 pl-4 text-sm border border-border focus:border-primary focus:ring-4 focus:ring-primary/15',
            )}
          />
          <button
            type="submit"
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 rounded-xl font-bold text-white transition-all hover:bg-primary-dark cursor-pointer',
              big ? 'h-10 px-6 text-sm sm:h-12 sm:px-8' : 'h-8 px-4 text-xs',
            )}
            style={{ backgroundColor: '#0F766E' }}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'بحث'}
          </button>
        </div>
      </form>

      {open && q.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-surface p-2 shadow-2xl" dir="rtl">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" />
              جارٍ البحث…
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">لا توجد نتائج مطابقة</div>
          )}
          {results.map((group) => {
            const style = TYPE_STYLES[group.type]
            return (
              <div key={group.type} className="mb-1">
                <p className="flex items-center gap-2 px-3 py-2 text-xs font-bold" style={{ color: style?.color ?? '#0F766E' }}>
                  <span className="inline-block size-2 rounded-full" style={{ backgroundColor: style?.color }} />
                  {group.label}
                </p>
                {group.items.map((item: Record<string, unknown>) => {
                  const id = String(item.id)
                  const name = String(item.name ?? item.title ?? item.question ?? '')
                  const img = getPublicUrl(item.image as string)
                  const route =
                    group.type === 'article'
                      ? `/articles/${item.slug}`
                      : group.type === 'question'
                        ? `/ask?s=${encodeURIComponent(String(item.question ?? ''))}`
                        : `/${(group.type as EntityType) === 'health_center' ? 'health-centers' : `${group.type === 'radiology' ? 'radiology' : group.type}s`}/${item.slug ?? id}`
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setOpen(false)
                        navigate(route)
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right transition-colors hover:bg-slate-50 cursor-pointer"
                    >
                      {img ? (
                        <img src={img} alt="" className="size-9 rounded-lg object-cover" />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
                          <EntityIcon type={(group.type as EntityType) ?? 'doctor'} className="size-4.5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{name}</p>
                        {item.specialty && group.type === 'doctor' ? (
                          <p className="text-xs text-muted">{String(item.specialty)}</p>
                        ) : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
          <button
            onClick={submit}
            className="mt-1 w-full rounded-xl bg-primary-light/60 px-3 py-2.5 text-sm font-bold text-primary-dark hover:bg-primary-light cursor-pointer"
          >
            عرض كل نتائج «{q}»
          </button>
        </div>
      )}
    </div>
  )
}