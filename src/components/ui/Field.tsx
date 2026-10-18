import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const inputBase =
  'w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/70 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(inputBase, 'h-11', className)} {...props} />
  },
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(inputBase, 'min-h-24', className)} {...props} />
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(inputBase, 'h-11 appearance-none cursor-pointer', className)} {...props}>
        {children}
      </select>
    )
  },
)

export function Field({
  label,
  hint,
  error,
  children,
  required,
}: {
  label?: string
  hint?: string
  error?: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-ink">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-error">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}