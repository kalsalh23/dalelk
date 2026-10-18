import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, HelpCircle, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { readStoredSession } from '@/services/entityAccount';
import { DEFAULT_DEVELOPER, FEATURE_CLINICS } from '@/constants';
const NAV = [
    { label: 'الرئيسية', to: '/' },
    { label: 'الأطباء', to: '/doctors' },
    { label: 'العيادات', to: '/clinics' },
    { label: 'الصيدليات', to: '/pharmacies' },
    { label: 'الصيدليات المناوبة', to: '/duty-pharmacies', extra: true },
    { label: 'المراكز الصحية', to: '/health-centers', extra: true },
    { label: 'عن المنصة', to: '/about-platform', extra: true },
    { label: 'اسأل دليلك', to: '/ask' },
].filter((n) => FEATURE_CLINICS || n.to !== '/clinics');
export function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hasEntitySession, setHasEntitySession] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const check = () => setHasEntitySession(Boolean(readStoredSession()));
        check();
        const onStorage = () => check();
        window.addEventListener('storage', onStorage);
        // تحقق دوري بسيط عند تغير المسار
        const id = setInterval(check, 1500);
        return () => { window.removeEventListener('storage', onStorage); clearInterval(id); };
    }, []);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);
    return (_jsxs("header", { className: cn('sticky top-0 z-50 border-b border-border/70 bg-surface/85 backdrop-blur-lg transition-shadow', scrolled && 'shadow-sm'), children: [_jsxs("div", { className: "mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6", children: [_jsx(Link, { to: "/", className: "flex shrink-0 items-center gap-2.5", children: _jsx(Logo, {}) }), _jsx("nav", { className: "hidden items-center gap-1 lg:flex", children: NAV.map((item) => (_jsx(NavLink, { to: item.to, className: ({ isActive }) => cn('rounded-xl px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-subtle hover:text-primary', item.extra && 'hidden xl:inline-flex', isActive && 'bg-primary-light/70 text-primary-dark'), children: item.to === '/ask' ? (_jsxs("span", { className: "inline-flex items-center gap-1.5", children: [_jsx(HelpCircle, { className: "size-4" }), "\u0627\u0633\u0623\u0644"] })) : (item.label) }, item.to))) }), _jsxs("div", { className: "flex items-center gap-2", children: [false && (_jsxs(Link, { to: hasEntitySession ? '/dashboard' : '/dashboard/login', className: cn('hidden sm:inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition', hasEntitySession
                                    ? 'border-primary bg-primary text-white hover:bg-primary-dark'
                                    : 'border-border bg-surface text-ink hover:border-primary/40 hover:text-primary'), children: [hasEntitySession ? _jsx(LayoutDashboard, { className: "size-4" }) : _jsx(ShieldCheck, { className: "size-4" }), _jsx("span", { children: hasEntitySession ? 'لوحة التحكم' : 'دخول الجهة' })] })), _jsxs("a", { href: "https://wa.me/963952639157", target: "_blank", rel: "noopener noreferrer", className: "hidden md:inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-ink transition hover:border-primary/40 hover:text-primary", children: [_jsx("span", { className: "font-black", children: "\u0645\u0637\u0648\u0651\u0631 \u0627\u0644\u0645\u0646\u0635\u0629:" }), _jsx("span", { className: "text-muted", dir: "ltr", children: "0952639157" })] }), _jsxs("button", { onClick: () => navigate('/search'), className: "flex items-center gap-2 rounded-xl bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-dark cursor-pointer", style: { padding: '9px 18px' }, children: [_jsx(Search, { className: "size-4.5" }), _jsx("span", { className: "hidden sm:inline", children: "\u0628\u062D\u062B" })] }), _jsx("button", { onClick: () => setMenuOpen((v) => !v), className: "flex size-10 items-center justify-center rounded-xl text-ink transition hover:bg-subtle-strong lg:hidden cursor-pointer", "aria-label": "\u0627\u0644\u0642\u0627\u0626\u0645\u0629", children: menuOpen ? _jsx(X, { className: "size-6" }) : _jsx(Menu, { className: "size-6" }) })] })] }), _jsx(AnimatePresence, { children: menuOpen && (_jsx(motion.div, { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, className: "absolute inset-x-0 top-full border-b border-border bg-surface shadow-xl lg:hidden", children: _jsxs("nav", { className: "flex max-h-[75vh] flex-col gap-1 overflow-y-auto p-4", children: [NAV.map((item) => (_jsx(NavLink, { to: item.to, onClick: () => setMenuOpen(false), className: ({ isActive }) => cn('rounded-xl px-4 py-3 text-sm font-semibold text-muted transition-colors hover:bg-subtle hover:text-primary', isActive && 'bg-primary-light/70 text-primary-dark'), children: item.label }, item.to))), _jsxs("div", { className: "mt-2 border-t border-border pt-3", children: [_jsxs("a", { href: `https://wa.me/${DEFAULT_DEVELOPER.international_phone.replace('+', '')}`, target: "_blank", rel: "noopener noreferrer", onClick: () => setMenuOpen(false), className: "flex items-center justify-between gap-2 rounded-xl bg-subtle px-4 py-3 text-xs font-bold text-ink transition hover:text-primary", children: [_jsxs("span", { children: [_jsx("span", { className: "block text-[11px] font-semibold text-muted", children: DEFAULT_DEVELOPER.title }), _jsx("span", { className: "font-black", children: DEFAULT_DEVELOPER.name })] }), _jsx("span", { className: "shrink-0 rounded-lg border border-border bg-surface px-2.5 py-1 text-muted", dir: "ltr", children: DEFAULT_DEVELOPER.phone })] }), false && (_jsxs(Link, { to: hasEntitySession ? '/dashboard' : '/dashboard/login', onClick: () => setMenuOpen(false), className: cn('flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition', hasEntitySession
                                            ? 'bg-primary text-white'
                                            : 'border border-border bg-surface text-ink'), children: [hasEntitySession ? _jsx(LayoutDashboard, { className: "size-4" }) : _jsx(ShieldCheck, { className: "size-4" }), hasEntitySession ? 'لوحة التحكم' : 'دخول الجهة — لوحة التحكم'] }))] })] }) })) })] }));
}
