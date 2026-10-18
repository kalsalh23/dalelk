import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export function Card({ className, ...props }) {
    return (_jsx("div", { className: cn('rounded-[18px] border border-border bg-surface shadow-[var(--shadow-card)]', className), ...props }));
}
export function CardHeader({ className, ...props }) {
    return _jsx("div", { className: cn('border-b border-border/70 px-5 py-4', className), ...props });
}
export function CardBody({ className, ...props }) {
    return _jsx("div", { className: cn('p-5', className), ...props });
}
export function CardTitle({ className, ...props }) {
    return _jsx("h3", { className: cn('text-base font-bold text-ink', className), ...props });
}
export function CardDescription({ className, ...props }) {
    return _jsx("p", { className: cn('text-sm text-muted', className), ...props });
}
