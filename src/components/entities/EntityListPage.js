import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useEntities } from '@/hooks/useEntities';
import { EntityCard } from '@/components/entities/EntityCard';
import { Skeletons, EmptyState, ErrorState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { SPECIALTIES, DEFAULT_CITY } from '@/constants';
import { Select, Input } from '@/components/ui/Field';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
const PAGE_SIZE = 12;
export function EntityListPage({ type, title, subtitle, showSpecialtyFilter, extraFilters, navPrefix, }) {
    const [params, setParams] = useSearchParams();
    const search = params.get('q') ?? '';
    const specialty = params.get('specialty') ?? '';
    const page = Math.max(1, Number(params.get('page') ?? '1') || 1);
    const { data, isLoading, isError, refetch } = useEntities(type, {
        search: search || undefined,
        specialty: specialty || undefined,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
    });
    const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE)), [data]);
    const applySearch = (e) => {
        e.preventDefault();
        setParams((p) => {
            const next = new URLSearchParams(p);
            if (search)
                next.set('q', search);
            else
                next.delete('q');
            next.set('page', '1');
            return next;
        });
    };
    return (_jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx(Breadcrumbs, { items: [{ label: title }] }), _jsx("h1", { className: "mt-3 text-2xl font-black text-ink sm:text-3xl", children: title }), _jsx("p", { className: "mt-1.5 text-sm text-muted", children: subtitle ?? `تصفح دليل ${navPrefix ?? title} في مدينة ${DEFAULT_CITY}` })] }), _jsxs("div", { className: "mb-6 flex flex-col gap-3 lg:flex-row lg:items-center", children: [_jsxs("form", { onSubmit: applySearch, className: "relative flex-1", children: [_jsx(Search, { className: "absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" }), _jsx(Input, { value: search, onChange: (e) => setParams((p) => { const next = new URLSearchParams(p); next.set('q', e.target.value); next.set('page', '1'); return next; }), placeholder: "\u0627\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645\u2026", className: "pr-11" })] }), showSpecialtyFilter && (_jsxs(Select, { value: specialty, onChange: (e) => {
                            setParams((p) => {
                                const next = new URLSearchParams(p);
                                if (e.target.value)
                                    next.set('specialty', e.target.value);
                                else
                                    next.delete('specialty');
                                next.set('page', '1');
                                return next;
                            });
                        }, className: "lg:w-64", children: [_jsx("option", { value: "", children: "\u0643\u0644 \u0627\u0644\u0627\u062E\u062A\u0635\u0627\u0635\u0627\u062A" }), SPECIALTIES.map((s) => (_jsx("option", { value: s, children: s }, s)))] })), extraFilters] }), isLoading ? (_jsx(Skeletons, { rows: 6 })) : isError ? (_jsx(ErrorState, { onRetry: () => void refetch() })) : !data?.data.length ? (_jsx(EmptyState, { title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C", description: "\u062C\u0631\u0651\u0628 \u062A\u0639\u062F\u064A\u0644 \u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0628\u062D\u062B \u0623\u0648 \u0627\u062E\u062A\u0635\u0627\u0635\u0627\u064B \u0622\u062E\u0631." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex items-center justify-between text-xs text-muted", children: _jsxs("span", { children: [data.count, " \u0646\u062A\u064A\u062C\u0629"] }) }), _jsx("div", { className: "mt-2 space-y-3", children: data.data.map((item, i) => (_jsx(EntityCard, { type: type, item: item, index: i }, String(item.id)))) }), _jsx(Pagination, { page: page, totalPages: totalPages, onChange: (p) => setParams((pr) => {
                            const next = new URLSearchParams(pr);
                            next.set('page', String(p));
                            return next;
                        }) })] }))] }));
}
