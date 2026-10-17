import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Stethoscope, Pill, MoonStar, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
const ITEMS = [
    { label: 'الرئيسية', to: '/', icon: Home },
    { label: 'الصيدليات', to: '/pharmacies', icon: Pill },
    { label: 'الأطباء', to: '/doctors', icon: Stethoscope, center: true },
    { label: 'الصيدليات المناوبة', to: '/duty-pharmacies', icon: MoonStar },
    { label: 'اسأل', to: '/ask', icon: HelpCircle },
];
export function BottomNav() {
    const { pathname } = useLocation();
    if (pathname.startsWith('/admin'))
        return null;
    return (_jsx("nav", { className: "fixed inset-x-0 bottom-0 z-50 md:hidden", children: _jsx("div", { className: "relative border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg", children: _jsx("div", { className: "relative mx-auto flex max-w-md items-end justify-around", children: ITEMS.map((item) => {
                    const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
                    if ('center' in item && item.center) {
                        return (_jsxs(NavLink, { to: item.to, "aria-label": item.label, className: "relative flex flex-1 flex-col items-center", children: [_jsx("span", { className: cn('absolute -top-7 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30 ring-4 ring-surface transition-transform active:scale-95', active && 'shadow-xl shadow-primary/40'), children: _jsx(item.icon, { className: "size-7" }) }), _jsx("span", { className: cn('mb-2.5 mt-8 text-[10px] font-bold', active ? 'text-primary-dark' : 'text-muted'), children: item.label })] }, item.to));
                    }
                    return (_jsxs(NavLink, { to: item.to, className: "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-muted transition-colors hover:text-primary", children: [_jsx("div", { className: cn('flex size-9 items-center justify-center rounded-xl transition-all', active ? 'bg-primary-light text-primary-dark' : ''), children: _jsx(item.icon, { className: "size-5" }) }), _jsx("span", { className: cn(active && 'text-primary-dark'), children: item.label })] }, item.to));
                }) }) }) }));
}
