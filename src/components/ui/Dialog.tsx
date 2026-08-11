import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Dialog({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[92vh]',
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={cn(
              'relative z-10 max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-surface shadow-2xl sm:rounded-3xl',
              sizes[size],
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-lg font-bold text-ink">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-muted transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="max-h-[calc(92vh-64px)] overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  loading?: boolean
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm leading-7 text-muted">{message}</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 rounded-xl bg-error px-4 py-3 text-sm font-bold text-white transition hover:bg-[#b91c1c] disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'جارٍ الحذف…' : 'تأكيد'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-ink transition hover:bg-slate-50 cursor-pointer"
        >
          إلغاء
        </button>
      </div>
    </Dialog>
  )
}