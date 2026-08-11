import { NavLink, useLocation } from 'react-router-dom'
import { Home, Stethoscope, Pill, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { label: 'الرئيسية', to: '/', icon: Home },
  { label: 'الأطباء', to: '/doctors', icon: Stethoscope },
  { label: 'الصيدليات المناوبة', to: '/duty-pharmacies', icon: Pill },
  { label: 'اسأل', to: '/ask', icon: HelpCircle },
]

export function BottomNav() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {ITEMS.map((item) => {
          const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-muted transition-colors hover:text-primary"
            >
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-xl transition-all',
                  active ? 'bg-primary-light text-primary-dark' : 'text-muted',
                )}
              >
                <item.icon className="size-5" />
              </div>
              <span className={cn(active && 'text-primary-dark')}>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}