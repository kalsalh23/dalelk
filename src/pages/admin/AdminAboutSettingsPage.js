import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Info, Phone, Code2 } from 'lucide-react';
import { InstagramIcon, FacebookIcon } from '@/components/ui/BrandIcons';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeletons } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { fetchSiteSettings, saveSiteSettings } from '@/services/site';
export function AdminAboutSettingsPage() {
    const qc = useQueryClient();
    const toast = useToast();
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const { isLoading } = useQuery({
        queryKey: ['admin-about'],
        queryFn: async () => {
            const s = await fetchSiteSettings();
            setForm({
                content: String(s.about?.content ?? ''),
                support_phone: String(s.about?.support_phone ?? ''),
                support_email: String(s.about?.support_email ?? ''),
                developer_name: String(s.developer?.name ?? 'م. قصي مهند الصالح'),
                developer_title: String(s.developer?.title ?? 'مطوّر المنصة'),
                developer_phone: String(s.developer?.phone ?? '0952639157'),
                developer_international_phone: String(s.developer?.international_phone ?? '+963952639157'),
                developer_instagram: String(s.developer?.instagram ?? ''),
                developer_facebook: String(s.developer?.facebook ?? ''),
            });
            return s;
        },
    });
    const set = (k, v) => setForm((f) => (f ? { ...f, [k]: v } : f));
    const save = async () => {
        if (!form)
            return;
        setSaving(true);
        const ok = await saveSiteSettings({
            about: {
                content: form.content,
                support_phone: form.support_phone,
                support_email: form.support_email,
            },
            developer: {
                name: form.developer_name,
                title: form.developer_title,
                phone: form.developer_phone,
                international_phone: form.developer_international_phone,
                instagram: form.developer_instagram,
                facebook: form.developer_facebook,
            },
        });
        setSaving(false);
        if (ok) {
            await qc.invalidateQueries({ queryKey: ['admin-about'] });
            await qc.invalidateQueries({ queryKey: ['site-settings'] });
            toast.show('تم حفظ الإعدادات');
        }
        else {
            toast.show('تعذر الحفظ', 'error');
        }
    };
    if (isLoading || !form)
        return _jsx(Skeletons, { rows: 4, box: "!p-5" });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0645\u0646 \u0646\u062D\u0646 \u0648\u0627\u0644\u062A\u0648\u0627\u0635\u0644" }), _jsx("p", { className: "mt-0.5 text-sm text-muted", children: "\u0645\u062D\u062A\u0648\u0649 \u0635\u0641\u062D\u0629 \u00AB\u0645\u0646 \u0646\u062D\u0646\u00BB \u0648\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A \u0648\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0637\u0648\u0651\u0631 \u0627\u0644\u0645\u0646\u0635\u0629" })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Info, { className: "size-5 text-primary" }), "\u0645\u062D\u062A\u0648\u0649 \u0635\u0641\u062D\u0629 \u0645\u0646 \u0646\u062D\u0646"] }) }), _jsx(CardBody, { className: "space-y-4", children: _jsx(Field, { label: "\u0627\u0644\u0648\u0635\u0641 \u0627\u0644\u062A\u0639\u0631\u064A\u0641\u064A", children: _jsx(Textarea, { rows: 5, value: form.content, onChange: (e) => set('content', e.target.value) }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Phone, { className: "size-5 text-primary" }), "\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A"] }) }), _jsx(CardBody, { className: "space-y-4", children: _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "\u0631\u0642\u0645 \u0627\u0644\u062F\u0639\u0645", children: _jsx(Input, { dir: "ltr", value: form.support_phone, onChange: (e) => set('support_phone', e.target.value), placeholder: "+963\u2026" }) }), _jsx(Field, { label: "\u0628\u0631\u064A\u062F \u0627\u0644\u062F\u0639\u0645", children: _jsx(Input, { type: "email", dir: "ltr", value: form.support_email, onChange: (e) => set('support_email', e.target.value), placeholder: "support@\u2026" }) })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Code2, { className: "size-5 text-primary" }), "\u0645\u0637\u0648\u0651\u0631 \u0627\u0644\u0645\u0646\u0635\u0629"] }) }), _jsxs(CardBody, { className: "space-y-4", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "\u0627\u0644\u0627\u0633\u0645", children: _jsx(Input, { value: form.developer_name, onChange: (e) => set('developer_name', e.target.value) }) }), _jsx(Field, { label: "\u0627\u0644\u0635\u0641\u0629/\u0627\u0644\u0644\u0642\u0628", children: _jsx(Input, { value: form.developer_title, onChange: (e) => set('developer_title', e.target.value) }) }), _jsx(Field, { label: "\u0631\u0642\u0645 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0645\u062D\u0644\u064A", children: _jsx(Input, { dir: "ltr", value: form.developer_phone, onChange: (e) => set('developer_phone', e.target.value) }) }), _jsx(Field, { label: "\u0631\u0642\u0645 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u062F\u0648\u0644\u064A", children: _jsx(Input, { dir: "ltr", value: form.developer_international_phone, onChange: (e) => set('developer_international_phone', e.target.value) }) }), _jsx(Field, { label: "\u0631\u0627\u0628\u0637 \u0625\u0646\u0633\u062A\u063A\u0631\u0627\u0645", children: _jsx(Input, { dir: "ltr", value: form.developer_instagram, onChange: (e) => set('developer_instagram', e.target.value), placeholder: "https://instagram.com/\u2026" }) }), _jsx(Field, { label: "\u0631\u0627\u0628\u0637 \u0641\u064A\u0633\u0628\u0648\u0643", children: _jsx(Input, { dir: "ltr", value: form.developer_facebook, onChange: (e) => set('developer_facebook', e.target.value), placeholder: "https://facebook.com/\u2026" }) })] }), _jsxs("div", { className: "flex gap-2 rounded-xl bg-slate-50 p-3 text-xs text-muted", children: [_jsx(InstagramIcon, { className: "size-4 shrink-0 text-primary" }), _jsx(FacebookIcon, { className: "size-4 shrink-0 text-primary" }), "\u062A\u064F\u0633\u062A\u062E\u062F\u0645 \u0647\u0630\u0647 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0641\u064A \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u0637\u0648\u0651\u0631 \u062F\u0627\u062E\u0644 \u0635\u0641\u062D\u0629 \u0645\u0646 \u0646\u062D\u0646 \u0648\u0641\u064A \u062A\u0630\u064A\u064A\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 (Footer)."] }), _jsx(Button, { onClick: () => void save(), loading: saving, children: "\u062D\u0641\u0638 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" })] })] })] }));
}
