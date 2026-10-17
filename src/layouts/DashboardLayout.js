import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Images, Clock, MapPin, ShieldCheck, LogOut, Menu, X, ExternalLink, Crown, Eye, Code2, CalendarClock, HelpCircle, BarChart3, QrCode, } from 'lucide-react';
import { fetchEntitySession, readStoredSession, clearStoredSession, entityDisplayName, entityDisplayType } from '@/services/entityAccount';
import { FullPageLoader } from '@/components/ui/States';
import { PlanBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, effectivePlan } from '@/lib/utils';
import { DEFAULT_DEVELOPER } from '@/constants';
const NAV = [
    { to: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard, end: true },
    { to: '/dashboard/appointments', label: 'طلبات المواعيد', icon: CalendarClock },
    { to: '/dashboard/stats', label: 'إحصائياتي', icon: BarChart3 },
    { to: '/dashboard/qr', label: 'رمز QR', icon: QrCode },
    { to: '/dashboard/qa', label: 'اكتب سؤالك', icon: HelpCircle, doctorOnly: true },
    { to: '/dashboard/profile', label: 'الملف الشخصي', icon: User },
    { to: '/dashboard/media', label: 'الصور والمعرض', icon: Images },
    { to: '/dashboard/hours', label: 'أوقات الدوام', icon: Clock },
    { to: '/dashboard/location', label: 'الموقع والعنوان', icon: MapPin },
];
function DashboardShell() {
    const [checking, setChecking] = useState(true);
    const [session, setSession] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const stored = readStoredSession();
        if (!stored) {
            setChecking(false);
            return;
        }
        void fetchEntitySession(stored.token).then((d) => {
            if (d)
                setSession(d);
            else
                clearStoredSession();
        }).finally(() => setChecking(false));
    }, []);
    const logout = () => {
        clearStoredSession();
        setSession(null);
        navigate('/dashboard/login');
    };
    if (checking)
        return _jsx(FullPageLoader, { label: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062C\u0644\u0633\u0629\u2026" });
    // غير مسجل → عرض الـ Outlet (login) بدون sidebar
    if (!session) {
        const isLogin = window.location.pathname.startsWith('/dashboard/login');
        if (isLogin)
            return _jsx(Outlet, { context: { session: null } });
        // افتراضياً إعادة توجيه لصفحة الدخول
        return (_jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center", children: [_jsx("div", { className: "flex size-16 items-center justify-center rounded-3xl bg-primary-light text-primary-dark", children: _jsx(ShieldCheck, { className: "size-8" }) }), _jsx("h1", { className: "text-xl font-black text-ink", children: "\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u062C\u0647\u0629" }), _jsx("p", { className: "max-w-sm text-sm leading-6 text-muted", children: "\u0633\u062C\u0651\u0644 \u062F\u062E\u0648\u0644\u0643 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0628\u0631\u064A\u062F \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631 \u0627\u0644\u062A\u064A \u0627\u0633\u062A\u0644\u0645\u062A\u0647\u0627 \u0628\u0639\u062F \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u062A\u0631\u0642\u064A\u062A\u0643." }), _jsx(Link, { to: "/dashboard/login", className: "rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-dark", children: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" }), _jsx(Link, { to: "/", className: "text-xs text-muted hover:underline", children: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0631\u0626\u064A\u0633\u064A\u0629" })] }));
    }
    const routeLink = session.entity_type === 'health_center' ? 'health-centers'
        : session.entity_type === 'radiology' ? 'radiology'
            : `${session.entity_type}s`;
    return (_jsxs("div", { className: "min-h-screen bg-background lg:grid lg:grid-cols-[280px_1fr]", children: [_jsxs("aside", { className: "sticky top-0 hidden h-screen flex-col overflow-y-auto border-l border-border bg-surface lg:flex", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2.5 px-6 py-6", children: [_jsx("div", { className: "flex size-10 items-center justify-center rounded-2xl bg-primary text-white", children: _jsx(ShieldCheck, { className: "size-5" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-black text-ink", children: "\u062F\u0644\u064A\u0644 \u0637\u064A\u0628\u0629 \u0627\u0644\u0625\u0645\u0627\u0645 \u0627\u0644\u0637\u0628\u064A" }), _jsx("p", { className: "text-[10px] font-bold text-primary", children: "\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u062C\u0647\u0629" })] })] }), _jsxs("div", { className: "mx-4 rounded-2xl border border-border bg-subtle p-4", children: [_jsx("p", { className: "text-sm font-black text-ink line-clamp-1", children: entityDisplayName(session.entity) }), _jsxs("p", { className: "mt-1 flex items-center gap-2 text-xs text-muted", children: [entityDisplayType(session.entity_type), _jsx(PlanBadge, { plan: effectivePlan(session.entity) })] }), _jsx("p", { className: "mt-1 text-[11px] text-muted", dir: "ltr", children: session.email }), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsxs(Link, { to: `/${routeLink}/${session.slug}`, className: "flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-surface border border-border px-3 py-2 text-xs font-bold text-ink hover:bg-white", children: [_jsx(ExternalLink, { className: "size-3.5" }), " \u0639\u0631\u0636 \u0635\u0641\u062D\u062A\u064A"] }), _jsxs("span", { className: "inline-flex items-center gap-1 rounded-xl bg-primary-light px-2.5 py-2 text-xs font-bold text-primary-dark", children: [_jsx(Eye, { className: "size-3.5" }), " ", String(session.entity?.view_count ?? 0)] })] })] }), _jsx("nav", { className: "mt-4 flex-1 space-y-1 px-3", children: NAV.filter((item) => !item.doctorOnly || session.entity_type === 'doctor').map((item) => (_jsxs(NavLink, { to: item.to, end: item.end, className: ({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors', isActive ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-subtle hover:text-primary'), children: [_jsx(item.icon, { className: "size-4.5" }), item.label] }, item.to))) }), _jsxs("div", { className: "border-t border-border p-4", children: [(effectivePlan(session.entity) !== 'free') && (_jsxs("div", { className: "mb-3 flex items-center gap-2 rounded-xl bg-gold-soft px-3 py-2 text-xs font-bold text-gold-dark", children: [_jsx(Crown, { className: "size-4" }), " ", (effectivePlan(session.entity) === 'gold') ? 'الباقة الذهبية' : 'الباقة الاحترافية', " \u0646\u0634\u0637\u0629"] })), _jsxs(Button, { variant: "outline", size: "sm", className: "w-full", onClick: logout, children: [_jsx(LogOut, { className: "size-4" }), " \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C"] }), _jsxs("a", { href: `tel:${DEFAULT_DEVELOPER.phone}`, className: "mt-2 flex items-center justify-center gap-1 text-center text-[11px] text-muted transition-colors hover:text-primary", children: [_jsx(Code2, { className: "size-3 shrink-0 text-primary" }), "\u062A\u0637\u0648\u064A\u0631: ", DEFAULT_DEVELOPER.name, " \u2014 ", _jsx("span", { dir: "ltr", children: DEFAULT_DEVELOPER.phone })] })] })] }), _jsxs("div", { className: "min-w-0", children: [_jsxs("header", { className: "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur lg:hidden", children: [_jsxs(Link, { to: "/dashboard", className: "flex items-center gap-2 font-black text-ink text-sm", children: [_jsx(ShieldCheck, { className: "size-5 text-primary" }), " \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Link, { to: `/${routeLink}/${session.slug}`, className: "text-xs font-bold text-primary hover:underline", children: "\u0639\u0631\u0636 \u0635\u0641\u062D\u062A\u064A" }), _jsx("button", { onClick: () => setMobileOpen((v) => !v), className: "flex size-9 items-center justify-center rounded-lg text-ink hover:bg-subtle-strong", children: mobileOpen ? _jsx(X, { className: "size-5" }) : _jsx(Menu, { className: "size-5" }) })] })] }), mobileOpen && (_jsxs("div", { className: "border-b border-border bg-surface p-3 lg:hidden", children: [_jsxs("nav", { className: "grid gap-1", children: [NAV.filter((item) => !item.doctorOnly || session.entity_type === 'doctor').map((item) => (_jsxs(NavLink, { to: item.to, end: item.end, onClick: () => setMobileOpen(false), className: ({ isActive }) => cn('flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold', isActive ? 'bg-primary text-white' : 'text-muted hover:bg-subtle'), children: [_jsx(item.icon, { className: "size-4.5" }), " ", item.label] }, item.to))), _jsxs("button", { onClick: logout, className: "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-error hover:bg-wine-soft", children: [_jsx(LogOut, { className: "size-4.5" }), " \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C"] })] }), _jsxs("div", { className: "mt-3 rounded-xl bg-subtle p-3", children: [_jsx("p", { className: "text-sm font-bold text-ink", children: entityDisplayName(session.entity) }), _jsxs("p", { className: "text-xs text-muted", children: [entityDisplayType(session.entity_type), " \u2014 ", session.email] }), _jsxs("a", { href: `tel:${DEFAULT_DEVELOPER.phone}`, className: "mt-1.5 flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-primary", children: [_jsx(Code2, { className: "size-3 shrink-0 text-primary" }), "\u062A\u0637\u0648\u064A\u0631: ", DEFAULT_DEVELOPER.name, " \u2014 ", _jsx("span", { dir: "ltr", children: DEFAULT_DEVELOPER.phone })] })] })] })), _jsx("main", { className: "p-4 sm:p-6 lg:p-8", children: _jsx(Outlet, { context: { session, setSession } }) })] })] }));
}
export function DashboardLayout() {
    return _jsx(DashboardShell, {});
}
// hook لقراءة session من Outlet context
import { useOutletContext } from 'react-router-dom';
export function useDashboardSession() {
    return useOutletContext();
}
