import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { APP_NAME } from '@/constants';
import { motion } from 'framer-motion';
export function Breadcrumbs({ items }) {
    return (_jsxs("nav", { "aria-label": "\u0645\u0633\u0627\u0631 \u0627\u0644\u062A\u0646\u0642\u0644", className: "flex flex-wrap items-center gap-1.5 text-sm text-muted", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-1 transition-colors hover:text-primary", children: [_jsx(Home, { className: "size-3.5" }), APP_NAME] }), items.map((item, i) => {
                const last = i === items.length - 1;
                return (_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(ChevronLeft, { className: "size-4 text-faint" }), last || !item.to ? (_jsx("span", { className: last ? 'font-semibold text-ink' : '', children: item.label })) : (_jsx(Link, { to: item.to, className: "transition-colors hover:text-primary", children: item.label }))] }, i));
            })] }));
}
/** عنوان قسم موحّد */
export function SectionTitle({ title, subtitle, icon, }) {
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 12 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, className: "mb-6 flex items-start gap-3", children: [icon && (_jsx("div", { className: "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-dark", children: icon })), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-black text-ink sm:text-2xl", children: title }), subtitle && _jsx("p", { className: "mt-1 text-sm text-muted", children: subtitle })] })] }));
}
