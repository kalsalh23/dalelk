import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SearchX } from 'lucide-react';
import { globalSearch } from '@/services/search';
import { getPublicUrl } from '@/lib/supabase';
import { Spinner } from '@/components/ui/States';
import { Seo } from '@/components/seo/Seo';
import { track } from '@/services/stats';
const TYPE_META = {
    doctor: { label: 'أطباء', titleKey: 'name', descKey: 'specialty', route: (s, id) => `/doctors/${s || id}` },
    clinic: { label: 'عيادات', titleKey: 'name', descKey: 'specialty', route: (s, id) => `/clinics/${s || id}` },
    hospital: { label: 'مشافي', titleKey: 'name', route: (s, id) => `/hospitals/${s || id}` },
    health_center: { label: 'مراكز صحية', titleKey: 'name', route: (s, id) => `/health-centers/${s || id}` },
    pharmacy: { label: 'صيدليات', titleKey: 'name', route: (s, id) => `/pharmacies/${s || id}` },
    lab: { label: 'مخابر', titleKey: 'name', route: (s, id) => `/labs/${s || id}` },
    radiology: { label: 'مراكز الأشعة', titleKey: 'name', route: (s, id) => `/radiology/${s || id}` },
    question: { label: 'أسئلة وأجوبة', titleKey: 'question', descKey: 'answer', route: (s, id) => `/ask?s=${encodeURIComponent(String(s || id))}` },
};
export function SearchPage() {
    const [params] = useSearchParams();
    const q = params.get('q') ?? '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let alive = true;
        if (!q.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        void track('search', { path: `/search?q=${encodeURIComponent(q)}` });
        globalSearch(q, null).then((res) => {
            if (alive) {
                setResults(res);
                setLoading(false);
            }
        });
        return () => {
            alive = false;
        };
    }, [q]);
    const searchUrl = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
    const filtered = results.filter((r) => r.items.length > 0);
    return (_jsxs("div", { className: "mx-auto max-w-5xl px-4 py-8 sm:px-6", children: [_jsx(Seo, { title: q ? `نتائج البحث عن «${q}»` : 'البحث', path: `/search${searchUrl}` }), _jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0627\u0644\u0628\u062D\u062B \u0641\u064A \u062F\u0644\u064A\u0644 \u0637\u064A\u0628\u0629 \u0627\u0644\u0625\u0645\u0627\u0645 \u0627\u0644\u0637\u0628\u064A" }), _jsxs("form", { action: "/search", method: "get", className: "relative mt-5", children: [_jsx(Search, { className: "absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted" }), _jsx("input", { name: "q", defaultValue: q, placeholder: "\u0627\u0628\u062D\u062B \u0639\u0646 \u0637\u0628\u064A\u0628\u060C \u0627\u062E\u062A\u0635\u0627\u0635\u060C \u0639\u064A\u0627\u062F\u0629\u060C \u0635\u064A\u062F\u0644\u064A\u0629 \u0623\u0648 \u062E\u062F\u0645\u0629 \u0637\u0628\u064A\u0629...", className: "h-14 w-full rounded-2xl border border-border bg-surface pr-12 pl-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15" }), _jsx("button", { type: "submit", className: "absolute left-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark cursor-pointer", children: "\u0628\u062D\u062B" })] }), _jsx("div", { className: "mt-8 space-y-8", children: loading ? (_jsxs("div", { className: "flex items-center gap-2 py-10 text-muted", children: [_jsx(Spinner, {}), " \u062C\u0627\u0631\u064D \u0627\u0644\u0628\u062D\u062B\u2026"] })) : !q.trim() ? (_jsx("p", { className: "py-10 text-center text-sm text-muted", children: "\u0627\u0643\u062A\u0628 \u0643\u0644\u0645\u0629 \u0628\u062D\u062B \u0644\u0644\u0628\u062F\u0621." })) : filtered.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center gap-3 py-14 text-center", children: [_jsx(SearchX, { className: "size-12 text-faint" }), _jsxs("p", { className: "font-bold text-ink", children: ["\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C \u0644\u0640 \u00AB", q, "\u00BB"] }), _jsx("p", { className: "text-sm text-muted", children: "\u062C\u0631\u0651\u0628 \u0643\u0644\u0645\u0627\u062A \u0628\u062D\u062B \u0623\u062E\u0631\u0649 \u0623\u0648 \u062A\u0635\u0641\u062D \u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629." }), _jsx("div", { className: "mt-2 flex flex-wrap justify-center gap-2", children: [['الأطباء', '/doctors'], ['العيادات', '/clinics'], ['الصيدليات', '/pharmacies'], ['اسأل', '/ask']].map(([l, to]) => (_jsx(Link, { to: to, className: "rounded-full border border-border bg-surface px-4 py-2 text-xs font-bold text-primary hover:bg-primary-light/40", children: l }, to))) })] })) : (filtered.map((group) => {
                    const meta = TYPE_META[group.type];
                    if (!meta)
                        return null;
                    return (_jsxs(motion.section, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, children: [_jsxs("h2", { className: "mb-3 flex items-center gap-2 text-lg font-black text-ink", children: [_jsx("span", { className: "h-6 w-9 rounded-lg bg-primary-light" }), meta.label, _jsxs("span", { className: "text-xs font-semibold text-muted", children: ["(", group.items.length, ")"] })] }), _jsx("div", { className: "space-y-2", children: group.items.map((item) => {
                                    const id = String(item.id);
                                    const slug = String(item.slug ?? '');
                                    const title = String(item[meta.titleKey] ?? '');
                                    const desc = meta.descKey ? String(item[meta.descKey] ?? '') : '';
                                    return (_jsxs(Link, { to: meta.route(slug, id), className: "flex items-center gap-4 rounded-2xl border border-border bg-surface p-3.5 transition-all hover:border-primary/40 hover:shadow-md", children: [item.image ? (_jsx("img", { src: getPublicUrl(item.image) ?? '', alt: "", className: "size-12 rounded-xl object-cover" })) : (_jsx("div", { className: "flex size-12 items-center justify-center rounded-xl bg-primary-light text-primary-dark", children: _jsx(Search, { className: "size-5" }) })), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-sm font-bold text-ink", children: title }), desc && _jsx("p", { className: "mt-0.5 line-clamp-1 text-xs text-muted", children: desc })] })] }, id));
                                }) })] }, group.type));
                })) })] }));
}
