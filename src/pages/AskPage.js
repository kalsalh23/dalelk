import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HelpCircle, Search, Send, ClipboardList, Stethoscope, MessageSquareText } from 'lucide-react';
import { searchQuestions, saveUnansweredQuestion } from '@/services/articles';
import { useEntities } from '@/hooks/useEntities';
import { Skeletons } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { Card, CardBody } from '@/components/ui/Card';
import { SPECIALTIES } from '@/constants';
import { Seo } from '@/components/seo/Seo';
import { track } from '@/services/stats';
export function AskPage() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [suggestions, setSuggestions] = useState({ doctors: [], clinics: [] });
    const toast = useToast();
    const { data: doctors } = useEntities('doctor', { limit: 4 });
    const { data: clinics } = useEntities('clinic', { limit: 4 });
    const handleSearch = async () => {
        const q = query.trim();
        if (!q)
            return;
        setLoading(true);
        setSelected(null);
        setAnswered(false);
        setNotFound(false);
        void track('search', { path: `/ask?q=${encodeURIComponent(q)}` });
        const found = await searchQuestions(q);
        setLoading(false);
        if (found.length) {
            const needDisambiguation = found.length > 1 && found[0]._score === found[1]._score;
            setResults(found);
            if (!needDisambiguation) {
                setSelected(found[0]);
                setMatched(found[0]);
            }
            else {
                setMatched(null);
            }
        }
        else {
            setResults([]);
            setNotFound(true);
            setSuggestions({
                doctors: (doctors?.data ?? []),
                clinics: (clinics?.data ?? []),
            });
        }
    };
    const setMatched = (item) => {
        setSelected(item);
        setAnswered(true);
        setNotFound(false);
    };
    const matchedUs = useMemo(() => results, [results]);
    const saveQuestion = async () => {
        const ok = await saveUnansweredQuestion(query.trim());
        if (ok) {
            toast.show('تم إرسال سؤالك لإدارة المنصة، شكراً لك!', 'success');
        }
        else {
            toast.show('تعذر إرسال السؤال، حاول مجدداً', 'error');
        }
    };
    return (_jsxs("div", { className: "mx-auto max-w-4xl px-4 py-8 sm:px-6", children: [_jsx(Seo, { title: "\u0627\u0633\u0623\u0644 \u062F\u0644\u064A\u0644\u0643", description: "\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643 \u0627\u0644\u0635\u062D\u064A \u0648\u0633\u0646\u0628\u062D\u062B \u0644\u0643 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0639\u0646 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0623\u0642\u0631\u0628 \u0644\u0633\u0624\u0627\u0644\u0643.", path: "/ask" }), _jsxs(Card, { className: "overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-l from-primary-dark to-primary px-6 py-10 text-center text-white sm:px-10", children: [_jsx("div", { className: "mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur", children: _jsx(HelpCircle, { className: "size-7" }) }), _jsx("h1", { className: "text-2xl font-black sm:text-3xl", children: "\u0627\u0633\u0623\u0644 \u062F\u0644\u064A\u0644\u0643" }), _jsx("p", { className: "mx-auto mt-2 max-w-lg text-sm leading-7 text-white/85", children: "\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643 \u0627\u0644\u0635\u062D\u064A \u0648\u0633\u0646\u0628\u062D\u062B \u0644\u0643 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629." })] }), _jsxs(CardBody, { className: "p-5 sm:p-8", children: [_jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(MessageSquareText, { className: "absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted" }), _jsx("input", { value: query, onChange: (e) => { setQuery(e.target.value); if (selected || notFound) {
                                                    setSelected(null);
                                                    setNotFound(false);
                                                } }, onKeyDown: (e) => e.key === 'Enter' && void handleSearch(), placeholder: "\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643 \u0627\u0644\u0635\u062D\u064A\u2026 \u0645\u062B\u0644: \u0645\u0627 \u0639\u0644\u0627\u062C \u0627\u0644\u0633\u0639\u0627\u0644\u061F", className: "h-13 w-full rounded-2xl border border-border bg-surface py-3.5 pl-4 pr-12 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15" })] }), _jsxs("button", { onClick: () => void handleSearch(), disabled: loading || !query.trim(), className: "flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:opacity-50 cursor-pointer", children: [loading ? _jsx("span", { className: "size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" }) : _jsx(Search, { className: "size-4.5" }), "\u0628\u062D\u062B"] })] }), _jsxs(AnimatePresence, { mode: "wait", children: [loading && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "mt-8", children: _jsx(Skeletons, { rows: 2, box: "!p-4" }) }, "load")), !loading && matchedUs.length > 1 && !selected && (_jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, className: "mt-8", children: [_jsx("h2", { className: "mb-3 text-sm font-black text-ink", children: "\u0647\u0644 \u062A\u0642\u0635\u062F\u061F" }), _jsx("div", { className: "space-y-2", children: matchedUs.slice(0, 6).map((m) => (_jsxs("button", { onClick: () => setMatched(m), className: "flex w-full items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 text-right transition hover:border-primary hover:bg-primary-light/30 cursor-pointer", children: [_jsx("span", { className: "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-dark", children: _jsx(Search, { className: "size-4" }) }), _jsx("span", { className: "text-sm font-semibold text-ink", children: m.question })] }, m.id))) })] }, "didyou")), !loading && selected && (_jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, children: [_jsxs("div", { className: "mt-8 rounded-2xl border border-primary/20 bg-primary-light/30 p-5 sm:p-6", children: [_jsx("p", { className: "text-[11px] font-bold text-primary-dark", children: "\u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0639\u0644\u0649 \u0633\u0624\u0627\u0644\u0643" }), _jsx("h2", { className: "mt-1 text-lg font-black text-ink", children: selected.question }), _jsx("div", { className: "mt-3 whitespace-pre-line text-sm leading-8 text-ink", children: selected.answer })] }), _jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-2 text-xs text-muted", children: [_jsx("span", { children: "\u0647\u0644 \u0643\u0627\u0646 \u0647\u0630\u0627 \u0645\u0641\u064A\u062F\u0627\u064B\u061F \u064A\u0645\u0643\u0646\u0643 \u062F\u0627\u0626\u0645\u0627\u064B:" }), _jsx(Link, { to: "/doctors", className: "font-bold text-primary hover:underline", children: "\u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0637\u0628\u064A\u0628" })] })] }, "answer")), !loading && notFound && (_jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, children: [_jsxs("div", { className: "mt-8 overflow-hidden rounded-2xl border border-gold/40 bg-gold-soft/70 p-5 sm:p-6", children: [_jsxs("h2", { className: "flex items-center gap-2 text-base font-black text-ink", children: [_jsx(ClipboardList, { className: "size-5 text-warning" }), "\u0644\u0645 \u0646\u062C\u062F \u0625\u062C\u0627\u0628\u0629 \u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0633\u0624\u0627\u0644\u0643 \u062D\u0627\u0644\u064A\u064B\u0627."] }), _jsx("p", { className: "mt-2 text-sm text-muted", children: "\u0631\u0628\u0645\u0627 \u064A\u0641\u064A\u062F\u0643 \u0627\u0644\u0628\u062D\u062B \u0641\u064A \u0627\u0644\u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u062A\u0627\u0644\u064A\u0629:" }), _jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [_jsxs("div", { className: "rounded-xl border border-border bg-surface p-4", children: [_jsxs("p", { className: "flex items-center gap-1.5 text-xs font-black text-ink", children: [_jsx(Stethoscope, { className: "size-4 text-primary" }), "\u0623\u0637\u0628\u0627\u0621"] }), _jsx("ul", { className: "mt-2 space-y-1.5 text-xs text-muted", children: suggestions.doctors.map((d) => (_jsx("li", { children: _jsx(Link, { to: `/doctors/${d.slug}`, className: "line-clamp-1 hover:text-primary hover:underline", children: d.name }) }, d.slug))) }), _jsx(Link, { to: "/doctors", className: "mt-2 block text-[11px] font-bold text-primary hover:underline", children: "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644 \u2190" })] }), _jsxs("div", { className: "rounded-xl border border-border bg-surface p-4", children: [_jsx("p", { className: "flex items-center gap-1.5 text-xs font-black text-ink", children: "\uD83C\uDFE5\u0639\u064A\u0627\u062F\u0627\u062A" }), _jsx("ul", { className: "mt-2 space-y-1.5 text-xs text-muted", children: suggestions.clinics.map((c) => (_jsx("li", { children: _jsx(Link, { to: `/clinics/${c.slug}`, className: "line-clamp-1 hover:text-primary hover:underline", children: c.name }) }, c.slug))) }), _jsx(Link, { to: "/clinics", className: "mt-2 block text-[11px] font-bold text-primary hover:underline", children: "\u0639\u0631\u0636 \u0627\u0644\u0643\u0644 \u2190" })] })] }), _jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-2 text-xs text-muted", children: [_jsx("span", { className: "font-semibold", children: "\u0627\u062E\u062A\u0635\u0627\u0635\u0627\u062A \u0645\u062A\u0648\u0641\u0631\u0629:" }), SPECIALTIES.slice(0, 6).map((s) => (_jsx(Link, { to: `/doctors?specialty=${encodeURIComponent(s)}`, className: "rounded-full bg-surface border border-border px-2.5 py-1 font-bold text-primary hover:bg-primary-light/40", children: s }, s)))] })] }), _jsxs("div", { className: "mt-5 flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-surface p-6 text-center sm:flex-row sm:text-right", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-sm font-black text-ink", children: "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0633\u0624\u0627\u0644 \u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0642\u0639" }), _jsx("p", { className: "mt-1 text-xs text-muted", children: "\u0633\u064A\u062A\u0645 \u062D\u0641\u0638 \u0633\u0624\u0627\u0644\u0643 \u0648\u0625\u0636\u0627\u0641\u062A\u0647 \u0644\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629 \u0628\u0645\u062C\u0631\u062F \u062A\u0648\u0641\u0631 \u0625\u062C\u0627\u0628\u0629." })] }), _jsxs("button", { onClick: () => void saveQuestion(), className: "flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-dark cursor-pointer", children: [_jsx(Send, { className: "size-4" }), "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0633\u0624\u0627\u0644"] })] })] }, "notfound")), !loading && !results.length && !selected && !notFound && !answered && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "mt-8 rounded-2xl bg-subtle p-5 text-center text-sm text-muted", children: "\u062C\u0631\u0651\u0628 \u0623\u0633\u0626\u0644\u0629 \u0634\u0627\u0626\u0639\u0629 \u0645\u062B\u0644: \u00AB\u0645\u0627 \u0639\u0644\u0627\u062C \u0627\u0644\u0633\u0639\u0627\u0644\u061F\u00BB\u060C \u00AB\u0643\u064A\u0641 \u0623\u062E\u0641\u0636 \u0627\u0644\u0636\u063A\u0637\u061F\u00BB\u060C \u00AB\u0645\u0627 \u0623\u0639\u0631\u0627\u0636 \u0627\u0644\u0633\u0643\u0631\u064A\u061F\u00BB" }, "hint"))] }), _jsxs("div", { className: "mt-8 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold-soft/70 p-4 text-xs leading-6 text-gold-dark", children: [_jsx(HelpCircle, { className: "mt-0.5 size-4 shrink-0" }), "\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0629 \u0644\u0644\u062A\u062B\u0642\u064A\u0641 \u0627\u0644\u0635\u062D\u064A \u0641\u0642\u0637 \u0648\u0644\u0627 \u062A\u064F\u063A\u0646\u064A \u0639\u0646 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628 \u0623\u0648 \u0627\u0644\u0645\u062E\u062A\u0635."] })] })] })] }));
}
