import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
const ToastContext = createContext({
    show: () => undefined,
});
export const useToast = () => useContext(ToastContext);
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const show = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);
    return (_jsxs(ToastContext.Provider, { value: { show }, children: [children, _jsx("div", { className: "pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6", children: _jsx(AnimatePresence, { children: toasts.map((t) => (_jsxs(motion.div, { initial: { opacity: 0, y: 16, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 8, scale: 0.96 }, className: cn('pointer-events-auto flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur', t.type === 'success' && 'border-emerald-200 bg-white text-emerald-700', t.type === 'error' && 'border-wine/30 bg-white text-wine', t.type === 'info' && 'border-primary/30 bg-white text-primary-dark'), children: [t.type === 'success' && _jsx(CheckCircle2, { className: "size-5 text-success" }), t.type === 'error' && _jsx(XCircle, { className: "size-5 text-error" }), t.type === 'info' && _jsx(Info, { className: "size-5 text-primary" }), t.message] }, t.id))) }) })] }));
}
