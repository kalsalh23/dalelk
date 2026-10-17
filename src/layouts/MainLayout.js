import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);
    return null;
}
export function MainLayout() {
    return (_jsxs("div", { className: "flex min-h-screen flex-col", children: [_jsx(ScrollToTop, {}), _jsx(Header, {}), _jsx("main", { className: "flex-1 pb-24 md:pb-0", children: _jsx(Outlet, {}) }), _jsx(Footer, {}), _jsx(BottomNav, {})] }));
}
