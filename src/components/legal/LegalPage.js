import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {} from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Seo } from '@/components/seo/Seo';
export function LegalPage({ title, path, updated, children, }) {
    return (_jsxs("div", { className: "mx-auto max-w-3xl px-4 py-8 sm:px-6", children: [_jsx(Seo, { title: title, path: path, type: "website" }), _jsx(Breadcrumbs, { items: [{ label: title }] }), _jsx("h1", { className: "mt-4 text-2xl font-black text-ink sm:text-3xl", children: title }), updated && _jsxs("p", { className: "mt-1 text-xs text-muted", children: ["\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B: ", updated] }), _jsx("div", { className: "prose-ink mt-6 space-y-6 text-sm leading-8 text-muted [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-ink [&_p]:leading-8 [&_strong]:text-ink [&_ul]:list-inside [&_ul]:space-y-1.5 [&_h2]:mb-2", children: children })] }));
}
