import { useState } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Stethoscope, Building2, Hospital, HeartPulse, Pill, Moon,
  FlaskConical, ScanLine, Newspaper, MessagesSquare, Inbox, CreditCard,
  ArrowUpCircle, BarChart3, Settings, LogOut, Menu, X, ShieldCheck,
} from 'lucide-react'
import { AdminAuthProvider, useAdminAuth } from '@/features/admin/auth'
import type { Profile } from '@/types'
import { FullPageLoader } from '@/components/ui/States'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/constants'

const NAV = [
  {
    section: 'الإدارة العامة',
    items: [
      { to: '/admin', label: 'الرئيسية', icon: LayoutDashboard, end: true },
      { to: '/admin/stats', label: 'الإحصائيات', icon: BarChart3 },
      { to: '/admin/settings', label: 'الإعدادات', icon: Settings },
    ],
  },
  {
    section: 'الأدلة الطبية',
    items: [
      { to: '/admin/doctors', label: 'الأطباء', icon: Stethoscope },
      { to: '/admin/clinics', label: 'العيادات', icon: Building2 },
      { to: '/admin/hospitals', label: 'المشافي', icon: Hospital },
      { to: '/admin/health-centers', label: 'المراكز الصحية', icon: HeartPulse },
      { to: '/admin/pharmacies', label: 'الصيدليات', icon: Pill },
      { to: '/admin/duty-pharmacies', label: 'الصيدليات المناوبة', icon: Moon },
      { to: '/admin/labs', label: 'المخابر', icon: FlaskConical },
      { to: '/admin/radiology', label: 'مراكز الأشعة', icon: ScanLine },
    ],
  },
  {
    section: 'المحتوى',
    items: [
      { to: '/admin/articles', label: 'النصائح الطبية', icon: Newspaper },
      { to: '/admin/questions', label: 'الأسئلة والأجوبة', icon: MessagesSquare },
      { to: '/admin/unanswered', label: 'الأسئلة غير المجاب عنها', icon: Inbox },
    ],
  },
  {
    section: 'الاشتراكات',
    items: [
      { to: '/admin/plans', label: 'الاشتراكات', icon: CreditCard },
      { to: '/admin/requests', label: 'طلبات الترقية', icon: ArrowUpCircle },
    ],
  },
]

function AdminShell() {
  const { profile, loading, isAdmin } = useAdminAuth()
  if (loading) return <FullPageLoader label="جارٍ التحقق من الجلسة…" />
  if (!isAdmin || !profile) return <AuthNotice />
  return <AdminContent profile={profile} />
}

function AuthNotice() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-3xl bg-primary-light text-primary-dark">
        <ShieldCheck className="size-8" />
      </div>
      <h1 className="text-xl font-black text-ink">لوحة إدارة {APP_NAME}</h1>
      <p className="text-sm text-muted">هذه المنطقة محمية، يرجى تسجيل الدخول للمتابعة.</p>
      <Link to="/admin/login" className="rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-dark">
        تسجيل الدخول
      </Link>
    </div>
  )
}

function AdminContent({ profile }: { profile: Profile }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[262px_1fr]">
      <aside className="sticky top-0 hidden h-screen overflow-y-auto border-l border-border bg-surface px-4 py-6 lg:block">
        <Link to="/" className="mb-6 flex items-center gap-2.5 px-2">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-white">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-black text-ink">{APP_NAME}</p>
            <p className="text-[10px] text-muted">لوحة الإدارة</p>
          </div>
        </Link>
        <nav className="space-y-4">
          {NAV.map((group) => (
            <div key={group.section}>
              <p className="mb-1.5 px-3 text-[10px] font-black uppercase tracking-wide text-muted/70">{group.section}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-slate-50 hover:text-primary',
                        isActive && 'bg-primary-light/70 text-primary-dark',
                      )
                    }
                  >
                    <item.icon className="size-4.5" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-6 border-t border-border pt-4">
          <p className="px-3 pb-2 text-xs font-bold text-ink">{profile.name ?? 'المدير'}</p>
          <button
            onClick={() => void handleLogout()}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-red-50"
          >
            <LogOut className="size-4.5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur lg:hidden">
          <Link to="/admin" className="flex items-center gap-2 font-black text-ink">
            <ShieldCheck className="size-5 text-primary" />
            لوحة الإدارة
          </Link>
          <button onClick={() => setMobileOpen((v) => !v)} className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-ink hover:bg-slate-100">
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>
        {mobileOpen && (
          <div className="relative z-20 max-h-[70vh] overflow-y-auto border-b border-border bg-surface p-4 lg:hidden">
            <nav className="space-y-1">
              {NAV.flatMap((g) => g.items).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-slate-50',
                      isActive && 'bg-primary-light/70 text-primary-dark',
                    )
                  }
                >
                  <item.icon className="size-4.5" />
                  {item.label}
                </NavLink>
              ))}
              <button onClick={() => void handleLogout()} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-error">
                <LogOut className="size-4.5" />
                تسجيل الخروج
              </button>
            </nav>
          </div>
        )}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function AdminLayout() {
  return (
    <AdminAuthProvider>
      <AdminShell />
    </AdminAuthProvider>
  )
}