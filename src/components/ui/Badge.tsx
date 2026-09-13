import { BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-subtle-strong px-2.5 py-0.5 text-xs font-semibold text-muted',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function VerifiedBadge({ verified, className }: { verified?: boolean | null; className?: string }) {
  if (!verified) return null
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-bold text-primary-dark',
        className,
      )}
    >
      <BadgeCheck className="size-3.5" />
      موثّق
    </span>
  )
}

export function PlanBadge({ plan, className }: { plan: string; className?: string }) {
  const styles: Record<string, string> = {
    free: 'bg-subtle-strong text-muted',
    pro: 'bg-primary-light text-primary-dark',
    gold: 'bg-gold-soft text-gold-dark',
  }
  const labels: Record<string, string> = { free: 'مجاني', pro: 'احترافي', gold: 'ذهبي' }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold',
        styles[plan] ?? styles.free,
        className,
      )}
    >
      {labels[plan] ?? plan}
    </span>
  )
}