import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Clock, Save, Trash2 } from 'lucide-react';
import { useDashboardSession } from '@/layouts/DashboardLayout';
import { readStoredSession, updateEntityOwn } from '@/services/entityAccount';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { Seo } from '@/components/seo/Seo';
const DAYS = [
    { key: 'sat', label: 'السبت' },
    { key: 'sun', label: 'الأحد' },
    { key: 'mon', label: 'الاثنين' },
    { key: 'tue', label: 'الثلاثاء' },
    { key: 'wed', label: 'الأربعاء' },
    { key: 'thu', label: 'الخميس' },
    { key: 'fri', label: 'الجمعة' },
];
export function DashboardHoursPage() {
    const { session, setSession } = useDashboardSession();
    const toast = useToast();
    const [workHours, setWorkHours] = useState({});
    const [openingHours, setOpeningHours] = useState('');
    const [saving, setSaving] = useState(false);
    const isPharmacyLike = session?.entity_type === 'pharmacy' || session?.entity_type === 'lab' || session?.entity_type === 'radiology';
    useEffect(() => {
        if (!session?.entity)
            return;
        const e = session.entity;
        const wh = e.work_hours;
        if (wh && typeof wh === 'object') {
            const normalized = {};
            for (const [k, v] of Object.entries(wh))
                normalized[k] = String(v ?? '');
            setWorkHours(normalized);
        }
        else
            setWorkHours({});
        setOpeningHours(String(e.opening_hours ?? ''));
    }, [session]);
    const updateDay = (key, val) => setWorkHours((prev) => ({ ...prev, [key]: val }));
    const save = async () => {
        const stored = readStoredSession();
        if (!stored)
            return;
        setSaving(true);
        const fields = {};
        if (isPharmacyLike) {
            fields.opening_hours = openingHours.trim() || null;
            // أيضاً نحفظ work_hours إن وجد
            if (Object.keys(workHours).some((k) => workHours[k]?.trim()))
                fields.work_hours = workHours;
            else
                fields.work_hours = null;
        }
        else {
            // نظف الفارغ
            const cleaned = {};
            for (const d of DAYS) {
                const v = (workHours[d.key] ?? '').trim();
                if (v)
                    cleaned[d.key] = v;
            }
            fields.work_hours = Object.keys(cleaned).length ? cleaned : null;
        }
        const ok = await updateEntityOwn(stored.token, fields);
        setSaving(false);
        if (ok) {
            toast.show('تم حفظ أوقات الدوام');
            setSession((prev) => prev ? { ...prev, entity: { ...(prev.entity ?? {}), ...fields } } : prev);
        }
        else
            toast.show('تعذر الحفظ', 'error');
    };
    if (!session)
        return null;
    return (_jsxs("div", { className: "mx-auto max-w-3xl space-y-6", children: [_jsx(Seo, { title: "\u0623\u0648\u0642\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0645", description: "\u062A\u0639\u062F\u064A\u0644 \u0623\u0648\u0642\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0645" }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-black text-ink", children: "\u0623\u0648\u0642\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0645" }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u062D\u062F\u0651\u062F \u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0639\u0645\u0644 \u0644\u0643\u0644 \u064A\u0648\u0645 \u2014 \u0627\u062A\u0631\u0643 \u0627\u0644\u062D\u0642\u0644 \u0641\u0627\u0631\u063A\u0627\u064B \u0623\u0648 \u0627\u0643\u062A\u0628 \"\u0645\u063A\u0644\u0642\" \u0644\u064A\u0648\u0645 \u0627\u0644\u0625\u063A\u0644\u0627\u0642." })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "size-4 text-primary" }), " \u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A"] }) }), _jsxs(CardBody, { className: "space-y-4", children: [isPharmacyLike ? (_jsxs(_Fragment, { children: [_jsx(Field, { label: "\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0639\u0645\u0644 (\u0646\u0635 \u062D\u0631) ", hint: "\u0645\u062B\u0627\u0644: \u064A\u0648\u0645\u064A\u0627\u064B 9 \u0635\u0628\u0627\u062D\u0627\u064B - 11 \u0645\u0633\u0627\u0621\u064B\u060C \u0627\u0644\u062C\u0645\u0639\u0629 \u0645\u063A\u0644\u0642", children: _jsx(Textarea, { rows: 3, value: openingHours, onChange: (e) => setOpeningHours(e.target.value), placeholder: "9:00 \u0635 - 10:00 \u0645" }) }), _jsx("div", { className: "rounded-xl bg-subtle p-4 text-xs text-muted", children: "\u064A\u0645\u0643\u0646\u0643 \u0623\u064A\u0636\u0627\u064B \u062A\u0639\u0628\u0626\u0629 \u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u064A\u0648\u0645\u064A \u0623\u062F\u0646\u0627\u0647 \u0648\u0633\u064A\u0638\u0647\u0631 \u0643\u062C\u062F\u0648\u0644 \u0645\u0641\u0635\u0651\u0644 \u0641\u064A \u0635\u0641\u062D\u062A\u0643." })] })) : null, _jsx("div", { className: "grid gap-3", children: DAYS.map((d) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "w-20 shrink-0 text-sm font-bold text-ink", children: d.label }), _jsx(Input, { className: "flex-1", dir: "ltr", placeholder: '\u0645\u062B\u0627\u0644: 9:00 - 17:00  \u0623\u0648  \u0645\u063A\u0644\u0642', value: workHours[d.key] ?? '', onChange: (e) => updateDay(d.key, e.target.value) }), _jsx("button", { onClick: () => updateDay(d.key, 'مغلق'), className: "shrink-0 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted hover:bg-subtle", type: "button", children: "\u0645\u063A\u0644\u0642" }), _jsx("button", { onClick: () => updateDay(d.key, ''), className: "shrink-0 text-muted hover:text-error", type: "button", children: _jsx(Trash2, { className: "size-4" }) })] }, d.key))) }), _jsxs("div", { className: "flex items-center gap-2 rounded-2xl bg-primary-light/60 px-4 py-3 text-xs leading-6 text-primary-dark", children: [_jsx(Clock, { className: "size-4 shrink-0" }), "\u0646\u0635\u064A\u062D\u0629: \u0627\u0633\u062A\u062E\u062F\u0645 \u0635\u064A\u063A\u0629 \"9:00 - 14:00 \u060C 16:00 - 20:00\" \u0644\u0644\u0641\u062A\u0631\u062A\u064A\u0646 \u0627\u0644\u0635\u0628\u0627\u062D\u064A\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0626\u064A\u0629."] }), _jsxs(Button, { onClick: () => void save(), loading: saving, children: [_jsx(Save, { className: "size-4" }), " \u062D\u0641\u0638 \u0627\u0644\u0623\u0648\u0642\u0627\u062A"] })] })] })] }));
}
