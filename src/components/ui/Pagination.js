import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Pagination({ page, totalPages, onChange, }) {
    if (totalPages <= 1)
        return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1)
            pages.push(i);
    }
    const items = [];
    pages.forEach((p, idx) => {
        if (idx > 0 && p - pages[idx - 1] > 1)
            items.push('…');
        items.push(p);
    });
    return (_jsxs("nav", { className: "mt-8 flex items-center justify-center gap-1.5", children: [_jsx("button", { disabled: page <= 1, onClick: () => onChange(page - 1), className: "flex size-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:text-primary disabled:opacity-40 cursor-pointer", "aria-label": "\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629", children: _jsx(ChevronRight, { className: "size-4" }) }), items.map((it, i) => it === '…' ? (_jsx("span", { className: "px-1 text-muted", children: "\u2026" }, `e${i}`)) : (_jsx("button", { onClick: () => onChange(it), className: cn('size-9 rounded-xl border text-sm font-bold transition cursor-pointer', it === page
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-border bg-surface text-muted hover:border-primary/40 hover:text-primary'), children: it }, it))), _jsx("button", { disabled: page >= totalPages, onClick: () => onChange(page + 1), className: "flex size-9 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:text-primary disabled:opacity-40 cursor-pointer", "aria-label": "\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", children: _jsx(ChevronLeft, { className: "size-4" }) })] }));
}
