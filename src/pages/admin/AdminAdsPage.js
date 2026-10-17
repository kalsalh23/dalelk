import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil, Megaphone, Link2, Eye } from 'lucide-react';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import { Skeletons, EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { fetchAllAds, createAd, updateAd, deleteAd } from '@/services/site';
import { deleteImage, uploadToFolder, compressImage } from '@/services/admin';
import { getPublicUrl } from '@/lib/supabase';
import { cn } from '@/lib/utils';
function isExpired(ad) {
    return Boolean(ad.expires_at) && new Date(ad.expires_at).getTime() <= Date.now();
}
export function AdminAdsPage() {
    const qc = useQueryClient();
    const toast = useToast();
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const { data: ads, isLoading } = useQuery({ queryKey: ['admin-ads'], queryFn: fetchAllAds });
    const del = useMutation({
        mutationFn: async (ad) => {
            await deleteImage(ad.image);
            const ok = await deleteAd(ad.id);
            if (!ok)
                throw new Error();
        },
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-ads'] }); toast.show('تم الحذف'); setDeleting(null); },
        onError: () => toast.show('تعذر الحذف', 'error'),
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062A" }), _jsx("p", { className: "mt-0.5 text-sm text-muted", children: "\u0623\u062F\u0631 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u064A \u062A\u0638\u0647\u0631 \u0639\u0644\u0649 \u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0648\u0635\u0641\u062D\u0629 \u0645\u0646 \u0646\u062D\u0646" })] }), _jsxs(Button, { onClick: () => setEditing({}), children: [_jsx(Plus, { className: "size-4.5" }), " \u0625\u0639\u0644\u0627\u0646 \u062C\u062F\u064A\u062F"] })] }), isLoading ? (_jsx(Skeletons, { rows: 4, box: "!p-5" })) : !ads?.length ? (_jsx(EmptyState, { title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0625\u0639\u0644\u0627\u0646\u0627\u062A", description: "\u0623\u0636\u0641 \u0623\u0648\u0644 \u0625\u0639\u0644\u0627\u0646 \u0644\u064A\u0638\u0647\u0631 \u0641\u064A \u0627\u0644\u0642\u0633\u0645 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u064A \u0639\u0644\u0649 \u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629." })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: ads.map((ad) => {
                    const expired = isExpired(ad);
                    return (_jsxs(Card, { className: cn('overflow-hidden', (expired || !ad.is_active) && 'opacity-60'), children: [ad.image ? (_jsxs("div", { className: "relative h-28 w-full bg-subtle-strong", children: [_jsx("img", { src: getPublicUrl(ad.image) ?? undefined, alt: ad.title, className: "h-full w-full object-cover" }), _jsx("span", { className: "absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white", children: ad.placement === 'home' ? 'الرئيسية' : 'من نحن' })] })) : (_jsx("div", { className: "flex h-28 items-center justify-center bg-primary-light/40", children: _jsx(Megaphone, { className: "size-8 text-primary/60" }) })), _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("p", { className: "font-black text-ink", children: ad.title }), _jsx("span", { className: cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', expired ? 'bg-wine-soft text-error' : ad.is_active ? 'bg-emerald-50 text-success' : 'bg-subtle-strong text-muted'), children: expired ? 'منتهي' : ad.is_active ? 'مفعّل' : 'معطّل' })] }), ad.description && _jsx("p", { className: "mt-1 line-clamp-2 text-xs text-muted", children: ad.description }), ad.link && (_jsxs("p", { className: "mt-1.5 flex items-center gap-1 text-[11px] text-primary", dir: "ltr", children: [_jsx(Link2, { className: "size-3 shrink-0" }), ad.link.slice(0, 40), ad.link.length > 40 ? '…' : ''] })), ad.expires_at && (_jsxs("p", { className: cn('mt-1.5 text-[11px] font-bold', expired ? 'text-error' : 'text-muted'), dir: "ltr", children: ["\u064A\u0646\u062A\u0647\u064A: ", new Date(ad.expires_at).toLocaleString('ar-SY')] })), _jsxs("div", { className: "mt-3 flex items-center justify-between", children: [_jsxs("span", { className: "text-xs text-muted", children: [ad.clicks ?? 0, " \u0646\u0642\u0631\u0629"] }), _jsxs("div", { className: "flex gap-1.5", children: [_jsx("button", { onClick: () => setEditing({ ...ad }), className: "flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border text-muted hover:border-primary hover:text-primary", children: _jsx(Pencil, { className: "size-3.5" }) }), _jsx("button", { onClick: () => setDeleting(ad), className: "flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border text-muted hover:border-error hover:text-error", children: _jsx(Trash2, { className: "size-3.5" }) })] })] })] })] }, ad.id));
                }) })), editing !== null && (_jsx(AdForm, { values: editing, onClose: () => setEditing(null), onDone: () => { setEditing(null); void qc.invalidateQueries({ queryKey: ['admin-ads'] }); } })), _jsx(ConfirmDialog, { open: deleting !== null, onClose: () => setDeleting(null), onConfirm: () => deleting && del.mutate(deleting), title: "\u062D\u0630\u0641 \u0627\u0644\u0625\u0639\u0644\u0627\u0646", message: "\u062A\u0623\u0643\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u061F", loading: del.isPending })] }));
}
function AdForm({ values, onClose, onDone }) {
    const [form, setForm] = useState({ title: '', description: '', link: '', placement: 'home', image: '', expires_at: '', is_active: true, sort_order: 0, ...values });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const toast = useToast();
    const isEdit = Boolean(values.id);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const pickImage = async (file) => {
        if (!file)
            return;
        setUploading(true);
        try {
            const compressed = await compressImage(file);
            const path = await uploadToFolder('ads', compressed);
            if (path) {
                if (form.image && !String(form.image).startsWith('http') && !String(form.image).startsWith('/'))
                    await deleteImage(String(form.image));
                set('image', path);
                toast.show('تم رفع الصورة');
            }
        }
        catch {
            toast.show('تعذر رفع الصورة', 'error');
        }
        finally {
            setUploading(false);
        }
    };
    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            title: String(form.title).trim(),
            description: String(form.description ?? '').trim() || null,
            link: String(form.link ?? '').trim() || null,
            placement: String(form.placement),
            image: String(form.image ?? '') || null,
            is_active: Boolean(form.is_active),
            expires_at: form.expires_at ? new Date(String(form.expires_at)).toISOString() : null,
            sort_order: Number(form.sort_order ?? 0) || 0,
        };
        const ok = isEdit
            ? await updateAd(String(values.id), payload)
            : await createAd(payload);
        setSaving(false);
        if (!ok) {
            toast.show('تعذر الحفظ', 'error');
            return;
        }
        toast.show(isEdit ? 'تم التحديث' : 'تمت الإضافة');
        onDone();
    };
    return (_jsx(Dialog, { open: true, onClose: onClose, title: isEdit ? 'تعديل الإعلان' : 'إعلان جديد', size: "md", children: _jsxs("form", { onSubmit: submit, className: "space-y-5", children: [_jsx(Field, { label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", required: true, children: _jsx(Input, { value: String(form.title), onChange: (e) => set('title', e.target.value), required: true, placeholder: "\u0645\u062B\u0627\u0644: \u0625\u0639\u0644\u0627\u0646 \u0639\u064A\u0627\u062F\u0629 \u062C\u062F\u064A\u062F\u0629" }) }), _jsx(Field, { label: "\u0627\u0644\u0648\u0635\u0641", children: _jsx(Textarea, { rows: 2, value: String(form.description ?? ''), onChange: (e) => set('description', e.target.value) }) }), _jsx(Field, { label: "\u0627\u0644\u0631\u0627\u0628\u0637", hint: "\u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u064A\u0641\u062A\u062D \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0641\u064A \u0646\u0627\u0641\u0630\u0629 \u062C\u062F\u064A\u062F\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)", children: _jsx(Input, { type: "url", value: String(form.link ?? ''), onChange: (e) => set('link', e.target.value), placeholder: "https://\u2026", dir: "ltr" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Field, { label: "\u0627\u0644\u0645\u0643\u0627\u0646", children: _jsxs(Select, { value: String(form.placement), onChange: (e) => set('placement', e.target.value), children: [_jsx("option", { value: "home", children: "\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629" }), _jsx("option", { value: "about", children: "\u0635\u0641\u062D\u0629 \u0645\u0646 \u0646\u062D\u0646" })] }) }), _jsx(Field, { label: "\u0627\u0644\u062A\u0631\u062A\u064A\u0628", children: _jsx(Input, { type: "number", value: String(form.sort_order ?? 0), onChange: (e) => set('sort_order', e.target.value) }) })] }), _jsxs(Field, { label: "\u0635\u0648\u0631\u0629 \u0627\u0644\u063A\u0644\u0627\u0641", children: [_jsx("input", { type: "file", accept: "image/*", onChange: (e) => void pickImage(e.target.files?.[0]), className: "block w-full cursor-pointer rounded-xl border border-dashed border-border bg-subtle p-3 text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" }), uploading && _jsx("p", { className: "mt-1 text-xs text-muted", children: "\u062C\u0627\u0631\u064D \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629\u2026" }), form.image ? (_jsxs("a", { href: getPublicUrl(String(form.image)) ?? '#', target: "_blank", rel: "noopener noreferrer", className: "mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline", children: [_jsx(Eye, { className: "size-3.5" }), " \u0645\u0639\u0627\u064A\u0646\u0629 \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629"] })) : null] }), _jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-sm text-ink", children: [_jsx("input", { type: "checkbox", checked: Boolean(form.is_active), onChange: (e) => set('is_active', e.target.checked), className: "size-4 accent-primary" }), "\u0645\u0641\u0639\u0651\u0644 (\u064A\u0638\u0647\u0631 \u0644\u0644\u0632\u0648\u0627\u0631)"] }), _jsx(Field, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621", hint: "\u0627\u062A\u0631\u0643\u0647 \u0641\u0627\u0631\u063A\u0627\u064B \u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0625\u0639\u0644\u0627\u0646 \u062F\u0627\u0626\u0645\u0627\u064B \u2014 \u0628\u0639\u062F \u0647\u0630\u0627 \u0627\u0644\u062A\u0627\u0631\u064A\u062E \u064A\u062E\u062A\u0641\u064A \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B", children: _jsx("input", { type: "datetime-local", value: String(form.expires_at ?? '').replace('Z', '').slice(0, 16), onChange: (e) => set('expires_at', e.target.value), className: "h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15", dir: "ltr" }) }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "submit", loading: saving, className: "flex-1", children: isEdit ? 'حفظ' : 'إضافة' }), _jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "\u0625\u0644\u063A\u0627\u0621" })] })] }) }));
}
