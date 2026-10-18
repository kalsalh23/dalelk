import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
export const inputBase = 'w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/70 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15';
export const Input = forwardRef(function Input({ className, ...props }, ref) {
    return _jsx("input", { ref: ref, className: cn(inputBase, 'h-11', className), ...props });
});
export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
    return _jsx("textarea", { ref: ref, className: cn(inputBase, 'min-h-24', className), ...props });
});
export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
    return (_jsx("select", { ref: ref, className: cn(inputBase, 'h-11 appearance-none cursor-pointer', className), ...props, children: children }));
});
export function Field({ label, hint, error, children, required, }) {
    return (_jsxs("div", { className: "space-y-1.5", children: [label && (_jsxs("label", { className: "block text-sm font-semibold text-ink", children: [label, required && _jsx("span", { className: "text-error", children: " *" })] })), children, error ? (_jsx("p", { className: "text-xs font-medium text-error", children: error })) : hint ? (_jsx("p", { className: "text-xs text-muted", children: hint })) : null] }));
}
