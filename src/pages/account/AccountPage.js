import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { LogOut, KeyRound, ShieldCheck, AlertTriangle, Sparkles, RefreshCcw, Save, CalendarClock, } from 'lucide-react';
import { buildEntityEmail, entityDisplayName, entityDisplayType, entityLogin, fetchEntitySession, updateEntityOwn, magicLogin, readStoredSession, clearStoredSession, } from '@/services/entityAccount';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { PlanBadge } from '@/components/ui/Badge';
import { FullPageLoader } from '@/components/ui/States';
import { formatDate } from '@/lib/utils';
import { Seo } from '@/components/seo/Seo';
function daysLeft(expires) {
    if (!expires)
        return null;
    const diff = new Date(expires).getTime() - Date.now();
    return Math.ceil(diff / (24 * 3600 * 1000));
}
function ExpiryBanner({ plan, expires }) {
    const days = daysLeft(expires);
    if (plan === 'free' || days === null) {
        return (_jsxs("div", { className: "flex items-start gap-3 rounded-2xl border border-border bg-subtle p-4", children: [_jsx(Sparkles, { className: "mt-0.5 size-5 shrink-0 text-primary" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-ink", children: "\u0623\u0646\u062A \u0639\u0644\u0649 \u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629" }), _jsx("p", { className: "mt-1 text-xs leading-6 text-muted", children: "\u0627\u0634\u062A\u0631\u0643 \u0644\u062A\u0641\u0639\u064A\u0644 \u0634\u0627\u0631\u0629 \u0627\u0644\u0628\u0627\u0642\u0629 \u0648\u0625\u0628\u0631\u0627\u0632 \u0635\u0641\u062D\u062A\u0643 \u0641\u064A \u0627\u0644\u062F\u0644\u064A\u0644. \u064A\u0645\u0643\u0646\u0643 \u0637\u0644\u0628 \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0645\u0646 \u0635\u0641\u062D\u0629 \u0627\u0644\u0628\u0627\u0642\u0627\u062A." })] })] }));
    }
    if (days < 0) {
        return (_jsxs("div", { className: "flex items-start gap-3 rounded-2xl border border-error/20 bg-wine-soft p-4", children: [_jsx(AlertTriangle, { className: "mt-0.5 size-5 shrink-0 text-error" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-error", children: "\u0627\u0646\u062A\u0647\u0649 \u0627\u0634\u062A\u0631\u0627\u0643\u0643" }), _jsx("p", { className: "mt-1 text-xs leading-6 text-muted", children: "\u062C\u062F\u0651\u062F \u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0644\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0645\u0632\u0627\u064A\u0627 \u0627\u0644\u0628\u0627\u0642\u0629 \u0648\u0638\u0647\u0648\u0631 \u0635\u0641\u062D\u062A\u0643 \u0627\u0644\u0645\u0645\u064A\u0651\u0632." }), _jsx(Link, { to: "/plans", className: "mt-2 inline-block text-xs font-bold text-error hover:underline", children: "\u0637\u0644\u0628 \u062A\u062C\u062F\u064A\u062F \u2192" })] })] }));
    }
    if (days <= 30) {
        return (_jsxs("div", { className: "flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold-soft p-4", children: [_jsx(AlertTriangle, { className: "mt-0.5 size-5 shrink-0 text-gold-dark" }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm font-bold text-gold-dark", children: ["\u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0633\u064A\u0646\u062A\u0647\u064A \u062E\u0644\u0627\u0644 ", days, " \u064A\u0648\u0645"] }), _jsxs("p", { className: "mt-1 text-xs leading-6 text-muted", children: ["\u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0627\u0644\u062D\u0627\u0644\u064A (\u0627\u0644\u0630\u0647\u0628\u064A) \u064A\u0646\u062A\u0647\u064A \u0628\u062A\u0627\u0631\u064A\u062E ", formatDate(expires), " \u2014 \u062C\u062F\u0651\u062F\u0647 \u0644\u062A\u0641\u0627\u062F\u064A \u062A\u0648\u0642\u0641 \u0627\u0644\u0645\u0632\u0627\u064A\u0627."] }), _jsx(Link, { to: "/plans", className: "mt-2 inline-block text-xs font-bold text-gold-dark hover:underline", children: "\u0637\u0644\u0628 \u062A\u062C\u062F\u064A\u062F \u2190" })] })] }));
    }
    return (_jsxs("div", { className: "flex items-start gap-3 rounded-2xl border border-border bg-subtle p-4", children: [_jsx(CalendarClock, { className: "mt-0.5 size-5 shrink-0 text-primary" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-ink", children: "\u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0646\u0634\u0637" }), _jsxs("p", { className: "mt-1 text-xs leading-6 text-muted", children: ["\u064A\u0646\u062A\u0647\u064A \u0628\u062A\u0627\u0631\u064A\u062E ", formatDate(expires), " \u2014 \u062A\u0628\u0642\u0651\u0649 ", days, " \u064A\u0648\u0645."] })] })] }));
}
export function AccountPage() {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const toast = useToast();
    const [autoEmail, setAutoEmail] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [logging, setLogging] = useState(false);
    const [checking, setChecking] = useState(true);
    const [session, setSession] = useState(null);
    const [badLogin, setBadLogin] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (slug)
            setAutoEmail(buildEntityEmail(slug));
    }, [slug]);
    useEffect(() => {
        const stored = readStoredSession();
        if (!stored || (slug && stored.slug !== slug)) {
            setChecking(false);
            return;
        }
        void fetchEntitySession(stored.token)
            .then((d) => {
            if (d && (!slug || d.slug === slug)) {
                setSession(d);
                const e = d.entity ?? {};
                const workHours = e.work_hours;
                setForm({
                    name: String(e.name ?? ''),
                    specialty: String(e.specialty ?? ''),
                    phone: String(e.phone ?? ''),
                    whatsapp: String(e.whatsapp ?? ''),
                    address: String(e.address ?? ''),
                    bio: String(e.bio ?? e.description ?? ''),
                    services: Array.isArray(e.services) ? e.services.join('، ') : String(e.services ?? ''),
                    video_url: String(e.video_url ?? ''),
                    instagram: String(e.instagram ?? ''),
                    facebook: String(e.facebook ?? ''),
                    work_hours: workHours ? JSON.stringify(workHours, null, 2) : '',
                });
            }
        })
            .finally(() => setChecking(false));
    }, [slug]);
    useEffect(() => {
        const tk = searchParams.get('tk');
        if (!tk)
            return;
        setSearchParams((p) => {
            const q = new URLSearchParams(p);
            q.delete('tk');
            return q;
        }, { replace: true });
        void magicLogin(tk)
            .then((s) => {
            if (!s) {
                toast.show('رابط الدخول غير صالح أو منتهي', 'error');
                return;
            }
            return fetchEntitySession(s.token)
                .then((d) => {
                if (d) {
                    setSession(d);
                    const e = d.entity ?? {};
                    setForm({
                        name: String(e.name ?? ''),
                        specialty: String(e.specialty ?? ''),
                        phone: String(e.phone ?? ''),
                        whatsapp: String(e.whatsapp ?? ''),
                        address: String(e.address ?? ''),
                        bio: String(e.bio ?? e.description ?? ''),
                        services: Array.isArray(e.services) ? e.services.join('، ') : String(e.services ?? ''),
                        video_url: String(e.video_url ?? ''),
                        instagram: String(e.instagram ?? ''),
                        facebook: String(e.facebook ?? ''),
                        work_hours: e.work_hours ? JSON.stringify(e.work_hours, null, 2) : '',
                    });
                }
            });
        })
            .finally(() => setChecking(false));
    }, [searchParams, setSearchParams, toast]);
    const doLogin = async (e) => {
        e.preventDefault();
        if (!loginEmail.trim() || !loginPass) {
            toast.show('أدخل البريد وكلمة السر', 'error');
            return;
        }
        setLogging(true);
        setBadLogin(false);
        const s = await entityLogin(loginEmail, loginPass);
        setLogging(false);
        if (!s) {
            setBadLogin(true);
            toast.show('بيانات الدخول غير صحيحة', 'error');
            return;
        }
        const d = await fetchEntitySession(s.token);
        if (d) {
            setSession(d);
            const ent = d.entity ?? {};
            setForm({
                name: String(ent.name ?? ''),
                specialty: String(ent.specialty ?? ''),
                phone: String(ent.phone ?? ''),
                whatsapp: String(ent.whatsapp ?? ''),
                address: String(ent.address ?? ''),
                bio: String(ent.bio ?? ent.description ?? ''),
                services: Array.isArray(ent.services) ? ent.services.join('، ') : String(ent.services ?? ''),
                video_url: String(ent.video_url ?? ''),
                instagram: String(ent.instagram ?? ''),
                facebook: String(ent.facebook ?? ''),
                work_hours: ent.work_hours ? JSON.stringify(ent.work_hours, null, 2) : '',
            });
        }
    };
    const logout = () => {
        clearStoredSession();
        setSession(null);
        setLoginPass('');
    };
    const save = async () => {
        const stored = readStoredSession();
        if (!stored || !session)
            return;
        setSaving(true);
        const fields = {
            name: form.name,
            phone: form.phone,
            whatsapp: form.whatsapp,
            address: form.address,
            video_url: form.video_url || null,
            instagram: form.instagram || null,
            facebook: form.facebook || null,
        };
        const label = session.entity_type === 'doctor' ? 'bio' : 'description';
        fields[label] = form.bio;
        if (session.entity_type === 'doctor')
            fields.specialty = form.specialty;
        const services = form.services.split(/[،,،\n]/).map((s) => s.trim()).filter(Boolean);
        fields.services = services;
        let workHours = null;
        if (form.work_hours.trim()) {
            try {
                const parsed = JSON.parse(form.work_hours);
                if (parsed && typeof parsed === 'object')
                    workHours = parsed;
            }
            catch {
                toast.show('صيغة ساعات الدوام غير صحيحة (يجب أن تكون JSON)', 'error');
                setSaving(false);
                return;
            }
        }
        fields.work_hours = workHours;
        const ok = await updateEntityOwn(stored.token, fields);
        setSaving(false);
        if (ok) {
            toast.show('تم حفظ التغييرات');
            setSession((prev) => prev ? { ...prev, entity: { ...(prev.entity ?? {}), ...fields } } : prev);
        }
        else {
            toast.show('تعذر الحفظ، حاول مجدداً', 'error');
        }
    };
    if (checking)
        return _jsx(FullPageLoader, { label: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0642\u0642\u2026" });
    const routeLink = session?.entity_type === 'health_center'
        ? 'health-centers'
        : session?.entity_type === 'radiology'
            ? 'radiology'
            : `${session?.entity_type ?? ''}s`;
    return (_jsxs("div", { className: "mx-auto max-w-3xl px-4 py-10 sm:px-6", children: [_jsx(Seo, { title: "\u062D\u0633\u0627\u0628 \u0627\u0644\u062C\u0647\u0629", description: "\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u062E\u0627\u0635\u0629 \u0628\u0627\u0644\u0637\u0628\u064A\u0628 \u0623\u0648 \u0627\u0644\u0639\u064A\u0627\u062F\u0629 \u0623\u0648 \u0627\u0644\u0645\u062E\u0628\u0631 \u0641\u064A \u062F\u0644\u064A\u0644 \u0637\u064A\u0628\u0629 \u0627\u0644\u0625\u0645\u0627\u0645 \u0627\u0644\u0637\u0628\u064A." }), !session ? (_jsx(Card, { children: _jsx(CardBody, { className: "py-10", children: _jsxs("div", { className: "mx-auto max-w-sm", children: [_jsxs("div", { className: "mb-5 text-center", children: [_jsx("div", { className: "mx-auto mb-3 flex size-14 items-center justify-center rounded-3xl bg-primary text-white", children: _jsx(KeyRound, { className: "size-7" }) }), _jsx("h1", { className: "text-xl font-black text-ink", children: "\u062F\u062E\u0648\u0644 \u0627\u0644\u062C\u0647\u0629" }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u0623\u062F\u062E\u0644 \u0627\u0644\u0628\u0631\u064A\u062F \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631 \u0627\u0644\u062E\u0627\u0635\u064A\u0646 \u0628\u0643 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0635\u0641\u062D\u062A\u0643." })] }), _jsxs("form", { onSubmit: (e) => void doLogin(e), className: "space-y-4", children: [_jsx(Field, { label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", children: _jsx(Input, { type: "text", dir: "ltr", placeholder: autoEmail || 'admin-...@gmail.com', value: loginEmail, onChange: (e) => { setLoginEmail(e.target.value); setBadLogin(false); } }) }), _jsx(Field, { label: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631", children: _jsx(Input, { type: "password", dir: "ltr", placeholder: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631 \u0627\u0644\u0645\u0631\u0633\u0644\u0629 \u0644\u0643", value: loginPass, onChange: (e) => { setLoginPass(e.target.value); setBadLogin(false); } }) }), badLogin && _jsx("p", { className: "rounded-xl bg-wine-soft px-3 py-2 text-xs font-bold text-error", children: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" }), _jsxs(Button, { type: "submit", loading: logging, className: "w-full", children: [_jsx(KeyRound, { className: "size-4" }), "\u062F\u062E\u0648\u0644"] })] }), _jsx("p", { className: "mt-4 text-center text-[11px] leading-5 text-muted", children: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u062A\u064F\u0633\u0644\u064E\u0651\u0645 \u0644\u0643 \u0639\u0646\u062F \u062A\u0641\u0639\u064A\u0644 \u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0645\u0646 \u0642\u0628\u0644 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0646\u0635\u0629." })] }) }) })) : (_jsxs("div", { className: "space-y-6", children: [_jsx(Seo, { title: `لوحة تحكم ${entityDisplayName(session.entity)}`, description: "\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u062C\u0647\u0629" }), _jsxs("div", { className: "flex flex-col gap-4 rounded-[18px] border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-dark", children: _jsx(ShieldCheck, { className: "size-7" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-black text-ink", children: entityDisplayName(session.entity) }), _jsxs("p", { className: "mt-0.5 flex items-center gap-2 text-sm text-muted", children: [entityDisplayType(session.entity_type), _jsx(PlanBadge, { plan: String(session.entity?.plan ?? 'free') })] }), _jsx("p", { className: "mt-1 text-xs text-muted", dir: "ltr", children: session.email })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "outline", onClick: logout, children: [_jsx(LogOut, { className: "size-4" }), "\u062E\u0631\u0648\u062C"] }), _jsx(Button, { size: "sm", asChild: true, children: _jsx(Link, { to: `/${routeLink}/${session.slug}`, children: "\u0639\u0631\u0636 \u0635\u0641\u062D\u062A\u064A" }) })] })] }), _jsx(ExpiryBanner, { plan: String(session.entity?.plan ?? 'free'), expires: session.entity?.plan_expires_at }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0635\u0641\u062D\u0629" }) }), _jsxs(CardBody, { children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "\u0627\u0644\u0627\u0633\u0645", children: _jsx(Input, { value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })) }) }), session.entity_type === 'doctor' && (_jsx(Field, { label: "\u0627\u0644\u0627\u062E\u062A\u0635\u0627\u0635", children: _jsx(Input, { value: form.specialty, onChange: (e) => setForm((f) => ({ ...f, specialty: e.target.value })) }) })), _jsx(Field, { label: "\u0627\u0644\u0647\u0627\u062A\u0641", children: _jsx(Input, { dir: "ltr", value: form.phone, onChange: (e) => setForm((f) => ({ ...f, phone: e.target.value })) }) }), _jsx(Field, { label: "\u0648\u0627\u062A\u0633\u0627\u0628", children: _jsx(Input, { dir: "ltr", value: form.whatsapp, onChange: (e) => setForm((f) => ({ ...f, whatsapp: e.target.value })) }) }), _jsx(Field, { label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", children: _jsx(Input, { value: form.address, onChange: (e) => setForm((f) => ({ ...f, address: e.target.value })) }) }), _jsx(Field, { label: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0641\u064A\u062F\u064A\u0648 \u0627\u0644\u062A\u0639\u0631\u064A\u0641\u064A", children: _jsx(Input, { dir: "ltr", value: form.video_url, onChange: (e) => setForm((f) => ({ ...f, video_url: e.target.value })), placeholder: "https://\u2026" }) })] }), _jsxs("div", { className: "mt-4 space-y-4", children: [_jsx(Field, { label: "\u0646\u0628\u0630\u0629 \u062A\u0639\u0631\u064A\u0641\u064A\u0629", children: _jsx(Textarea, { rows: 4, value: form.bio, onChange: (e) => setForm((f) => ({ ...f, bio: e.target.value })) }) }), _jsx(Field, { label: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A (\u0627\u0641\u0635\u0644 \u0628\u064A\u0646\u0647\u0627 \u0628\u0641\u0627\u0635\u0644\u0629)", children: _jsx(Textarea, { rows: 2, value: form.services, onChange: (e) => setForm((f) => ({ ...f, services: e.target.value })) }) }), _jsx(Field, { label: 'ساعات الدوام (JSON بصيغة {"sat":"9-17"}...)', children: _jsx(Textarea, { rows: 3, dir: "ltr", value: form.work_hours, onChange: (e) => setForm((f) => ({ ...f, work_hours: e.target.value })), placeholder: '{"sat":"9:00 - 17:00","sun":"9:00 - 17:00","fri":"\u0645\u063A\u0644\u0642"}' }) }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "\u0627\u0646\u0633\u062A\u063A\u0631\u0627\u0645", children: _jsx(Input, { dir: "ltr", value: form.instagram, onChange: (e) => setForm((f) => ({ ...f, instagram: e.target.value })) }) }), _jsx(Field, { label: "\u0641\u064A\u0633\u0628\u0648\u0643", children: _jsx(Input, { dir: "ltr", value: form.facebook, onChange: (e) => setForm((f) => ({ ...f, facebook: e.target.value })) }) })] })] }), _jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [_jsxs(Button, { onClick: () => void save(), loading: saving, children: [_jsx(Save, { className: "size-4" }), "\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A"] }), _jsx(Button, { variant: "outline", asChild: true, children: _jsxs(Link, { to: "/plans", children: [_jsx(RefreshCcw, { className: "size-4" }), "\u0637\u0644\u0628 \u062A\u062C\u062F\u064A\u062F / \u062A\u0631\u0642\u064A\u0629"] }) })] })] })] })] })), _jsxs("p", { className: "mt-8 text-center text-[11px] text-muted", children: ["\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u062C\u0647\u0627\u062A \u0641\u064A \u062F\u0644\u064A\u0644 \u0637\u064A\u0628\u0629 \u0627\u0644\u0625\u0645\u0627\u0645 \u0627\u0644\u0637\u0628\u064A \u2014 ", _jsx(Link, { to: "/", className: "hover:underline", children: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0631\u0626\u064A\u0633\u064A\u0629" })] })] }));
}
