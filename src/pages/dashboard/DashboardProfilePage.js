import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Save, Phone, MapPin, Video, Stethoscope, Sparkles, Share2, Globe, Sun } from 'lucide-react';
import { useDashboardSession } from '@/layouts/DashboardLayout';
import { readStoredSession, updateEntityOwn, setVacationUntil } from '@/services/entityAccount';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea, Select } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { Seo } from '@/components/seo/Seo';
export function DashboardProfilePage() {
    const { session, setSession } = useDashboardSession();
    const toast = useToast();
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [vacationDate, setVacationDate] = useState('');
    const [vacationBusy, setVacationBusy] = useState(false);
    useEffect(() => {
        if (!session)
            return;
        const e = session.entity;
        if (!e)
            return;
        setForm({
            name: String(e.name ?? ''),
            specialty: String(e.specialty ?? ''),
            gender: String(e.gender ?? ''),
            phone: String(e.phone ?? ''),
            whatsapp: String(e.whatsapp ?? ''),
            address: String(e.address ?? ''),
            bio: String(e.bio ?? e.description ?? ''),
            services: Array.isArray(e.services) ? e.services.join('، ') : String(e.services ?? ''),
            certifications: Array.isArray(e.certifications) ? e.certifications.join('، ') : String(e.certifications ?? ''),
            departments: Array.isArray(e.departments) ? e.departments.join('، ') : String(e.departments ?? ''),
            tests: Array.isArray(e.tests) ? e.tests.join('، ') : String(e.tests ?? ''),
            machines: Array.isArray(e.machines) ? e.machines.join('، ') : String(e.machines ?? ''),
            video_url: String(e.video_url ?? ''),
            instagram: String(e.instagram ?? ''),
            facebook: String(e.facebook ?? ''),
            experience_years: String(e.experience_years ?? ''),
            emergency_phone: String(e.emergency_phone ?? ''),
        });
        setVacationDate(String(e.vacation_until ?? ''));
    }, [session]);
    if (!session)
        return null;
    const isDoctor = session.entity_type === 'doctor';
    const isHospital = session.entity_type === 'hospital';
    const isLab = session.entity_type === 'lab';
    const isRadiology = session.entity_type === 'radiology';
    const vacationValue = String(session.entity?.vacation_until ?? '');
    const onVacation = Boolean(vacationValue && new Date(vacationValue + 'T23:59:59') >= new Date());
    const save = async () => {
        const stored = readStoredSession();
        if (!stored)
            return;
        if (!form.name.trim()) {
            toast.show('الاسم مطلوب', 'error');
            return;
        }
        setSaving(true);
        const fields = {
            name: form.name.trim(),
            phone: form.phone.trim() || null,
            whatsapp: form.whatsapp.trim() || null,
            address: form.address.trim() || null,
            video_url: form.video_url.trim() || null,
            instagram: form.instagram.trim() || null,
            facebook: form.facebook.trim() || null,
        };
        const label = isDoctor ? 'bio' : 'description';
        fields[label] = form.bio.trim() || null;
        if (isDoctor) {
            fields.specialty = form.specialty.trim() || null;
            if (form.gender)
                fields.gender = form.gender;
            fields.experience_years = form.experience_years.trim() || null;
            fields.certifications = form.certifications.split(/[،,\n]/).map((s) => s.trim()).filter(Boolean);
        }
        const services = form.services.split(/[،,\n]/).map((s) => s.trim()).filter(Boolean);
        fields.services = services;
        if (form.departments)
            fields.departments = form.departments.split(/[،,\n]/).map((s) => s.trim()).filter(Boolean);
        if (form.tests)
            fields.tests = form.tests.split(/[،,\n]/).map((s) => s.trim()).filter(Boolean);
        if (form.machines)
            fields.machines = form.machines.split(/[،,\n]/).map((s) => s.trim()).filter(Boolean);
        if (form.emergency_phone)
            fields.emergency_phone = form.emergency_phone.trim() || null;
        const ok = await updateEntityOwn(stored.token, fields);
        setSaving(false);
        if (ok) {
            toast.show('تم حفظ التغييرات');
            setSession((prev) => prev ? { ...prev, entity: { ...(prev.entity ?? {}), ...fields, services, ...(isDoctor ? { certifications: fields.certifications } : {}) } } : prev);
        }
        else
            toast.show('تعذر الحفظ — حاول مجدداً', 'error');
    };
    const cnVacationIcon = (on) => on ? 'flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gold text-primary-dark' : 'flex size-12 shrink-0 items-center justify-center rounded-2xl bg-subtle text-muted';
    const saveVacation = async (until) => {
        const stored = readStoredSession();
        if (!stored)
            return;
        setVacationBusy(true);
        const res = await setVacationUntil(stored.token, until);
        setVacationBusy(false);
        if (res?.ok) {
            setVacationDate(until ?? '');
            setSession((prev) => prev ? { ...prev, entity: { ...(prev.entity ?? {}), vacation_until: until } } : prev);
            toast.show(until ? 'تم تفعيل وضع الإجازة — ستظهر رسالتها على صفحتك' : 'تم إلغاء وضع الإجازة');
        }
        else {
            toast.show(res?.error ?? 'تعذر التحديث', 'error');
        }
    };
    return (_jsxs("div", { className: "mx-auto max-w-4xl space-y-6", children: [_jsx(Seo, { title: "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A", description: "\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062C\u0647\u0629" }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-black text-ink", children: "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A" }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u0639\u062F\u0651\u0644 \u0645\u0639\u0644\u0648\u0645\u0627\u062A\u0643 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629 \u0648\u0633\u062A\u0638\u0647\u0631 \u0641\u0648\u0631\u0627\u064B \u0639\u0644\u0649 \u0635\u0641\u062D\u062A\u0643 \u0627\u0644\u0639\u0627\u0645\u0629." })] }), isDoctor && (_jsx(Card, { className: onVacation ? 'border-gold bg-gold-soft/50' : undefined, children: _jsxs(CardBody, { className: "flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center", children: [_jsx("span", { className: cnVacationIcon(onVacation), children: _jsx(Sun, { className: "size-6" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-sm font-black text-ink", children: "\u0648\u0636\u0639 \u0627\u0644\u0625\u062C\u0627\u0632\u0629" }), _jsx("p", { className: "mt-0.5 text-xs leading-6 text-muted", children: onVacation
                                        ? `إجازة فعّالة حتى ${vacationValue} — ستظهر رسالة على صفحتك ويتوقف استقبال طلبات المواعيد مؤقتاً.`
                                        : 'تذهب لإجازة؟ حدّد تاريخ العودة وستظهر رسالة على صفحتك مع تعليق طلبات المواعيد مؤقتاً.' })] }), _jsxs("div", { className: "flex w-full flex-wrap items-center gap-2 sm:w-auto", children: [_jsx("input", { type: "date", min: new Date().toISOString().slice(0, 10), value: vacationDate, onChange: (e) => setVacationDate(e.target.value), className: "h-10 rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none focus:border-primary" }), _jsx(Button, { size: "sm", loading: vacationBusy, disabled: !onVacation && !vacationDate, onClick: () => void saveVacation(onVacation ? null : vacationDate || null), children: onVacation ? 'إلغاء الإجازة' : 'تفعيل الإجازة' })] })] }) })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629" }) }), _jsxs(CardBody, { className: "space-y-4", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "\u0627\u0644\u0627\u0633\u0645", required: true, children: _jsx(Input, { value: form.name ?? '', onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })), placeholder: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644" }) }), isDoctor && (_jsxs(_Fragment, { children: [_jsx(Field, { label: "\u0627\u0644\u0627\u062E\u062A\u0635\u0627\u0635", children: _jsxs("div", { className: "relative", children: [_jsx(Stethoscope, { className: "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" }), _jsx(Input, { className: "pr-10", value: form.specialty ?? '', onChange: (e) => setForm((f) => ({ ...f, specialty: e.target.value })), placeholder: "\u0645\u062B\u0627\u0644: \u0642\u0644\u0628\u064A\u0629" })] }) }), _jsx(Field, { label: "\u0627\u0644\u062C\u0646\u0633", children: _jsxs(Select, { value: form.gender ?? '', onChange: (e) => setForm((f) => ({ ...f, gender: e.target.value })), children: [_jsx("option", { value: "", children: "\u2014 \u063A\u064A\u0631 \u0645\u062D\u062F\u062F \u2014" }), _jsx("option", { value: "male", children: "\u0630\u0643\u0631" }), _jsx("option", { value: "female", children: "\u0623\u0646\u062B\u0649" })] }) }), _jsx(Field, { label: "\u0633\u0646\u0648\u0627\u062A \u0627\u0644\u062E\u0628\u0631\u0629", children: _jsx(Input, { type: "number", min: 0, value: form.experience_years ?? '', onChange: (e) => setForm((f) => ({ ...f, experience_years: e.target.value })), placeholder: "\u0645\u062B\u0627\u0644: 12" }) })] })), _jsx(Field, { label: "\u0627\u0644\u0647\u0627\u062A\u0641", children: _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" }), _jsx(Input, { dir: "ltr", className: "pr-10", value: form.phone ?? '', onChange: (e) => setForm((f) => ({ ...f, phone: e.target.value })), placeholder: "09xxxxxxxx" })] }) }), _jsx(Field, { label: "\u0648\u0627\u062A\u0633\u0627\u0628", children: _jsx(Input, { dir: "ltr", value: form.whatsapp ?? '', onChange: (e) => setForm((f) => ({ ...f, whatsapp: e.target.value })), placeholder: "09xxxxxxxx" }) }), _jsx(Field, { label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", hint: "\u064A\u0638\u0647\u0631 \u0639\u0644\u0649 \u0635\u0641\u062D\u0629 \u0627\u0644\u062C\u0647\u0629 \u0648\u0627\u0644\u062E\u0631\u064A\u0637\u0629", children: _jsxs("div", { className: "relative", children: [_jsx(MapPin, { className: "absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" }), _jsx(Input, { className: "pr-10", value: form.address ?? '', onChange: (e) => setForm((f) => ({ ...f, address: e.target.value })) })] }) }), isHospital && _jsx(Field, { label: "\u0647\u0627\u062A\u0641 \u0627\u0644\u0637\u0648\u0627\u0631\u0626", children: _jsx(Input, { dir: "ltr", value: form.emergency_phone ?? '', onChange: (e) => setForm((f) => ({ ...f, emergency_phone: e.target.value })) }) }), _jsx(Field, { label: "\u0631\u0627\u0628\u0637 \u0641\u064A\u062F\u064A\u0648 \u062A\u0639\u0631\u064A\u0641\u064A", children: _jsxs("div", { className: "relative", children: [_jsx(Video, { className: "absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" }), _jsx(Input, { dir: "ltr", className: "pr-10", value: form.video_url ?? '', onChange: (e) => setForm((f) => ({ ...f, video_url: e.target.value })), placeholder: "https://youtube.com/..." })] }) })] }), _jsx(Field, { label: isDoctor ? 'نبذة تعريفية' : 'وصف الجهة', hint: "\u062A\u0638\u0647\u0631 \u0641\u064A \u0623\u0639\u0644\u0649 \u0635\u0641\u062D\u0629 \u0627\u0644\u062C\u0647\u0629", children: _jsx(Textarea, { rows: 4, value: form.bio ?? '', onChange: (e) => setForm((f) => ({ ...f, bio: e.target.value })), placeholder: isDoctor ? 'نبذة عن الطبيب وخبرته...' : 'وصف مختصر عن الجهة وخدماتها...' }) }), _jsx(Field, { label: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A (\u0627\u0641\u0635\u0644 \u0628\u0641\u0627\u0635\u0644\u0629)", children: _jsx(Textarea, { rows: 2, value: form.services ?? '', onChange: (e) => setForm((f) => ({ ...f, services: e.target.value })), placeholder: "\u0645\u0639\u0627\u064A\u0646\u0629\u060C \u062A\u062E\u0637\u064A\u0637 \u0642\u0644\u0628\u060C \u0625\u064A\u0643\u0648..." }) }), isDoctor && _jsx(Field, { label: "\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A (\u0627\u0641\u0635\u0644 \u0628\u0641\u0627\u0635\u0644\u0629)", children: _jsx(Textarea, { rows: 2, value: form.certifications ?? '', onChange: (e) => setForm((f) => ({ ...f, certifications: e.target.value })) }) }), (isHospital || session.entity_type === 'health_center') && _jsx(Field, { label: "\u0627\u0644\u0623\u0642\u0633\u0627\u0645", children: _jsx(Textarea, { rows: 2, value: form.departments ?? '', onChange: (e) => setForm((f) => ({ ...f, departments: e.target.value })), placeholder: "\u0642\u0644\u0628\u064A\u0629\u060C \u0639\u0638\u0645\u064A\u0629..." }) }), isLab && _jsx(Field, { label: "\u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 \u0627\u0644\u0645\u062A\u0627\u062D\u0629", children: _jsx(Textarea, { rows: 2, value: form.tests ?? '', onChange: (e) => setForm((f) => ({ ...f, tests: e.target.value })) }) }), isRadiology && _jsx(Field, { label: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629", children: _jsx(Textarea, { rows: 2, value: form.machines ?? '', onChange: (e) => setForm((f) => ({ ...f, machines: e.target.value })) }) }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "\u0627\u0646\u0633\u062A\u063A\u0631\u0627\u0645", children: _jsxs("div", { className: "relative", children: [_jsx(Share2, { className: "absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" }), _jsx(Input, { dir: "ltr", className: "pr-10", value: form.instagram ?? '', onChange: (e) => setForm((f) => ({ ...f, instagram: e.target.value })), placeholder: "https://instagram.com/..." })] }) }), _jsx(Field, { label: "\u0641\u064A\u0633\u0628\u0648\u0643", children: _jsxs("div", { className: "relative", children: [_jsx(Globe, { className: "absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" }), _jsx(Input, { dir: "ltr", className: "pr-10", value: form.facebook ?? '', onChange: (e) => setForm((f) => ({ ...f, facebook: e.target.value })), placeholder: "https://facebook.com/..." })] }) })] }), _jsxs("div", { className: "flex flex-wrap gap-3 pt-2", children: [_jsxs(Button, { onClick: () => void save(), loading: saving, children: [_jsx(Save, { className: "size-4" }), " \u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A"] }), _jsxs("span", { className: "inline-flex items-center gap-1 rounded-xl bg-primary-light px-3 py-2 text-xs font-bold text-primary-dark", children: [_jsx(Sparkles, { className: "size-3.5" }), " \u064A\u0638\u0647\u0631 \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0644\u0649 \u0635\u0641\u062D\u062A\u0643"] })] })] })] })] }));
}
