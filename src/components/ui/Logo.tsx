import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logo-teal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14B8A6" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#logo-teal)" />
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(8 8) scale(2)"
      />
      <path
        d="M16 32 H29 L31.5 32 L33 36.5 L35 25.5 L36.5 32 H48"
        fill="none"
        stroke="#99F6E4"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({
  className,
  showTagline = true,
  inverse = false,
}: {
  className?: string
  showTagline?: boolean
  inverse?: boolean
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className={cn('shrink-0', inverse ? 'size-9 rounded-xl shadow-md' : 'size-10 rounded-2xl shadow-md shadow-primary/25')} />
      <span className="leading-tight">
        <span className={cn('block', inverse ? 'text-sm font-black' : 'text-base font-black text-ink sm:text-lg')}>
          {import.meta.env.VITE_SITE_NAME ?? 'دليلك الطبي'}
        </span>
        {showTagline && (
          <span className={cn('block text-[10px] font-medium', inverse ? 'text-teal-100/90' : 'text-muted')}>
            دليل الخدمات الطبية في طيبة الإمام
          </span>
        )}
      </span>
    </span>
  )
}