import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { SERVICES, DEFAULT_CITY, FEATURE_CLINICS } from '@/constants';
import { countLabel } from '@/lib/utils';
import { SectionTitle } from '@/components/ui/Breadcrumbs';
import { ServiceIcon } from '@/components/ui/EntityIcon';
import { useEntities, useDutyPharmacies } from '@/hooks/useEntities';
import { cn } from '@/lib/utils';
const CARD_BG = {
    emerald: 'bg-primary-light/70 text-primary-dark',
    teal: 'bg-primary-light/70 text-primary-dark',
    sky: 'bg-gold-soft text-gold-dark',
    green: 'bg-primary-light/50 text-primary-dark',
    indigo: 'bg-wine-soft/70 text-wine-dark',
    amber: 'bg-gold-soft/70 text-gold-dark',
    rose: 'bg-wine-soft text-wine',
    orange: 'bg-gold-soft/50 text-gold-dark',
};
export function ServicesGrid() {
    const counts = {
        doctor: useEntities('doctor', { limit: 1 }).data?.count,
        clinic: useEntities('clinic', { limit: 1 }).data?.count,
        hospital: useEntities('hospital', { limit: 1 }).data?.count,
        pharmacy: useEntities('pharmacy', { limit: 1 }).data?.count,
        lab: useEntities('lab', { limit: 1 }).data?.count,
        radiology: useEntities('radiology', { limit: 1 }).data?.count,
        health_center: useEntities('health_center', { limit: 1 }).data?.count,
    };
    const dutyCount = useDutyPharmacies().data?.length ?? 0;
    return (_jsxs("section", { className: "mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16", children: [_jsx(SectionTitle, { title: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", subtitle: `كل الخدمات الطبية في مدينة ${DEFAULT_CITY}`, icon: _jsx(LayoutGrid, { className: "size-5" }) }), _jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: SERVICES.filter((svc) => FEATURE_CLINICS || svc.key !== 'clinic').map((svc, i) => (_jsx(motion.div, { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-40px' }, transition: { duration: 0.35, delay: Math.min(i * 0.05, 0.35) }, children: _jsx(Link, { to: svc.route, className: "group block h-full", children: _jsxs("div", { className: "flex h-full flex-col rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-primary/30 group-hover:shadow-xl", children: [_jsx("div", { className: cn('mb-4 flex size-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110', CARD_BG[svc.color]), children: _jsx(ServiceIcon, { name: svc.icon, className: "size-7" }) }), _jsx("h3", { className: "text-lg font-black text-ink group-hover:text-primary", children: svc.name }), _jsx("p", { className: "mt-1.5 flex-1 text-sm leading-6 text-muted", children: svc.description }), _jsxs("div", { className: "mt-4 flex items-center justify-between", children: [_jsx("span", { className: "rounded-full bg-subtle px-3 py-1 text-xs font-bold text-muted", children: svc.key === 'duty'
                                                ? dutyCount > 0
                                                    ? `${dutyCount} ${countLabel(dutyCount).split(' ').slice(-1)[0]} اليوم`
                                                    : 'اليوم'
                                                : counts[svc.key] != null
                                                    ? countLabel(counts[svc.key])
                                                    : '…' }), _jsxs("span", { className: "flex items-center gap-1 text-xs font-bold text-primary", children: ["\u062A\u0635\u0641\u062D", _jsx(ArrowLeft, { className: "size-3.5 transition-transform group-hover:-translate-x-1" })] })] })] }) }) }, svc.key))) })] }));
}
