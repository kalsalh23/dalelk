import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Dialog({ open, onClose, title, children, size = 'md', }) {
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] h-[92vh]',
    };
    return createPortal(_jsx(AnimatePresence, { children: open && (_jsxs("div", { className: "fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4", children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, className: "absolute inset-0 bg-ink/50 backdrop-blur-sm" }), _jsxs(motion.div, { initial: { opacity: 0, y: 32, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 24, scale: 0.98 }, transition: { duration: 0.22, ease: 'easeOut' }, className: cn('relative z-10 max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-surface shadow-2xl sm:rounded-3xl', sizes[size]), children: [_jsxs("div", { className: "flex items-center justify-between border-b border-border px-5 py-4", children: [_jsx("h3", { className: "text-lg font-bold text-ink", children: title }), _jsx("button", { onClick: onClose, className: "rounded-xl p-2 text-muted transition-colors hover:bg-subtle-strong hover:text-ink cursor-pointer", "aria-label": "\u0625\u063A\u0644\u0627\u0642", children: _jsx(X, { className: "size-5" }) })] }), _jsx("div", { className: "max-h-[calc(92vh-64px)] overflow-y-auto p-5", children: children })] })] })) }), document.body);
}
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading, }) {
    return (_jsxs(Dialog, { open: open, onClose: onClose, title: title, size: "sm", children: [_jsx("p", { className: "text-sm leading-7 text-muted", children: message }), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsx("button", { onClick: onConfirm, disabled: loading, className: "flex-1 rounded-xl bg-error px-4 py-3 text-sm font-bold text-white transition hover:bg-[#b91c1c] disabled:opacity-50 cursor-pointer", children: loading ? 'جارٍ الحذف…' : 'تأكيد' }), _jsx("button", { onClick: onClose, className: "flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-ink transition hover:bg-subtle cursor-pointer", children: "\u0625\u0644\u063A\u0627\u0621" })] })] }));
}
