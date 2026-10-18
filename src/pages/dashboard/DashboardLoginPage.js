import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, ShieldCheck, AlertTriangle } from 'lucide-react';
import { buildEntityEmail, entityLogin, fetchEntitySession, magicLogin, readStoredSession } from '@/services/entityAccount';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { Seo } from '@/components/seo/Seo';
import { useParams } from 'react-router-dom';
export function DashboardLoginPage() {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [autoEmail] = useState(() => slug ? buildEntityEmail(slug) : '');
    const [email, setEmail] = useState(autoEmail);
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [bad, setBad] = useState(false);
    useEffect(() => {
        const stored = readStoredSession();
        if (stored) {
            void fetchEntitySession(stored.token).then((d) => { if (d)
                navigate('/dashboard', { replace: true }); });
        }
    }, [navigate]);
    useEffect(() => {
        const tk = searchParams.get('tk');
        if (!tk)
            return;
        setSearchParams((p) => { const q = new URLSearchParams(p); q.delete('tk'); return q; }, { replace: true });
        void magicLogin(tk).then((s) => {
            if (!s) {
                toast.show('رابط الدخول غير صالح أو منتهي', 'error');
                return;
            }
            toast.show('تم تسجيل الدخول بنجاح');
            navigate('/dashboard', { replace: true });
        });
    }, [searchParams, setSearchParams, toast, navigate]);
    const doLogin = async (e) => {
        e.preventDefault();
        if (!email.trim() || !pass) {
            toast.show('أدخل البريد وكلمة السر', 'error');
            return;
        }
        setLoading(true);
        setBad(false);
        const s = await entityLogin(email, pass);
        setLoading(false);
        if (!s) {
            setBad(true);
            toast.show('بيانات الدخول غير صحيحة', 'error');
            return;
        }
        toast.show('تم تسجيل الدخول');
        navigate('/dashboard');
    };
    return (_jsxs("div", { className: "flex min-h-[70vh] items-center justify-center px-4 py-10", children: [_jsx(Seo, { title: "\u062F\u062E\u0648\u0644 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645", description: "\u062F\u062E\u0648\u0644 \u0627\u0644\u062C\u0647\u0627\u062A \u0625\u0644\u0649 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0647\u0645" }), _jsx(Card, { className: "w-full max-w-md", children: _jsxs(CardBody, { className: "py-8", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "mx-auto mb-3 flex size-14 items-center justify-center rounded-3xl bg-primary text-white", children: _jsx(ShieldCheck, { className: "size-7" }) }), _jsx("h1", { className: "text-xl font-black text-ink", children: "\u062F\u062E\u0648\u0644 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645" }), _jsx("p", { className: "mt-1 text-sm leading-6 text-muted", children: "\u0623\u062F\u062E\u0644 \u0627\u0644\u0628\u0631\u064A\u062F \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631 \u0627\u0644\u062A\u064A \u0627\u0633\u062A\u0644\u0645\u062A\u0647\u0627 \u0645\u0646 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0628\u0639\u062F \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629." })] }), _jsxs("form", { onSubmit: (e) => void doLogin(e), className: "space-y-4", children: [_jsx(Field, { label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", children: _jsx(Input, { dir: "ltr", placeholder: autoEmail || 'admin-...@gmail.com', value: email, onChange: (e) => { setEmail(e.target.value); setBad(false); } }) }), _jsx(Field, { label: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631", children: _jsx(Input, { dir: "ltr", type: "password", placeholder: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631", value: pass, onChange: (e) => { setPass(e.target.value); setBad(false); } }) }), bad && _jsxs("p", { className: "flex items-center gap-2 rounded-xl bg-wine-soft px-3 py-2 text-xs font-bold text-error", children: [_jsx(AlertTriangle, { className: "size-4" }), " \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629"] }), _jsxs(Button, { type: "submit", loading: loading, className: "w-full", children: [_jsx(KeyRound, { className: "size-4" }), " \u062F\u062E\u0648\u0644"] })] }), _jsxs("div", { className: "mt-6 rounded-2xl bg-gold-soft p-4 text-xs leading-6 text-muted", children: [_jsx("p", { className: "font-bold text-gold-dark", children: "\u0643\u064A\u0641 \u0623\u062D\u0635\u0644 \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644\u061F" }), _jsxs("p", { className: "mt-1", children: ["\u0628\u0639\u062F \u062A\u0642\u062F\u064A\u0645 \u0637\u0644\u0628 \u062A\u0631\u0642\u064A\u0629 \u0645\u0646 \u0635\u0641\u062D\u0629 ", _jsx(Link, { to: "/plans", className: "font-bold text-primary hover:underline", children: "\u0627\u0644\u0628\u0627\u0642\u0627\u062A" }), " \u0648\u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629\u060C \u0633\u064A\u0635\u0644\u0643 \u0628\u0631\u064A\u062F \u0648\u0643\u0644\u0645\u0629 \u0633\u0631 \u0648\u0631\u0627\u0628\u0637 \u062F\u062E\u0648\u0644 \u0645\u0628\u0627\u0634\u0631 \u062E\u0627\u0635 \u0628\u0643."] })] }), _jsxs("p", { className: "mt-4 text-center text-xs text-muted", children: [_jsx(Link, { to: "/", className: "hover:underline", children: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0631\u0626\u064A\u0633\u064A\u0629" }), " \u00B7 ", _jsx(Link, { to: "/account", className: "hover:underline", children: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0642\u062F\u064A\u0645\u0629" })] })] }) })] }));
}
