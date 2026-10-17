import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, HeartPulse, Bone, Eye, Ear, Flower2, Baby, Shield, Scissors, Activity, Thermometer, Droplet, Bandage, Cross } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { SPECIALTIES } from '@/constants';
const SPECIALTY_ICONS = {
    'طب عام': _jsx(Stethoscope, { className: "size-6" }),
    'طب%Baby': _jsx(Baby, { className: "size-6" }),
    'النسائية والتوليد': _jsx(Flower2, { className: "size-6" }),
    'القلبية': _jsx(HeartPulse, { className: "size-6" }),
    'الأذن والأنف والحنجرة': _jsx(Ear, { className: "size-6" }),
    'العينية': _jsx(Eye, { className: "size-6" }),
    'الأمراض الجلدية': _jsx(Droplet, { className: "size-6" }),
    'العظمية': _jsx(Bone, { className: "size-6" }),
    'الباطنية': _jsx(Shield, { className: "size-6" }),
    'الأمراض النفسية': _jsx(Activity, { className: "size-6" }),
    'المسالك البولية': _jsx(Droplet, { className: "size-6" }),
    'الأسنان': _jsx(Scissors, { className: "size-6" }),
    'الجراحة العامة': _jsx(Scissors, { className: "size-6" }),
    'العصبية': _jsx(Activity, { className: "size-6" }),
    'الغدد والسكري': _jsx(Thermometer, { className: "size-6" }),
    'العلاج الفيزيائي': _jsx(Bandage, { className: "size-6" }),
    'التمريض': _jsx(Cross, { className: "size-6" }),
};
export function SpecialtyCards() {
    return (_jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [_jsx(Breadcrumbs, { items: [{ label: 'الأطباء' }] }), _jsx("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pt-12 lg:pt-0", children: SPECIALTIES.map((specialty, index) => {
                    const icon = SPECIALTY_ICONS[specialty] ?? _jsx(Stethoscope, { className: "size-6" });
                    return (_jsx(motion.div, { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.3, delay: Math.min(index * 0.04, 0.3) }, children: _jsxs(Link, { to: `/specialty/${encodeURIComponent(specialty)}`, className: "group flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg", children: [_jsx("div", { className: "flex size-14 items-center justify-center rounded-2xl bg-primary-light/50 text-primary transition-colors group-hover:bg-primary group-hover:text-white", children: icon }), _jsx("span", { className: "text-sm font-bold text-ink group-hover:text-primary", children: specialty })] }) }, specialty));
                }) })] }));
}
