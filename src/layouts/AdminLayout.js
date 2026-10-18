import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, Building2, Hospital, HeartPulse, Pill, Moon, FlaskConical, ScanLine, MessagesSquare, Inbox, CreditCard, ArrowUpCircle, BarChart3, Settings, LogOut, Menu, X, ShieldCheck, Megaphone, Code2, CalendarClock, } from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from '@/features/admin/auth';
import { FullPageLoader } from '@/components/ui/States';
import { cn } from '@/lib/utils';
import { APP_NAME, DEFAULT_DEVELOPER } from '@/constants';
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
            { to: '/admin/questions', label: 'الأسئلة والأجوبة', icon: MessagesSquare },
            { to: '/admin/unanswered', label: 'الأسئلة غير المجاب عنها', icon: Inbox },
            { to: '/admin/ads', label: 'الإعلانات', icon: Megaphone },
        ],
    },
    {
        section: 'الاشتراكات',
        items: [
            { to: '/admin/plans', label: 'الاشتراكات', icon: CreditCard },
            { to: '/admin/requests', label: 'طلبات الترقية', icon: ArrowUpCircle },
            { to: '/admin/appointments', label: 'طلبات المواعيد', icon: CalendarClock },
        ],
    },
];
function AdminShell() {
    const { profile, loading, isAdmin } = useAdminAuth();
    const { pathname } = useLocation();
    const isLoginRoute = pathname === '/admin/login';
    if (loading)
        return _jsx(FullPageLoader, { label: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062C\u0644\u0633\u0629\u2026" });
    // صفحة تسجيل الدخول متاحة دائماً
    if (isLoginRoute) {
        if (isAdmin && profile)
            return _jsx(Navigate, { to: "/admin", replace: true });
        return _jsx(Outlet, {});
    }
    if (!isAdmin || !profile)
        return _jsx(AuthNotice, {});
    return _jsx(AdminContent, { profile: profile });
}
function AuthNotice() {
    return (_jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center", children: [_jsx("div", { className: "flex size-16 items-center justify-center rounded-3xl bg-primary-light text-primary-dark", children: _jsx(ShieldCheck, { className: "size-8" }) }), _jsxs("h1", { className: "text-xl font-black text-ink", children: ["\u0644\u0648\u062D\u0629 \u0625\u062F\u0627\u0631\u0629 ", APP_NAME] }), _jsx("p", { className: "text-sm text-muted", children: "\u0647\u0630\u0647 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0645\u062D\u0645\u064A\u0629\u060C \u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u0645\u062A\u0627\u0628\u0639\u0629." }), _jsx(Link, { to: "/admin/login", className: "rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-dark", children: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" })] }));
}
function AdminContent({ profile }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { logout } = useAdminAuth();
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };
    return (_jsxs("div", { className: "min-h-screen bg-background lg:grid lg:grid-cols-[262px_1fr]", children: [_jsxs("aside", { className: "sticky top-0 hidden h-screen overflow-y-auto border-l border-border bg-surface px-4 py-6 lg:block", children: [_jsxs(Link, { to: "/", className: "mb-6 flex items-center gap-2.5 px-2", children: [_jsx("div", { className: "flex size-10 items-center justify-center rounded-2xl bg-primary text-white", children: _jsx(ShieldCheck, { className: "size-5" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-black text-ink", children: APP_NAME }), _jsx("p", { className: "text-[10px] text-muted", children: "\u0644\u0648\u062D\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629" })] })] }), _jsx("nav", { className: "space-y-4", children: NAV.map((group) => (_jsxs("div", { children: [_jsx("p", { className: "mb-1.5 px-3 text-[10px] font-black uppercase tracking-wide text-muted/70", children: group.section }), _jsx("div", { className: "space-y-0.5", children: group.items.map((item) => (_jsxs(NavLink, { to: item.to, end: item.end, className: ({ isActive }) => cn('flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-subtle hover:text-primary', isActive && 'bg-primary-light/70 text-primary-dark'), children: [_jsx(item.icon, { className: "size-4.5" }), item.label] }, item.to))) })] }, group.section))) }), _jsxs("div", { className: "mt-6 border-t border-border pt-4", children: [_jsx("p", { className: "px-3 pb-2 text-xs font-bold text-ink", children: profile.name ?? 'المدير' }), _jsxs("button", { onClick: () => void handleLogout(), className: "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-wine-soft", children: [_jsx(LogOut, { className: "size-4.5" }), "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C"] }), _jsxs("a", { href: `tel:${DEFAULT_DEVELOPER.phone}`, className: "mt-2 flex items-center gap-1.5 rounded-xl bg-subtle px-3 py-2.5 text-[11px] leading-5 text-muted transition-colors hover:text-primary", children: [_jsx(Code2, { className: "size-3.5 shrink-0 text-primary" }), _jsxs("span", { children: ["\u062A\u0637\u0648\u064A\u0631: ", DEFAULT_DEVELOPER.name, _jsx("br", {}), _jsx("span", { dir: "ltr", children: DEFAULT_DEVELOPER.phone })] })] })] })] }), _jsxs("div", { className: "min-w-0", children: [_jsxs("header", { className: "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur lg:hidden", children: [_jsxs(Link, { to: "/admin", className: "flex items-center gap-2 font-black text-ink", children: [_jsx(ShieldCheck, { className: "size-5 text-primary" }), "\u0644\u0648\u062D\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629"] }), _jsx("button", { onClick: () => setMobileOpen((v) => !v), className: "flex size-9 cursor-pointer items-center justify-center rounded-lg text-ink hover:bg-subtle-strong", children: mobileOpen ? _jsx(X, { className: "size-5" }) : _jsx(Menu, { className: "size-5" }) })] }), mobileOpen && (_jsxs("div", { className: "relative z-20 max-h-[70vh] overflow-y-auto border-b border-border bg-surface p-4 lg:hidden", children: [_jsxs("nav", { className: "space-y-1", children: [NAV.flatMap((g) => g.items).map((item) => (_jsxs(NavLink, { to: item.to, end: item.end, onClick: () => setMobileOpen(false), className: ({ isActive }) => cn('flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-subtle', isActive && 'bg-primary-light/70 text-primary-dark'), children: [_jsx(item.icon, { className: "size-4.5" }), item.label] }, item.to))), _jsxs("button", { onClick: () => void handleLogout(), className: "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-error", children: [_jsx(LogOut, { className: "size-4.5" }), "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C"] })] }), _jsxs("a", { href: `tel:${DEFAULT_DEVELOPER.phone}`, className: "mt-2 flex items-center gap-1.5 rounded-xl bg-subtle px-3 py-2 text-[11px] text-muted", children: [_jsx(Code2, { className: "size-3.5 shrink-0 text-primary" }), "\u062A\u0637\u0648\u064A\u0631: ", DEFAULT_DEVELOPER.name, " \u2014 ", _jsx("span", { dir: "ltr", children: DEFAULT_DEVELOPER.phone })] })] })), _jsx("main", { className: "p-4 sm:p-6 lg:p-8", children: _jsx(Outlet, {}) })] })] }));
}
export function AdminLayout() {
    return (_jsx(AdminAuthProvider, { children: _jsx(AdminShell, {}) }));
}
