import { NavLink, useLocation } from 'react-router-dom'
import { Home, Stethoscope, Pill, MoonStar, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { label: 'الرئيسية', to: '/', icon: Home },
  { label: 'الصيدليات', to: '/pharmacies', icon: Pill },
  { label: 'الأطباء', to: '/doctors', icon: Stethoscope, center: true },
  { label: 'الصيدليات المناوبة', to: '/duty-pharmacies', icon: MoonStar },
  { label: 'اسأل', to: '/ask', icon: HelpCircle },
] as const

export function BottomNav() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div className="relative border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
        <div className="relative mx-auto flex max-w-md items-end justify-around">
          {ITEMS.map((item) => {
            const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
            if ('center' in item && item.center) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-label={item.label}
                  className="relative flex flex-1 flex-col items-center"
                >
                  <span
                    className={cn(
                      'absolute -top-7 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30 ring-4 ring-surface transition-transform active:scale-95',
                      active && 'shadow-xl shadow-primary/40',
                    )}
                  >
                    <item.icon className="size-7" />
                  </span>
                  <span className={cn('mb-2.5 mt-8 text-[10px] font-bold', active ? 'text-primary-dark' : 'text-muted')}>
                    {item.label}
                  </span>
                </NavLink>
              )
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-muted transition-colors hover:text-primary"
              >
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-xl transition-all',
                    active ? 'bg-primary-light text-primary-dark' : '',
                  )}
                >
                  <item.icon className="size-5" />
                </div>
                <span className={cn(active && 'text-primary-dark')}>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
