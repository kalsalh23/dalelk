import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Badge({ className, children }) {
    return (_jsx("span", { className: cn('inline-flex items-center gap-1 rounded-full bg-subtle-strong px-2.5 py-0.5 text-xs font-semibold text-muted', className), children: children }));
}
export function VerifiedBadge({ verified, className }) {
    if (!verified)
        return null;
    return (_jsxs("span", { className: cn('inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-bold text-primary-dark', className), children: [_jsx(BadgeCheck, { className: "size-3.5" }), "\u0645\u0648\u062B\u0651\u0642"] }));
}
export function PlanBadge({ plan, className }) {
    const styles = {
        free: 'bg-subtle-strong text-muted',
        pro: 'bg-primary-light text-primary-dark',
        gold: 'bg-gold-soft text-gold-dark',
    };
    const labels = { free: 'مجاني', pro: 'احترافي', gold: 'ذهبي' };
    return (_jsx("span", { className: cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold', styles[plan] ?? styles.free, className), children: labels[plan] ?? plan }));
}
