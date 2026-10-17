import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { SearchX, Home } from 'lucide-react';
export function NotFoundPage() {
    return (_jsxs("div", { className: "flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center", children: [_jsx("div", { className: "flex size-20 items-center justify-center rounded-3xl bg-primary-light text-primary-dark", children: _jsx(SearchX, { className: "size-10" }) }), _jsx("h1", { className: "text-3xl font-black text-ink", children: "404" }), _jsx("p", { className: "max-w-sm text-sm text-muted", children: "\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u062A\u064A \u062A\u0628\u062D\u062B \u0639\u0646\u0647\u0627 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629 \u0623\u0648 \u062A\u0645 \u0646\u0642\u0644\u0647\u0627." }), _jsxs(Link, { to: "/", className: "inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark", children: [_jsx(Home, { className: "size-4" }), "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0631\u0626\u064A\u0633\u064A\u0629"] })] }));
}
