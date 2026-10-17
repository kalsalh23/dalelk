import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEntities } from '@/hooks/useEntities';
import { EntityCard } from '@/components/entities/EntityCard';
import { Skeletons, EmptyState, ErrorState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { Breadcrumbs, SectionTitle } from '@/components/ui/Breadcrumbs';
import { SPECIALTIES, DEFAULT_CITY } from '@/constants';
const PAGE_SIZE = 12;
export function SpecialtyDetailPage() {
    const { specialty } = useParams();
    const [params, setParams] = useSearchParams();
    const page = Math.max(1, Number(params.get('page') ?? '1') || 1);
    const decodedSpecialty = specialty ? decodeURIComponent(specialty) : '';
    const isValid = SPECIALTIES.includes(decodedSpecialty);
    const { data, isLoading, isError, refetch } = useEntities('doctor', {
        specialty: decodedSpecialty || undefined,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
    });
    const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE)), [data]);
    if (!isValid && decodedSpecialty) {
        return (_jsx("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: _jsx(EmptyState, { title: "\u0627\u062E\u062A\u0635\u0627\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F", description: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062A\u062E\u0635\u0635 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A." }) }));
    }
    return (_jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [_jsx(Breadcrumbs, { items: [{ label: 'الأطباء', to: '/doctors' }, { label: decodedSpecialty }] }), _jsx("div", { className: "mt-6", children: _jsx(SectionTitle, { title: decodedSpecialty || 'كل الأطباء', subtitle: data?.count ? `${data.count} طبيب في تخصص ${decodedSpecialty} في مدينة ${DEFAULT_CITY}` : 'قائمة موثّقة بالأطباء المتخصصين في هذا مجال' }) }), isLoading ? (_jsx(Skeletons, { rows: 6 })) : isError ? (_jsx(ErrorState, { onRetry: () => void refetch() })) : !data?.data.length ? (_jsx(EmptyState, { title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C", description: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u0637\u0628\u0627\u0621 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u062A\u062E\u0635\u0635 \u062D\u0627\u0644\u064A\u0627\u064B. \u062C\u0631\u0651\u0628 \u062A\u062E\u0635\u0635\u0627\u064B \u0622\u062E\u0631." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "mt-2 space-y-3", children: data.data.map((item, i) => (_jsx(EntityCard, { type: "doctor", item: item, index: i }, String(item.id)))) }), _jsx(Pagination, { page: page, totalPages: totalPages, onChange: (p) => setParams((pr) => {
                            const next = new URLSearchParams(pr);
                            next.set('page', String(p));
                            return next;
                        }) })] }))] }));
}
