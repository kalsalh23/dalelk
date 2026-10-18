import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminStats } from '@/services/admin';
import { fetchStatsSummary } from '@/services/stats';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeletons } from '@/components/ui/States';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
const STAT_CARDS = [
    { table: 'doctors', label: 'الأطباء', to: '/admin/doctors', color: 'emerald' },
    { table: 'clinics', label: 'العيادات', to: '/admin/clinics', color: 'teal' },
    { table: 'hospitals', label: 'المشافي', to: '/admin/hospitals', color: 'sky' },
    { table: 'health_centers', label: 'المراكز الصحية', to: '/admin/health-centers', color: 'amber' },
    { table: 'pharmacies', label: 'الصيدليات', to: '/admin/pharmacies', color: 'green' },
    { table: 'labs', label: 'المخابر', to: '/admin/labs', color: 'orange' },
    { table: 'radiology_centers', label: 'مراكز الأشعة', to: '/admin/radiology', color: 'rose' },
];
const colorStyles = {
    emerald: { bg: 'bg-primary-light/70', text: 'text-primary-dark' },
    teal: { bg: 'bg-primary-light', text: 'text-primary-dark' },
    sky: { bg: 'bg-gold-soft', text: 'text-gold-dark' },
    amber: { bg: 'bg-gold-soft/70', text: 'text-gold-dark' },
    green: { bg: 'bg-primary-light/50', text: 'text-primary-dark' },
    orange: { bg: 'bg-gold-soft/50', text: 'text-gold-dark' },
    rose: { bg: 'bg-wine-soft', text: 'text-wine' },
};
export function AdminHomePage() {
    const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchAdminStats });
    const { data: traffic } = useQuery({ queryKey: ['admin-traffic'], queryFn: fetchStatsSummary });
    const maxPage = useMemo(() => Math.max(1, ...(traffic?.topPages.map((p) => p.count) ?? [1])), [traffic]);
    const evMetrics = useMemo(() => [
        { label: 'زيارات الصفحات', value: traffic?.pageViews ?? 0, icon: Eye, color: 'text-primary' },
        { label: 'عمليات البحث', value: traffic?.searches ?? 0, icon: BarChart3, color: 'text-primary' },
        { label: 'ضغطات الاتصال', value: traffic?.phoneClicks ?? 0, icon: ArrowLeft, color: 'text-success' },
        { label: 'ضغطات واتساب', value: traffic?.whatsappClicks ?? 0, icon: ArrowLeft, color: 'text-primary' },
        { label: 'ضغطات الخريطة', value: traffic?.mapClicks ?? 0, icon: ArrowLeft, color: 'text-warning' },
        { label: 'مشاهدات الملفات', value: traffic?.profileViews ?? 0, icon: Eye, color: 'text-wine' },
    ], [traffic]);
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645" }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629 \u0639\u0644\u0649 \u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u0646\u0635\u0629 \u0648\u0625\u062D\u0635\u0627\u0621\u0627\u062A \u0627\u0644\u0632\u0648\u0627\u0631." })] }), _jsx("div", { className: "grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4", children: isLoading || !stats ? (_jsx("div", { className: "col-span-full grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4", children: Array.from({ length: 8 }).map((_, i) => _jsx(Skeletons, { rows: 1, box: "!p-5" }, i)) })) : (_jsxs(_Fragment, { children: [_jsx(MetricCard, { to: "/admin/questions", label: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629", value: stats.questions, color: "sky" }), _jsx(MetricCard, { to: "/admin/unanswered", label: "\u0623\u0633\u0626\u0644\u0629 \u063A\u064A\u0631 \u0645\u062C\u0627\u0628 \u0639\u0646\u0647\u0627", value: stats.unanswered, color: "amber" }), _jsx(MetricCard, { to: "/admin/requests", label: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0631\u0642\u064A\u0629", value: stats.requests, color: "rose" })] })) }), _jsxs("section", { children: [_jsx("h2", { className: "mb-4 text-lg font-black text-ink", children: "\u0627\u0644\u0623\u062F\u0644\u0629 \u0627\u0644\u0637\u0628\u064A\u0629" }), _jsx("div", { className: "grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", children: STAT_CARDS.map((c) => (_jsx(Link, { to: c.to, children: _jsx(Card, { className: "h-full transition-all hover:-translate-y-0.5 hover:shadow-lg", children: _jsxs(CardBody, { className: "p-4", children: [_jsx("p", { className: "text-2xl font-black text-ink sm:text-3xl", children: isLoading ? '—' : formatNumber(stats?.entities[c.table] ?? 0) }), _jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs font-bold text-muted", children: [_jsx("span", { className: cn('size-2 rounded-full', colorStyles[c.color].bg) }), _jsx("span", { className: colorStyles[c.color].text, children: c.label })] }), _jsxs("span", { className: "mt-2 flex items-center gap-0.5 text-[11px] font-semibold text-primary", children: ["\u0625\u062F\u0627\u0631\u0629 ", _jsx(ArrowLeft, { className: "size-3" })] })] }) }) }, c.table))) })] }), _jsxs("section", { className: "grid min-w-0 gap-6 lg:grid-cols-2", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "size-5 text-primary" }), "\u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u0648\u0642\u0639"] }) }), _jsx(CardBody, { children: _jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3", children: evMetrics.map((m) => (_jsxs("div", { className: "rounded-2xl bg-subtle p-3.5 sm:p-4", children: [_jsx(m.icon, { className: cn('size-5', m.color) }), _jsx("p", { className: "mt-2 text-xl font-black text-ink sm:text-2xl", children: formatNumber(m.value) }), _jsx("p", { className: "text-[11px] font-semibold text-muted sm:text-xs", children: m.label })] }, m.label))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Eye, { className: "size-5 text-primary" }), "\u0623\u0643\u062B\u0631 \u0627\u0644\u0635\u0641\u062D\u0627\u062A \u0645\u0634\u0627\u0647\u062F\u0629"] }) }), _jsx(CardBody, { children: !traffic?.topPages.length ? (_jsx("p", { className: "py-8 text-center text-sm text-muted", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0639\u062F." })) : (_jsx("div", { className: "space-y-3", children: traffic.topPages.map((p) => (_jsxs("div", { children: [_jsxs("div", { className: "mb-1 flex items-center justify-between text-xs", children: [_jsx("span", { className: "truncate font-semibold text-ink", dir: "ltr", children: p.path === '/' ? 'الرئيسية' : p.path }), _jsx("span", { className: "font-bold text-muted", children: p.count })] }), _jsx("div", { className: "h-2 overflow-hidden rounded-full bg-subtle-strong", children: _jsx("div", { className: "h-full rounded-full bg-gradient-to-l from-primary to-gold transition-all", style: { width: `${(p.count / maxPage) * 100}%` } }) })] }, p.path))) })) })] })] }), _jsxs("section", { children: [_jsx("h2", { className: "mb-4 text-lg font-black text-ink", children: "\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0628\u0627\u0642\u0627\u062A" }), _jsx(Card, { children: _jsx(CardBody, { children: isLoading || !stats ? (_jsx(Skeletons, { rows: 1, box: "!p-5" })) : (_jsx("div", { className: "flex flex-wrap gap-4", children: [
                                    { label: 'مجاني', value: stats.plans.free, color: 'bg-faint' },
                                    { label: 'احترافي', value: stats.plans.pro, color: 'bg-primary' },
                                    { label: 'ذهبي', value: stats.plans.gold, color: 'bg-gold-soft0' },
                                ].map((p) => {
                                    const total = stats.plans.free + stats.plans.pro + stats.plans.gold;
                                    const pct = total ? Math.round((p.value / total) * 100) : 0;
                                    return (_jsxs("div", { className: "flex-1 rounded-2xl bg-subtle p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-bold text-muted", children: p.label }), _jsx("span", { className: "text-lg font-black text-ink", children: p.value })] }), _jsx("div", { className: "mt-2 h-2.5 overflow-hidden rounded-full bg-subtle-strong", children: _jsx("div", { className: cn('h-full rounded-full', p.color), style: { width: `${pct}%` } }) }), _jsxs("p", { className: "mt-1 text-[11px] text-muted", children: [pct, "%"] })] }, p.label));
                                }) })) }) })] }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [_jsxs(Link, { to: "/admin/stats", className: "flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary-dark", children: [_jsx(BarChart3, { className: "size-4.5" }), "\u0639\u0631\u0636 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u062A\u0641\u0635\u064A\u0644\u064A\u0629"] }), _jsx(Link, { to: "/admin/settings", className: "flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-sm font-bold text-ink hover:bg-subtle", children: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" })] })] }));
}
function MetricCard({ label, value, color, to }) {
    const palette = {
        violet: 'bg-wine-soft/70 text-wine-dark',
        sky: 'bg-gold-soft text-gold-dark',
        amber: 'bg-gold-soft/70 text-gold-dark',
        rose: 'bg-wine-soft text-wine',
    };
    return (_jsx(Link, { to: to, className: "min-w-0", children: _jsx(Card, { className: "transition-all hover:-translate-y-0.5 hover:shadow-lg", children: _jsxs(CardBody, { className: "p-4", children: [_jsxs("div", { className: cn('mb-2 inline-flex max-w-full truncate rounded-lg px-2 py-1 text-[10px] font-black', palette[color]), children: [label, " \u2191"] }), _jsx("p", { className: "text-xl font-black text-ink sm:text-2xl", children: formatNumber(value) })] }) }) }));
}
