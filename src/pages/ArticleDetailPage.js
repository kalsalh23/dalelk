import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, ArrowRight, Lightbulb } from 'lucide-react';
import { useArticle, useRelatedArticles, useArticleCategories } from '@/hooks/useArticles';
import { FullPageLoader, ErrorState } from '@/components/ui/States';
import { Card } from '@/components/ui/Card';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getPublicUrl } from '@/lib/supabase';
import { formatDate, truncate } from '@/lib/utils';
import { incrementViewCount } from '@/services/stats';
import { Seo } from '@/components/seo/Seo';
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo';
export function ArticleDetailPage() {
    const { slug } = useParams();
    const { data: article, isLoading, isError } = useArticle(slug);
    const { data: categories } = useArticleCategories();
    const { data: related } = useRelatedArticles(article?.category_id ?? null, article?.id ?? '');
    const [ready, setReady] = useState(article);
    useEffect(() => {
        if (article) {
            setReady(article);
            void incrementViewCount('articles', article.id);
        }
    }, [article]);
    if (isLoading)
        return _jsx(FullPageLoader, { label: "\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0642\u0627\u0644\u2026" });
    if (isError || !ready)
        return _jsx("div", { className: "mx-auto max-w-4xl px-4 py-16", children: _jsx(ErrorState, { message: "\u0627\u0644\u0645\u0642\u0627\u0644 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u063A\u064A\u0631 \u0645\u0646\u0634\u0648\u0631." }) });
    const category = categories?.find((c) => c.id === ready.category_id);
    const image = getPublicUrl(ready.image);
    return (_jsxs("article", { className: "mx-auto max-w-4xl px-4 py-8 sm:px-6", children: [_jsx(Seo, { title: ready.seo_title ?? ready.title, description: ready.seo_description ?? ready.excerpt ?? undefined, image: image, path: `/articles/${ready.slug}`, type: "article", jsonLd: [
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: ready.title,
                        description: ready.excerpt ?? undefined,
                        image: image ?? undefined,
                        datePublished: ready.published_at ?? undefined,
                        dateModified: ready.updated_at,
                    },
                    breadcrumbSchema([
                        { label: 'الرئيسية', url: absoluteUrl('/') },
                        { label: 'النصائح الطبية', url: absoluteUrl('/articles') },
                        { label: ready.title },
                    ]),
                ] }), _jsx(Breadcrumbs, { items: [{ label: 'النصائح الطبية', to: '/articles' }, { label: ready.title }] }), _jsxs(motion.div, { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 }, children: [_jsx("h1", { className: "mt-5 text-2xl font-black leading-relaxed text-ink sm:text-4xl sm:leading-relaxed", children: ready.title }), _jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-3 text-sm text-muted", children: [category && (_jsx("span", { className: "rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-primary-dark", children: category.name })), _jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(CalendarDays, { className: "size-4 text-primary" }), "\u0646\u0634\u0631 \u0641\u064A ", formatDate(ready.published_at)] })] })] }), image && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, delay: 0.1 }, className: "mt-6 overflow-hidden rounded-[18px]", children: _jsx("img", { src: image, alt: ready.title, className: "max-h-[420px] w-full object-cover" }) })), _jsx("div", { className: "prose-ink mt-8 space-y-4 text-[15px] leading-8 text-ink sm:text-base sm:leading-9 [&_p]:my-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-black [&_ul]:list-inside [&_ul]:space-y-1.5 [&_h3]:mt-5 [&_h3]:font-bold", dangerouslySetInnerHTML: { __html: ready.content } }), _jsxs("div", { className: "mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm leading-7 text-amber-900", children: [_jsx(Lightbulb, { className: "mt-0.5 size-5 shrink-0 text-warning" }), _jsxs("div", { children: [_jsx("p", { className: "font-bold", children: "\u062A\u0646\u0628\u064A\u0647 \u0645\u0647\u0645" }), _jsx("p", { children: "\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0629 \u0644\u0644\u062A\u062B\u0642\u064A\u0641 \u0627\u0644\u0635\u062D\u064A \u0641\u0642\u0637 \u0648\u0644\u0627 \u062A\u064F\u063A\u0646\u064A \u0639\u0646 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628 \u0623\u0648 \u0627\u0644\u0645\u062E\u062A\u0635." })] })] }), related && related.length > 0 ? (_jsxs("section", { className: "mt-12", children: [_jsx("h2", { className: "mb-4 text-lg font-black text-ink", children: "\u0645\u0642\u0627\u0644\u0627\u062A \u0645\u0631\u062A\u0628\u0637\u0629" }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: related.slice(0, 4).map((r) => (_jsx(Link, { to: `/articles/${r.slug}`, className: "group block", children: _jsxs(Card, { className: "flex gap-4 p-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg", children: [_jsx("div", { className: "h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-primary-light/40", children: r.image ? (_jsx("img", { src: getPublicUrl(r.image) ?? '', alt: "", className: "h-full w-full object-cover", loading: "lazy" })) : null }), _jsxs("div", { className: "min-w-0", children: [_jsx("h3", { className: "line-clamp-2 text-sm font-bold leading-6 text-ink group-hover:text-primary", children: r.title }), _jsx("p", { className: "mt-1 line-clamp-1 text-xs text-muted", children: truncate(r.excerpt, 70) })] })] }) }, r.id))) })] })) : null, _jsx("div", { className: "mt-10 text-center", children: _jsxs(Link, { to: "/articles", className: "inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline", children: [_jsx(ArrowRight, { className: "size-4" }), "\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0642\u0627\u0644\u0627\u062A"] }) })] }));
}
