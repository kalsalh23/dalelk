import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Star, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { VerifiedBadge } from '@/components/ui/Badge';
import { getPublicUrl } from '@/lib/supabase';
import { mapsLink } from '@/lib/utils';
import { MAP_COLORS, ENTITY_LABELS } from '@/constants';
import { EntityIcon } from '@/components/ui/EntityIcon';
export const ENTITY_ROUTES = {
    doctor: '/doctors',
    clinic: '/clinics',
    hospital: '/hospitals',
    health_center: '/health-centers',
    pharmacy: '/pharmacies',
    lab: '/labs',
    radiology: '/radiology',
};
export function EntityCard({ type, item, index = 0, highlight }) {
    const [imgError, setImgError] = useState(false);
    const navigate = useNavigate();
    const id = String(item.id);
    const name = String(item.name ?? '');
    const slug = String(item.slug ?? '');
    const image = getPublicUrl(item.image);
    const verified = Boolean(item.is_verified);
    const specialty = item.specialty ?? null;
    const address = item.address ?? null;
    const phone = item.phone ?? null;
    const rating = item.rating ? Number(item.rating) : null;
    const link = `${ENTITY_ROUTES[type]}/${slug || id}`;
    const color = MAP_COLORS[type];
    return (_jsx(motion.div, { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-40px' }, transition: { duration: 0.3, delay: Math.min(index * 0.04, 0.3) }, children: _jsxs(Card, { onClick: () => navigate(link), className: `group relative cursor-pointer overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${highlight ? 'ring-2 ring-primary/60' : ''}`, children: [verified && (_jsx(VerifiedBadge, { className: "absolute right-3 top-3 z-10 shadow-sm" })), _jsxs("div", { className: "flex gap-4 p-4 sm:p-5", children: [_jsx("div", { className: "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-primary-light/50 sm:h-24 sm:w-24", children: image && !imgError ? (_jsx("img", { src: image, alt: name, loading: "lazy", onError: () => setImgError(true), className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" })) : (_jsx("div", { className: "flex h-full w-full items-center justify-center", style: { color }, children: _jsx(EntityIcon, { type: type, className: "size-9" }) })) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx("p", { className: "truncate text-lg font-bold text-ink transition-colors group-hover:text-primary", children: name }) }), _jsxs("p", { className: "mt-0.5 flex items-center gap-1.5 text-sm font-medium text-muted", children: [_jsx("span", { className: "inline-block size-2 rounded-full", style: { backgroundColor: color } }), specialty ?? ENTITY_LABELS[type]] }), type === 'doctor' && item.experience_years ? (_jsxs("p", { className: "mt-0.5 text-xs text-muted", children: ["\u062E\u0628\u0631\u0629 ", Number(item.experience_years), " \u0633\u0646\u0648\u0627\u062A"] })) : null, address && (_jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs text-muted", children: [_jsx(MapPin, { className: "size-3.5 shrink-0" }), _jsx("span", { className: "line-clamp-1", children: address })] })), _jsxs("div", { className: "mt-2 flex items-center gap-3", children: [rating ? (_jsxs("span", { className: "flex items-center gap-1 text-xs font-semibold text-gold-dark", children: [_jsx(Star, { className: "size-3.5 fill-gold text-gold-dark" }), Number(rating).toFixed(1)] })) : null, phone ? (_jsxs("span", { className: "flex items-center gap-1 text-xs font-semibold text-muted", dir: "ltr", children: [_jsx(Phone, { className: "size-3.5 text-primary" }), phone] })) : null, _jsxs(Link, { to: mapsLink(item.lat, item.lng, address), target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1 text-xs text-primary hover:underline", children: [_jsx(MapPin, { className: "size-3.5" }), "\u0627\u0644\u0645\u0648\u0642\u0639"] })] })] }), _jsxs("div", { className: "flex flex-col items-center justify-center gap-1 pr-1", children: [_jsx("div", { className: "flex size-9 items-center justify-center rounded-full bg-subtle text-muted opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-primary hover:text-white", style: { color: undefined }, children: _jsx(ArrowLeft, { className: "size-4" }) }), _jsx("span", { className: "text-[10px] font-semibold text-faint sm:hidden", children: "\u0639\u0631\u0636" })] })] })] }) }));
}
