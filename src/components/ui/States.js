import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Loader2, SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Skeleton({ className }) {
    return _jsx("div", { className: cn('animate-pulse rounded-xl bg-subtle-strong/70', className) });
}
export function Skeletons({ rows = 6, box }) {
    return (_jsx("div", { className: "space-y-4", children: Array.from({ length: rows }).map((_, i) => (_jsxs("div", { className: cn('flex gap-4 bg-surface p-4', box), children: [_jsx(Skeleton, { className: "size-16 shrink-0 rounded-2xl sm:size-20" }), _jsxs("div", { className: "flex-1 space-y-2.5 py-1", children: [_jsx(Skeleton, { className: "h-4 w-2/5" }), _jsx(Skeleton, { className: "h-3 w-3/5" }), _jsx(Skeleton, { className: "h-3 w-1/3" })] })] }, i))) }));
}
export function Spinner({ className }) {
    return _jsx(Loader2, { className: cn('size-5 animate-spin text-primary', className) });
}
export function FullPageLoader({ label }) {
    return (_jsxs("div", { className: "flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted", children: [_jsx(Spinner, { className: "size-8" }), label && _jsx("p", { className: "text-sm", children: label })] }));
}
export function EmptyState({ title, description, action, }) {
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "flex flex-col items-center gap-3 rounded-[18px] border border-dashed border-border bg-surface px-6 py-14 text-center", children: [_jsx("div", { className: "flex size-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark", children: _jsx(SearchX, { className: "size-7" }) }), _jsx("h3", { className: "text-lg font-bold text-ink", children: title }), description && _jsx("p", { className: "max-w-sm text-sm leading-6 text-muted", children: description }), action] }));
}
export function ErrorState({ message, onRetry }) {
    return (_jsxs("div", { className: "flex flex-col items-center gap-3 rounded-[18px] border border-wine/20 bg-wine-soft/60 px-6 py-12 text-center", children: [_jsx("h3", { className: "text-lg font-bold text-error", children: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0645\u0627" }), _jsx("p", { className: "text-sm text-muted", children: message ?? 'تعذر تحميل البيانات. حاول مرة أخرى.' }), onRetry && (_jsx("button", { onClick: onRetry, className: "rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark cursor-pointer", children: "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629" }))] }));
}
