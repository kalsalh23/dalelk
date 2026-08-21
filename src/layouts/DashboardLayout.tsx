import { useEffect, useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, User, Images, Clock, MapPin, ShieldCheck, LogOut, Menu, X, ExternalLink, Crown, Eye, Phone,
} from 'lucide-react'
import { fetchEntitySession, readStoredSession, clearStoredSession, entityDisplayName, entityDisplayType, type EntitySessionData } from '@/services/entityAccount'
import { FullPageLoader } from '@/components/ui/States'
import { PlanBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard, end: true },
  { to: '/dashboard/profile', label: 'الملف الشخصي', icon: User },
  { to: '/dashboard/media', label: 'الصور والمعرض', icon: Images },
  { to: '/dashboard/hours', label: 'أوقات الدوام', icon: Clock },
  { to: '/dashboard/location', label: 'الموقع والعنوان', icon: MapPin },
]

function DashboardShell() {
  const [checking, setChecking] = useState(true)
  const [session, setSession] = useState<EntitySessionData | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = readStoredSession()
    if (!stored) { setChecking(false); return }
    void fetchEntitySession(stored.token).then((d) => {
      if (d) setSession(d)
      else clearStoredSession()
    }).finally(() => setChecking(false))
  }, [])

  const logout = () => {
    clearStoredSession()
    setSession(null)
    navigate('/dashboard/login')
  }

  if (checking) return <FullPageLoader label="جارٍ التحقق من الجلسة…" />

  // غير مسجل → عرض الـ Outlet (login) بدون sidebar
  if (!session) {
    const isLogin = window.location.pathname.startsWith('/dashboard/login')
    if (isLogin) return <Outlet context={{ session: null }} />
    // افتراضياً إعادة توجيه لصفحة الدخول
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-3xl bg-primary-light text-primary-dark">
          <ShieldCheck className="size-8" />
        </div>
        <h1 className="text-xl font-black text-ink">لوحة تحكم الجهة</h1>
        <p className="max-w-sm text-sm leading-6 text-muted">سجّل دخولك باستخدام البريد وكلمة السر التي استلمتها بعد الموافقة على ترقيتك.</p>
        <Link to="/dashboard/login" className="rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-dark">تسجيل الدخول</Link>
        <Link to="/" className="text-xs text-muted hover:underline">العودة للرئيسية</Link>
      </div>
    )
  }

  const routeLink =
    session.entity_type === 'health_center' ? 'health-centers'
      : session.entity_type === 'radiology' ? 'radiology'
        : `${session.entity_type}s`

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[280px_1fr]">
      {/* sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto border-l border-border bg-surface lg:flex">
        <Link to="/" className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-white">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-black text-ink">دليلك الطبي</p>
            <p className="text-[10px] font-bold text-primary">لوحة تحكم الجهة</p>
          </div>
        </Link>

        {/* entity card */}
        <div className="mx-4 rounded-2xl border border-border bg-slate-50 p-4">
          <p className="text-sm font-black text-ink line-clamp-1">{entityDisplayName(session.entity)}</p>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted">
            {entityDisplayType(session.entity_type)}
            <PlanBadge plan={String(session.entity?.plan ?? 'free')} />
          </p>
          <p className="mt-1 text-[11px] text-muted" dir="ltr">{session.email}</p>
          <div className="mt-3 flex gap-2">
            <Link to={`/${routeLink}/${session.slug}`} className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-surface border border-border px-3 py-2 text-xs font-bold text-ink hover:bg-white">
              <ExternalLink className="size-3.5" /> عرض صفحتي
            </Link>
            <span className="inline-flex items-center gap-1 rounded-xl bg-primary-light px-2.5 py-2 text-xs font-bold text-primary-dark">
              <Eye className="size-3.5" /> {String((session.entity as Record<string, unknown>)?.view_count ?? 0)}
            </span>
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors',
                isActive ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-slate-50 hover:text-primary',
              )}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          {(String(session.entity?.plan ?? 'free') !== 'free') && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
              <Crown className="size-4" /> {(String(session.entity?.plan ?? '') === 'gold') ? 'الباقة الذهبية' : 'الباقة الاحترافية'} نشطة
            </div>
          )}
          <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            <LogOut className="size-4" /> تسجيل الخروج
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted flex items-center justify-center gap-1">
            <Phone className="size-3" /> الدعم: تواصل مع الإدارة
          </p>
        </div>
      </aside>

      {/* main */}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur lg:hidden">
          <Link to="/dashboard" className="flex items-center gap-2 font-black text-ink text-sm">
            <ShieldCheck className="size-5 text-primary" /> لوحة التحكم
          </Link>
          <div className="flex items-center gap-2">
            <Link to={`/${routeLink}/${session.slug}`} className="text-xs font-bold text-primary hover:underline">عرض صفحتي</Link>
            <button onClick={() => setMobileOpen((v) => !v)} className="flex size-9 items-center justify-center rounded-lg text-ink hover:bg-slate-100">
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </header>
        {mobileOpen && (
          <div className="border-b border-border bg-surface p-3 lg:hidden">
            <nav className="grid gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold',
                    isActive ? 'bg-primary text-white' : 'text-muted hover:bg-slate-50',
                  )}
                >
                  <item.icon className="size-4.5" /> {item.label}
                </NavLink>
              ))}
              <button onClick={logout} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-error hover:bg-red-50">
                <LogOut className="size-4.5" /> تسجيل الخروج
              </button>
            </nav>
            <div className="mt-3 rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-bold text-ink">{entityDisplayName(session.entity)}</p>
              <p className="text-xs text-muted">{entityDisplayType(session.entity_type)} — {session.email}</p>
            </div>
          </div>
        )}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet context={{ session, setSession }} />
        </main>
      </div>
    </div>
  )
}

export function DashboardLayout() {
  return <DashboardShell />
}

// hook لقراءة session من Outlet context
import { useOutletContext } from 'react-router-dom'
export function useDashboardSession(): { session: EntitySessionData | null; setSession: React.Dispatch<React.SetStateAction<EntitySessionData | null>> } {
  return useOutletContext<{ session: EntitySessionData | null; setSession: React.Dispatch<React.SetStateAction<EntitySessionData | null>> }>()
}
