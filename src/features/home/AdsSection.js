import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Megaphone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAds, incrementAdClick } from '@/services/site';
import { getPublicUrl } from '@/lib/supabase';
import { SectionTitle } from '@/components/ui/Breadcrumbs';
import { cn } from '@/lib/utils';
function AdCard({ ad, accent }) {
    const href = ad.link || undefined;
    const inner = (_jsx(_Fragment, { children: _jsxs("div", { className: "flex h-full flex-col overflow-hidden rounded-[18px] border border-dashed border-primary/30 bg-gradient-to-l from-primary-light/40 to-background transition-all duration-300 group-hover:border-primary/50", children: [ad.image ? (_jsx("div", { className: "relative h-32 w-full overflow-hidden sm:h-36", children: _jsx("img", { src: getPublicUrl(ad.image) ?? undefined, alt: ad.title, loading: "lazy", onError: (e) => { e.currentTarget.style.display = 'none'; }, className: "h-full w-full object-cover" }) })) : (_jsx("div", { className: "flex h-32 items-center justify-center bg-primary/10 sm:h-36", children: _jsx(Megaphone, { className: "size-10 text-primary/50" }) })), _jsxs("div", { className: "flex flex-1 flex-col p-4 text-right", children: [_jsx("span", { className: "mb-1.5 inline-flex w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary", children: "\u0625\u0639\u0644\u0627\u0646" }), _jsx("h3", { className: cn('text-base font-black text-ink', accent && 'text-primary-dark'), children: ad.title }), ad.description ? _jsx("p", { className: "mt-1 flex-1 text-xs leading-5 text-muted", children: ad.description }) : null, ad.link ? (_jsx("span", { className: "mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline", children: "\u0627\u0644\u0645\u0632\u064A\u062F" })) : null] })] }) }));
    return (_jsx("a", { href: href ?? undefined, target: href ? '_blank' : undefined, rel: href ? 'noopener noreferrer' : undefined, onClick: () => href && void incrementAdClick(ad.id), className: "group block h-full text-right", children: inner }));
}
export function AdsSection() {
    const { data: ads, isLoading } = useQuery({ queryKey: ['ads', 'home'], queryFn: () => fetchAds('home'), staleTime: 60_000 });
    const items = ads ?? [];
    if (isLoading)
        return null;
    if (!items.length)
        return null;
    return (_jsxs("section", { className: "mx-auto max-w-7xl px-4 py-2 sm:px-6", children: [_jsx(SectionTitle, { title: "\u0625\u0639\u0644\u0627\u0646\u0627\u062A \u0648\u062E\u062F\u0645\u0627\u062A \u0645\u0645\u064A\u0632\u0629", subtitle: "\u062C\u0647\u0627\u062A \u0637\u0628\u064A\u0629 \u0648\u0635\u062D\u064A\u0629 \u0641\u064A \u0645\u0646\u0637\u0642\u062A\u0643", icon: _jsx(Megaphone, { className: "size-5" }) }), _jsx("div", { className: cn('grid gap-4', items.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'lg:grid-cols-2'), children: items.map((ad, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-40px' }, transition: { duration: 0.3, delay: Math.min(i * 0.05, 0.3) }, children: _jsx(AdCard, { ad: ad, accent: i === 0 && items.length === 1 }) }, ad.id))) }), items.length > 1 && (_jsx("p", { className: "mt-3 text-center text-[11px] text-muted", children: "\u0647\u0644 \u062A\u0631\u064A\u062F \u0625\u062F\u0631\u0627\u062C \u0625\u0639\u0644\u0627\u0646\u0643 \u0647\u0646\u0627\u061F \u0627\u0631\u0633\u0644 \u0628\u0631\u064A\u062F\u0627\u064B \u0625\u0644\u0649 \u0641\u0631\u064A\u0642 \u0627\u0644\u0645\u0646\u0635\u0629 \u0645\u0646 \u0635\u0641\u062D\u0629 \u0645\u0646 \u0646\u062D\u0646." }))] }));
}
