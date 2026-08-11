import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, HeartPulse, HelpCircle } from 'lucide-react'
import { APP_NAME } from '@/constants'
import { cn } from '@/lib/utils'

const NAV: { label: string; to: string }[] = [
  { label: 'الرئيسية', to: '/' },
  { label: 'الأطباء', to: '/doctors' },
  { label: 'العيادات', to: '/clinics' },
  { label: 'الصيدليات', to: '/pharmacies' },
  { label: 'الصيدليات المناوبة', to: '/duty-pharmacies' },
  { label: 'المراكز الصحية', to: '/health-centers' },
  { label: 'النصائح الطبية', to: '/articles' },
  { label: 'اسأل دليلك الطبي', to: '/ask' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-border/70 bg-surface/85 backdrop-blur-lg transition-shadow',
        scrolled && 'shadow-sm',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/25">
            <HeartPulse className="size-6" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-black text-ink sm:text-lg">{APP_NAME}</p>
            <p className="hidden text-[10px] font-medium text-muted sm:block">دليل الخدمات الطبية في طيبة الإمام</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV.slice(0, 6).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-3.5 py-2 text-sm font-semibold text-muted transition-colors hover:bg-slate-50 hover:text-primary',
                  isActive && 'bg-primary-light/70 text-primary-dark',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/ask"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-muted transition-colors hover:bg-slate-50 hover:text-primary',
                isActive && 'bg-primary-light/70 text-primary-dark',
              )
            }
          >
            <HelpCircle className="size-4" />
            اسأل
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 rounded-xl bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-dark cursor-pointer"
            style={{ padding: '9px 18px' }}
          >
            <Search className="size-4.5" />
            <span className="hidden sm:inline">بحث</span>
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-xl text-ink transition hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="القائمة"
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-x-0 top-full border-b border-border bg-surface shadow-xl lg:hidden"
          >
            <nav className="flex max-h-[75vh] flex-col gap-1 overflow-y-auto p-4">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-sm font-semibold text-muted transition-colors hover:bg-slate-50 hover:text-primary',
                      isActive && 'bg-primary-light/70 text-primary-dark',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}