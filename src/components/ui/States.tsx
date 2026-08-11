import { motion } from 'framer-motion'
import { Loader2, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-slate-200/70', className)} />
}

export function Skeletons({ rows = 6, box }: { rows?: number; box?: string }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={cn('flex gap-4 bg-surface p-4', box)}>
          <Skeleton className="size-16 shrink-0 rounded-2xl sm:size-20" />
          <div className="flex-1 space-y-2.5 py-1">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-5 animate-spin text-primary', className)} />
}

export function FullPageLoader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted">
      <Spinner className="size-8" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 rounded-[18px] border border-dashed border-border bg-surface px-6 py-14 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
        <SearchX className="size-7" />
      </div>
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm leading-6 text-muted">{description}</p>}
      {action}
    </motion.div>
  )
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[18px] border border-red-100 bg-red-50/60 px-6 py-12 text-center">
      <h3 className="text-lg font-bold text-error">حدث خطأ ما</h3>
      <p className="text-sm text-muted">{message ?? 'تعذر تحميل البيانات. حاول مرة أخرى.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark cursor-pointer"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  )
}