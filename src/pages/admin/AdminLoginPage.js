import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn } from '@/services/admin';
import { useAdminAuth } from '@/features/admin/auth';
import { APP_NAME } from '@/constants';
export function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { profile, refresh } = useAdminAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (profile?.is_admin)
            navigate('/admin', { replace: true });
    }, [profile, navigate]);
    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);
        if (error) {
            setError('بيانات الدخول غير صحيحة أو لا يملك الحساب صلاحية إدارية.');
            return;
        }
        await refresh();
        navigate('/admin', { replace: true });
    };
    return (_jsx("div", { className: "flex min-h-screen flex-col items-center justify-center bg-gradient-to-l from-primary-light/40 to-background px-4 py-10", children: _jsxs("div", { className: "w-full max-w-sm", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "mx-auto mb-3 flex size-16 items-center justify-center rounded-3xl bg-primary text-white shadow-lg shadow-primary/25", children: _jsx(ShieldCheck, { className: "size-8" }) }), _jsx("h1", { className: "text-xl font-black text-ink", children: APP_NAME }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0625\u0644\u0649 \u0644\u0648\u062D\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629" })] }), _jsxs("form", { onSubmit: submit, className: "space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-sm font-bold text-ink", children: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "h-12 w-full rounded-xl border border-border bg-surface pr-11 pl-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15", placeholder: "admin@dalil.com" })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("label", { className: "text-sm font-bold text-ink", children: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" }), _jsx("input", { type: show ? 'text' : 'password', required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-11 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("button", { type: "button", onClick: () => setShow((v) => !v), className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer", children: show ? _jsx(EyeOff, { className: "size-4.5" }) : _jsx(Eye, { className: "size-4.5" }) })] })] }), error && _jsx("p", { className: "rounded-xl bg-wine-soft px-3 py-2.5 text-xs font-semibold text-error", children: error }), _jsxs("button", { type: "submit", disabled: loading, className: "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-dark disabled:opacity-60 cursor-pointer", children: [loading && _jsx(Loader2, { className: "size-4 animate-spin" }), "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644"] }), _jsx("p", { className: "text-center text-[11px] leading-5 text-muted", children: "\u062A\u062A\u0645 \u0625\u062F\u0627\u0631\u0629 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u0645\u0646 \u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0638\u0627\u0645 \u0639\u0628\u0631 Supabase Auth." })] })] }) }));
}
