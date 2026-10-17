import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, CalendarDays, ExternalLink, ArrowRight, Share2 } from 'lucide-react';
import { fetchAdById, incrementAdClick } from '@/services/site';
import { getPublicUrl } from '@/lib/supabase';
import { Seo } from '@/components/seo/Seo';
import { formatDate } from '@/lib/utils';
import { track } from '@/services/stats';
export default function AdDetailsPage() {
    const { id } = useParams();
    const { data: ad, isLoading } = useQuery({
        queryKey: ['ad', id],
        queryFn: () => fetchAdById(id),
        enabled: !!id,
    });
    const share = async (a) => {
        const url = window.location.href;
        void track('share', { entityType: 'pharmacy', entityId: a.id });
        if (navigator.share) {
            try {
                await navigator.share({ title: a.title, text: a.description ?? a.title, url });
            }
            catch { /* ألغى المستخدم */ }
        }
        else {
            try {
                await navigator.clipboard.writeText(url);
            }
            catch { /* تجاهل */ }
        }
    };
    if (isLoading) {
        return _jsx("div", { className: "mx-auto max-w-4xl px-4 py-16 sm:px-6", children: _jsxs("div", { className: "mx-auto max-w-3xl animate-pulse space-y-4", children: [_jsx("div", { className: "h-64 rounded-2xl bg-subtle" }), _jsx("div", { className: "h-8 w-2/3 rounded-xl bg-subtle" }), _jsx("div", { className: "h-24 rounded-xl bg-subtle" })] }) });
    }
    if (!ad) {
        return (_jsxs("div", { className: "mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center", children: [_jsx(Megaphone, { className: "mx-auto size-12 text-muted" }), _jsx("h1", { className: "mt-4 text-xl font-black text-ink", children: "\u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" }), _jsx("p", { className: "mt-2 text-sm text-muted", children: "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0647\u0630\u0627 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0623\u0648 \u062A\u0645 \u062D\u0630\u0641\u0647." }), _jsx("a", { href: "/ads", className: "mt-5 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark", children: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062A" })] }));
    }
    const image = getPublicUrl(ad.image) ?? undefined;
    const dateLabel = ad.created_at ? formatDate(ad.created_at) : null;
    return (_jsxs("div", { className: "mx-auto max-w-3xl px-4 py-8 sm:px-6", children: [_jsx(Seo, { title: ad.title, description: ad.description ?? ad.title, image: image ?? null, path: `/ads/${ad.id}`, type: "article" }), _jsxs("button", { onClick: () => history.back(), className: "mb-5 inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary", children: [_jsx(ArrowRight, { className: "size-4" }), "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062A"] }), _jsxs("article", { className: "overflow-hidden rounded-[22px] border border-primary/20 bg-surface shadow-[var(--shadow-card)]", children: [image ? (_jsx("img", { src: image, alt: ad.title, className: "h-56 w-full object-cover sm:h-72" })) : (_jsx("div", { className: "flex h-44 items-center justify-center bg-gradient-to-l from-primary-light/50 to-primary-light/20", children: _jsx(Megaphone, { className: "size-14 text-primary/40" }) })), _jsxs("div", { className: "p-5 sm:p-8", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black text-primary", children: "\u0625\u0639\u0644\u0627\u0646" }), dateLabel && (_jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] text-muted", children: [_jsx(CalendarDays, { className: "size-3.5" }), dateLabel] })), _jsx("button", { onClick: () => void share(ad), title: "\u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646", "aria-label": "\u0645\u0634\u0627\u0631\u0643\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646", className: "ms-auto flex size-9 cursor-pointer items-center justify-center rounded-full border border-border text-muted transition hover:border-primary hover:bg-primary-light hover:text-primary", children: _jsx(Share2, { className: "size-4" }) })] }), _jsx("h1", { className: "mt-3 text-2xl font-black text-ink sm:text-3xl", children: ad.title }), ad.description ? (_jsx("div", { className: "mt-4 whitespace-pre-line text-sm leading-8 text-ink sm:text-[15px]", children: ad.description })) : null, ad.link ? (_jsxs("a", { href: ad.link, target: "_blank", rel: "noopener noreferrer", onClick: () => void incrementAdClick(ad.id), className: "mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark", children: [_jsx(ExternalLink, { className: "size-4" }), "\u0632\u064A\u0627\u0631\u0629 \u0627\u0644\u0631\u0627\u0628\u0637"] })) : null] })] }), _jsx("p", { className: "mt-4 text-center text-[11px] text-muted", children: "\u0647\u0630\u0627 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u0645\u0646 \u062C\u0647\u0629 \u062E\u0627\u0631\u062C\u064A\u0629 \u2014 \u062F\u0644\u064A\u0644 \u0637\u064A\u0628\u0629 \u0627\u0644\u0625\u0645\u0627\u0645 \u0627\u0644\u0637\u0628\u064A \u0644\u0627 \u064A\u062A\u062D\u0645\u0644 \u0645\u0633\u0624\u0648\u0644\u064A\u0629 \u0645\u062D\u062A\u0648\u0627\u0647." })] }));
}
