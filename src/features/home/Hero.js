import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ArrowLeft, Stethoscope, Pill, Moon, Hospital, FlaskConical, Megaphone, } from 'lucide-react';
import { SearchBar } from '@/components/shared/SearchBar';
import { APP_NAME, FEATURE_CLINICS } from '@/constants';
import { fetchAds, incrementAdClick } from '@/services/site';
import { getPublicUrl } from '@/lib/supabase';
import { cn } from '@/lib/utils';
const QUICK_LINKS = [
    { label: 'الأطباء', to: '/doctors', icon: Stethoscope, tone: 'primary' },
    { label: 'الصيدليات', to: '/pharmacies', icon: Pill, tone: 'gold' },
    { label: 'المشافي', to: '/hospitals', icon: Hospital, tone: 'primary' },
    { label: 'المخابر', to: '/labs', icon: FlaskConical, tone: 'gold' },
    { label: 'صيدليات المناوبة', to: '/duty-pharmacies', icon: Moon, tone: 'primary', solo: true },
].filter((q) => FEATURE_CLINICS || q.to !== '/clinics');
/** بطاقة إعلانات دوّارة داخل الهيرو: كل إعلان 10 ثوانٍ، بلا أسهم — توقف عند التمرير عليها */
function HeroAds() {
    const nav = useNavigate();
    const { data: ads } = useQuery({ queryKey: ['ads', 'home'], queryFn: () => fetchAds('home'), staleTime: 60_000 });
    const items = ads ?? [];
    const [idx, setIdx] = useState(0);
    useEffect(() => {
        if (items.length < 2)
            return;
        const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 10_000);
        return () => clearInterval(t);
    }, [items.length]);
    if (!items.length)
        return null;
    const ad = items[idx % items.length];
    return (_jsx(motion.div, { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.22 }, className: "mx-auto mt-8 max-w-2xl", children: _jsxs("div", { className: "relative", children: [_jsx(AnimatePresence, { mode: "wait", children: _jsxs(motion.div, { onClick: () => { void incrementAdClick(ad.id); nav(`/ads/${ad.id}`); }, initial: { opacity: 0, x: -24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 24 }, transition: { duration: 0.5 }, className: "group flex cursor-pointer items-center gap-3 rounded-2xl border border-primary/25 bg-surface p-2.5 text-start shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl", children: [ad.image ? (_jsx("img", { src: getPublicUrl(ad.image) ?? undefined, alt: ad.title, onError: (e) => { e.currentTarget.style.display = 'none'; }, className: "size-20 shrink-0 rounded-xl object-cover sm:size-24" })) : (_jsx("span", { className: "flex size-20 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:size-24", children: _jsx(Megaphone, { className: "size-9 text-primary/50" }) })), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("span", { className: "mb-1 inline-flex w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary", children: "\u0625\u0639\u0644\u0627\u0646" }), _jsx("span", { className: "block truncate text-sm font-black text-ink group-hover:text-primary-dark sm:text-base", children: ad.title }), ad.description ? _jsx("span", { className: "mt-0.5 line-clamp-1 block text-xs text-muted sm:text-[13px]", children: ad.description }) : null, ad.link ? _jsx("span", { className: "mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary", children: "\u0627\u0644\u0645\u0632\u064A\u062F \u2190" }) : null] })] }, ad.id) }), items.length > 1 && (_jsx("div", { className: "mt-2.5 flex items-center justify-center gap-1.5", children: items.map((a, i) => (_jsx("button", { onClick: () => setIdx(i), "aria-label": `إعلان ${i + 1}`, className: cn('h-1.5 rounded-full transition-all cursor-pointer', i === idx % items.length ? 'w-5 bg-primary' : 'w-1.5 bg-primary/25 hover:bg-primary/50') }, a.id))) }))] }) }));
}
export function Hero() {
    return (_jsxs("section", { className: "relative overflow-hidden bg-gradient-to-b from-primary-light/50 via-primary-light/20 to-background", children: [_jsx("div", { className: "pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" }), _jsx("div", { className: "pointer-events-none absolute -right-20 top-40 size-80 rounded-full bg-primary/20 blur-3xl" }), _jsxs("div", { className: "relative mx-auto max-w-7xl px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-24 sm:pt-20", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface px-4 py-1.5 text-xs font-bold text-primary-dark shadow-sm", children: [_jsx(Sparkles, { className: "size-3.5" }), "\u0627\u0644\u062F\u0644\u064A\u0644 \u0627\u0644\u0635\u062D\u064A \u0627\u0644\u0631\u0642\u0645\u064A \u0644\u0645\u062F\u064A\u0646\u0629 \u0637\u064A\u0628\u0629 \u0627\u0644\u0625\u0645\u0627\u0645"] }), _jsxs(motion.h1, { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.08 }, className: "mx-auto max-w-3xl text-3xl font-black leading-tight text-ink sm:text-5xl", children: [_jsx("span", { className: "text-primary", children: APP_NAME }), _jsx("span", { className: "mt-1 block text-lg font-bold text-ink sm:text-2xl", children: "\u0643\u0644 \u0645\u0627 \u062A\u062D\u062A\u0627\u062C\u0647 \u0645\u0646 \u062E\u062F\u0645\u0627\u062A \u0635\u062D\u064A\u0629 \u0641\u064A \u0645\u062F\u064A\u0646\u0629 \u0637\u064A\u0628\u0629 \u0627\u0644\u0625\u0645\u0627\u0645... \u0641\u064A \u0645\u0643\u0627\u0646 \u0648\u0627\u062D\u062F." })] }), _jsx(motion.div, { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.16 }, className: "mx-auto mt-8 max-w-2xl", children: _jsx(SearchBar, { big: true }) }), _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, delay: 0.28 }, className: "mx-auto mt-8 grid max-w-md grid-cols-2 gap-2", children: [_jsx("span", { className: "col-span-2 w-full text-center text-sm font-bold text-muted", children: "\u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A \u0633\u0631\u064A\u0639\u0629:" }), QUICK_LINKS.map((q) => (_jsxs(Link, { to: q.to, className: cn('group relative flex items-center justify-center gap-2.5 rounded-2xl border bg-surface py-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md', 'solo' in q && 'col-span-2 mx-auto w-full max-w-[240px]', q.tone === 'primary' ? 'border-primary/25 hover:border-primary' : 'border-gold/40 hover:border-gold'), children: [_jsx("span", { className: cn('flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300', q.tone === 'primary'
                                            ? 'bg-primary-light text-primary-dark group-hover:bg-primary group-hover:text-white'
                                            : 'bg-gold-soft text-gold-dark group-hover:bg-gold group-hover:text-primary-dark'), children: _jsx(q.icon, { className: "size-6.5" }) }), _jsx("span", { className: "text-base font-bold text-ink sm:text-lg", children: q.label }), _jsx(ArrowLeft, { className: "absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-primary opacity-0 transition-all duration-300 group-hover:opacity-100" })] }, q.label)))] }), _jsx(HeroAds, {})] })] }));
}
