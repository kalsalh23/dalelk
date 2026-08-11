import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i)
  }
  const items: Array<number | '…'> = []
  pages.forEach((p, idx) => {
    if (idx > 0 && p - pages[idx - 1] > 1) items.push('…')
    items.push(p)
  })

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:text-primary disabled:opacity-40 cursor-pointer"
        aria-label="الصفحة السابقة"
      >
        <ChevronRight className="size-4" />
      </button>
      {items.map((it, i) =>
        it === '…' ? (
          <span key={`e${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <button
            key={it}
            onClick={() => onChange(it)}
            className={cn(
              'size-9 rounded-xl border text-sm font-bold transition cursor-pointer',
              it === page
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-primary',
            )}
          >
            {it}
          </button>
        ),
      )}
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:text-primary disabled:opacity-40 cursor-pointer"
        aria-label="الصفحة التالية"
      >
        <ChevronLeft className="size-4" />
      </button>
    </nav>
  )
}