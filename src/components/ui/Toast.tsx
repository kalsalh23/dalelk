import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'
interface Toast {
  id: number
  type: ToastType
  message: string
}

const ToastContext = createContext<{ show: (message: string, type?: ToastType) => void }>({
  show: () => undefined,
})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className={cn(
                'pointer-events-auto flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur',
                t.type === 'success' && 'border-emerald-200 bg-white text-emerald-700',
                t.type === 'error' && 'border-red-200 bg-white text-red-700',
                t.type === 'info' && 'border-sky-200 bg-white text-sky-700',
              )}
            >
              {t.type === 'success' && <CheckCircle2 className="size-5 text-success" />}
              {t.type === 'error' && <XCircle className="size-5 text-error" />}
              {t.type === 'info' && <Info className="size-5 text-sky-600" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}