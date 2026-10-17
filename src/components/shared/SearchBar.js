import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { globalSearch } from '@/services/search';
import { cn } from '@/lib/utils';
import { getPublicUrl } from '@/lib/supabase';
import { track } from '@/services/stats';
import { EntityIcon } from '@/components/ui/EntityIcon';
const TYPE_STYLES = {
    doctor: { label: 'طبيب', color: '#428177' },
    clinic: { label: 'عيادة', color: '#054239' },
    hospital: { label: 'مشفى', color: '#6b1f2a' },
    pharmacy: { label: 'صيدلية', color: '#988561' },
    lab: { label: 'مخبر', color: '#4a151e' },
    radiology: { label: 'أشعة', color: '#260f14' },
    health_center: { label: 'مركز صحي', color: '#b9a779' },
    question: { label: 'سؤال', color: '#6b1f2a' },
};
export function SearchBar({ big, className, autoFocus, onSubmitted, }) {
    const [q, setQ] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const timer = useRef(null);
    const boxRef = useRef(null);
    useEffect(() => {
        const onClick = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);
    useEffect(() => {
        if (timer.current)
            clearTimeout(timer.current);
        if (q.trim().length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }
        setLoading(true);
        timer.current = setTimeout(async () => {
            const res = await globalSearch(q, null);
            setResults(res);
            setLoading(false);
            setOpen(true);
        }, 300);
        return () => {
            if (timer.current)
                clearTimeout(timer.current);
        };
    }, [q]);
    const submit = (e) => {
        e.preventDefault();
        if (!q.trim())
            return;
        void track('search', { path: `/search?q=${encodeURIComponent(q)}` });
        setOpen(false);
        navigate(`/search?q=${encodeURIComponent(q.trim())}`);
        onSubmitted?.();
    };
    return (_jsxs("div", { ref: boxRef, className: cn('relative', className), children: [_jsx("form", { onSubmit: submit, className: big ? 'relative' : '', children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: cn('absolute right-4 top-1/2 -translate-y-1/2 text-muted', big ? 'size-6' : 'size-4.5') }), _jsx("input", { value: q, onChange: (e) => setQ(e.target.value), onFocus: () => results.length > 0 && setOpen(true), autoFocus: autoFocus, placeholder: "\u0627\u0628\u062D\u062B \u0639\u0646 \u0637\u0628\u064A\u0628\u060C \u0627\u062E\u062A\u0635\u0627\u0635\u060C \u0639\u064A\u0627\u062F\u0629\u060C \u0635\u064A\u062F\u0644\u064A\u0629 \u0623\u0648 \u062E\u062F\u0645\u0629 \u0637\u0628\u064A\u0629...", className: cn('w-full rounded-2xl bg-surface text-ink outline-none transition-all ring-border placeholder:text-muted/70', big
                                ? 'h-14 pr-13 pl-24 text-base shadow-lg shadow-faint/40 focus:ring-4 focus:ring-primary/15 sm:h-16 sm:text-lg'
                                : 'h-11 pr-11 pl-4 text-sm border border-border focus:border-primary focus:ring-4 focus:ring-primary/15') }), _jsx("button", { type: "submit", className: cn('absolute left-2 top-1/2 -translate-y-1/2 rounded-xl font-bold text-white transition-all hover:bg-primary-dark cursor-pointer', big ? 'h-10 px-6 text-sm sm:h-12 sm:px-8' : 'h-8 px-4 text-xs'), style: { backgroundColor: '#428177' }, children: loading ? _jsx(Loader2, { className: "size-4 animate-spin" }) : 'بحث' })] }) }), open && q.trim().length >= 2 && (_jsxs("div", { className: "absolute inset-x-0 top-full z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-surface p-2 shadow-2xl", dir: "rtl", children: [loading && (_jsxs("div", { className: "flex items-center gap-2 px-4 py-3 text-sm text-muted", children: [_jsx(Loader2, { className: "size-4 animate-spin" }), "\u062C\u0627\u0631\u064D \u0627\u0644\u0628\u062D\u062B\u2026"] })), !loading && results.length === 0 && (_jsx("div", { className: "px-4 py-6 text-center text-sm text-muted", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C \u0645\u0637\u0627\u0628\u0642\u0629" })), results.map((group) => {
                        const style = TYPE_STYLES[group.type];
                        return (_jsxs("div", { className: "mb-1", children: [_jsxs("p", { className: "flex items-center gap-2 px-3 py-2 text-xs font-bold", style: { color: style?.color ?? '#428177' }, children: [_jsx("span", { className: "inline-block size-2 rounded-full", style: { backgroundColor: style?.color } }), group.label] }), group.items.map((item) => {
                                    const id = String(item.id);
                                    const name = String(item.name ?? item.title ?? item.question ?? '');
                                    const img = getPublicUrl(item.image);
                                    const route = group.type === 'question'
                                        ? `/ask?s=${encodeURIComponent(String(item.question ?? ''))}`
                                        : `/${group.type === 'health_center' ? 'health-centers' : `${group.type === 'radiology' ? 'radiology' : group.type}s`}/${item.slug ?? id}`;
                                    return (_jsxs("button", { onClick: () => {
                                            setOpen(false);
                                            navigate(route);
                                        }, className: "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right transition-colors hover:bg-subtle cursor-pointer", children: [img ? (_jsx("img", { src: img, alt: "", className: "size-9 rounded-lg object-cover" })) : (_jsx("div", { className: "flex size-9 items-center justify-center rounded-lg bg-primary-light text-primary-dark", children: _jsx(EntityIcon, { type: group.type ?? 'doctor', className: "size-4.5" }) })), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate text-sm font-semibold text-ink", children: name }), item.specialty && group.type === 'doctor' ? (_jsx("p", { className: "text-xs text-muted", children: String(item.specialty) })) : null] })] }, id));
                                })] }, group.type));
                    }), _jsxs("button", { onClick: submit, className: "mt-1 w-full rounded-xl bg-primary-light/60 px-3 py-2.5 text-sm font-bold text-primary-dark hover:bg-primary-light cursor-pointer", children: ["\u0639\u0631\u0636 \u0643\u0644 \u0646\u062A\u0627\u0626\u062C \u00AB", q, "\u00BB"] })] }))] }));
}
