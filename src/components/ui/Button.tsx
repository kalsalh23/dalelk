import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'whatsapp'
type Size = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  asChild?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark shadow-sm focus-visible:ring-primary/40 active:scale-[0.98]',
  secondary:
    'bg-primary-light text-primary-dark hover:bg-[#b3f3e7] active:scale-[0.98]',
  outline:
    'border border-border bg-surface text-ink hover:border-primary/50 hover:text-primary active:scale-[0.98]',
  ghost: 'text-ink hover:bg-slate-100 active:scale-[0.98]',
  danger: 'bg-error text-white hover:bg-[#b91c1c] active:scale-[0.98]',
  whatsapp: 'bg-[#25D366] text-white hover:bg-[#1fb457] active:scale-[0.98]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-base gap-2.5 py-3.5',
  icon: 'h-10 w-10 p-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 outline-none focus-visible:ring-4 disabled:opacity-55 disabled:pointer-events-none cursor-pointer select-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
})