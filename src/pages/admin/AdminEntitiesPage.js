import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, ExternalLink, Eye, EyeOff, Upload, X, Star, Gift, Copy, Check, MessageCircle, KeyRound, Sparkles, } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { compressImage, deleteImage, updateEntity, startDoctorTrial, ensureEntityAccount } from '@/services/admin';
import { uploadImage } from '@/services/admin';
import { Input, Select, Textarea, Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import { Skeletons, EmptyState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { cn, slugify, planExpiryFromNow } from '@/lib/utils';
import { enumValues, ENTITY_META } from '@/features/admin/entityMeta';
export function AdminEntitiesPage({ table }) {
    const meta = useMemo(() => ENTITY_META[table] ?? ENTITY_META[Object.keys(ENTITY_META)[0]], [table]);
    const dataType = meta.type;
    return _jsx(AdminEntityContent, { table: table, meta: meta, dataType: dataType }, table);
}
function AdminEntityContent({ table, meta, dataType }) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [trial, setTrial] = useState(null);
    const [creds, setCreds] = useState(null);
    const qc = useQueryClient();
    const toast = useToast();
    const PAGE_SIZE = 10;
    const { data, isLoading } = useQuery({
        queryKey: ['admin-entities', table, search, page],
        queryFn: async () => {
            let q = supabase.from(table).select('*', { count: 'exact' });
            if (search)
                q = q.ilike('name', `%${search}%`);
            q = q.order('sort_order').order('created_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
            const { data, count } = await q;
            return { data: (data ?? []), count: count ?? 0 };
        },
    });
    const deleteMut = useMutation({
        mutationFn: async (row) => {
            const images = row.images ?? [];
            const gallery = row.gallery ?? [];
            await Promise.all([...images, ...gallery, row.image].filter(Boolean).map((p) => deleteImage(p)));
            const { error } = await supabase.from(table).delete().eq('id', String(row.id));
            if (error)
                throw error;
        },
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['admin-entities', table] });
            void qc.invalidateQueries({ queryKey: ['entities'] });
            toast.show('تم الحذف بنجاح');
            setDeleting(null);
        },
        onError: () => toast.show('تعذر الحذف', 'error'),
    });
    const trialMut = useMutation({
        mutationFn: async ({ id, plan }) => {
            const res = await startDoctorTrial(id, plan);
            if (!res || res.error || !res.ok)
                throw new Error(res?.error ?? 'تعذر تفعيل التجربة');
            return res;
        },
        onSuccess: (res) => {
            void qc.invalidateQueries({ queryKey: ['admin-entities', table] });
            void qc.invalidateQueries({ queryKey: ['entities'] });
            toast.show('تم تفعيل/تمديد التجربة شهراً كاملاً');
            setTrial({ row: trial.row, result: res });
        },
        onError: (e) => toast.show(e.message || 'تعذر تفعيل التجربة', 'error'),
    });
    const credMut = useMutation({
        mutationFn: async (row) => {
            const res = await ensureEntityAccount(dataType, String(row.id));
            if (res.accountError)
                throw new Error(res.accountError);
            return res;
        },
        onSuccess: (res) => {
            toast.show('تم توليد بيانات دخول جديدة');
            setCreds((prev) => prev ? { row: { ...prev.row, __creds: res }, result: res } : null);
        },
        onError: (e) => toast.show(e.message || 'تعذر توليد البيانات', 'error'),
    });
    const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-black text-ink", children: ["\u0625\u062F\u0627\u0631\u0629 ", meta.label] }), _jsxs("p", { className: "mt-0.5 text-sm text-muted", children: [data?.count ?? '…', " \u0633\u062C\u0644 \u0641\u064A \u0627\u0644\u062F\u0644\u064A\u0644"] })] }), _jsxs(Button, { size: "md", onClick: () => setEditing({}), children: [_jsx(Plus, { className: "size-4.5" }), "\u0625\u0636\u0627\u0641\u0629 \u062C\u062F\u064A\u062F"] })] }), _jsxs("div", { className: "relative max-w-sm", children: [_jsx(Search, { className: "absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" }), _jsx(Input, { value: search, onChange: (e) => { setSearch(e.target.value); setPage(1); }, placeholder: "\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645\u2026", className: "pr-11" })] }), isLoading ? (_jsx(Skeletons, { rows: 6 })) : !data?.data.length ? (_jsx(EmptyState, { title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0633\u062C\u0644\u0627\u062A", description: search ? 'جرّب كلمة بحث أخرى.' : 'ابدأ بإضافة أول سجل في الدليل.' })) : (_jsxs(_Fragment, { children: [_jsx(Card, { className: "overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[720px] text-right text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border bg-subtle text-xs font-black text-muted", children: [_jsx("th", { className: "px-5 py-3.5", children: "\u0627\u0644\u0627\u0633\u0645" }), _jsx("th", { className: "px-5 py-3.5", children: "\u0627\u0644\u0627\u062E\u062A\u0635\u0627\u0635" }), _jsx("th", { className: "px-5 py-3.5", children: "\u0627\u0644\u0647\u0627\u062A\u0641" }), _jsx("th", { className: "px-5 py-3.5", children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx("th", { className: "px-5 py-3.5", children: "\u0627\u0644\u0628\u0627\u0642\u0629" }), _jsx("th", { className: "px-5 py-3.5 text-left", children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx("tbody", { className: "divide-y divide-border", children: data.data.map((row) => (_jsxs("tr", { className: "transition-colors hover:bg-subtle/70", children: [_jsx("td", { className: "px-5 py-3.5", children: _jsxs("div", { className: "flex items-center gap-3", children: [row.image ? (_jsx("img", { src: supabase.storage.from('medical').getPublicUrl(String(row.image)).data.publicUrl, alt: "", className: "size-10 rounded-xl object-cover" })) : (_jsx("div", { className: "flex size-10 items-center justify-center rounded-xl bg-primary-light text-primary-dark text-xs font-black", children: String(row.name ?? '؟').slice(0, 1) })), _jsxs("div", { children: [_jsx("p", { className: "font-bold text-ink", children: String(row.name ?? '') }), _jsxs(Link, { to: `/${meta.publicRoute}/${row.slug ?? row.id}`, target: "_blank", className: "flex items-center gap-1 text-[11px] text-muted hover:text-primary", children: ["\u0639\u0631\u0636 \u0627\u0644\u0635\u0641\u062D\u0629 ", _jsx(ExternalLink, { className: "size-3" })] })] })] }) }), _jsx("td", { className: "px-5 py-3.5 text-muted", children: String(row.specialty ?? '—') }), _jsx("td", { className: "px-5 py-3.5 text-muted", dir: "ltr", children: String(row.phone ?? '—') }), _jsx("td", { className: "px-5 py-3.5", children: _jsx("span", { className: cn('rounded-full px-2.5 py-1 text-[11px] font-bold', row.is_active ? 'bg-emerald-50 text-success' : 'bg-subtle-strong text-muted'), children: row.is_active ? 'مفعّل' : 'مخفّي' }) }), _jsx("td", { className: "px-5 py-3.5", children: _jsx(PlanToggle, { table: table, row: row }) }), _jsx("td", { className: "px-5 py-3.5", children: _jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [table === 'doctors' && (_jsx("button", { onClick: () => setTrial({ row }), title: "\u062A\u0641\u0639\u064A\u0644/\u062A\u0645\u062F\u064A\u062F \u062A\u062C\u0631\u0628\u0629 \u0634\u0647\u0631 \u0643\u0627\u0645\u0644 + \u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u062C\u062F\u064A\u062F\u0629 \u0644\u0644\u0648\u062D\u0629", className: "flex size-9 items-center justify-center rounded-xl border border-gold/40 bg-gold-soft text-gold-dark transition hover:border-gold hover:bg-gold hover:text-primary-dark cursor-pointer", children: _jsx(Gift, { className: "size-4" }) })), table === 'doctors' && String(row.plan ?? 'free') !== 'free' && Boolean(row.plan_expires_at && new Date(String(row.plan_expires_at)) > new Date()) && (_jsx("button", { onClick: () => setCreds({ row }), title: "\u062A\u0648\u0644\u064A\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u0644\u0648\u062D\u0629 \u0627\u0644\u0637\u0628\u064A\u0628 \u0648\u0625\u0631\u0633\u0627\u0644\u0647\u0627", className: "flex size-9 items-center justify-center rounded-xl border border-primary/30 bg-primary-light text-primary-dark transition hover:border-primary hover:bg-primary hover:text-white cursor-pointer", children: _jsx(KeyRound, { className: "size-4" }) })), (table === 'doctors' || table === 'pharmacies') && (_jsx("button", { onClick: () => void (async () => {
                                                                    const ok = await toggleFeatured(table, String(row.id), Boolean(row.is_featured));
                                                                    if (ok) {
                                                                        await qc.invalidateQueries({ queryKey: ['admin-entities', table] });
                                                                        await qc.invalidateQueries({ queryKey: ['entities'] });
                                                                        await qc.invalidateQueries({ queryKey: ['featured-doctors'] });
                                                                        await qc.invalidateQueries({ queryKey: ['featured-pharmacies'] });
                                                                        toast.show(row.is_featured ? 'أُزيل من المميّزين' : 'أُضيف إلى المميّزين');
                                                                    }
                                                                    else {
                                                                        toast.show('تعذر تحديث الحالة', 'error');
                                                                    }
                                                                })(), title: row.is_featured ? 'إزالة من المميزين' : 'إضافة إلى المميزين', className: `flex size-9 items-center justify-center rounded-xl border transition cursor-pointer ${row.is_featured ? 'border-gold bg-gold-soft text-gold-dark' : 'border-border text-muted hover:border-gold hover:text-gold-dark'}`, children: _jsx(Star, { className: `size-4 ${row.is_featured ? 'fill-gold' : ''}` }) })), _jsx("button", { onClick: () => setEditing({ ...row }), title: "\u062A\u0639\u062F\u064A\u0644", className: "flex size-9 items-center justify-center rounded-xl border border-border text-muted transition hover:border-primary hover:text-primary cursor-pointer", children: _jsx(Pencil, { className: "size-4" }) }), _jsx("button", { onClick: () => setDeleting(row), title: "\u062D\u0630\u0641", className: "flex size-9 items-center justify-center rounded-xl border border-border text-muted transition hover:border-error hover:text-error cursor-pointer", children: _jsx(Trash2, { className: "size-4" }) })] }) })] }, String(row.id)))) })] }) }) }), _jsx(Pagination, { page: page, totalPages: totalPages, onChange: setPage })] })), editing !== null && (_jsx(EntityForm, { table: table, meta: meta, dataType: dataType, values: editing, onClose: () => setEditing(null), onDone: () => {
                    setEditing(null);
                    void qc.invalidateQueries({ queryKey: ['admin-entities', table] });
                    void qc.invalidateQueries({ queryKey: ['entities'] });
                } })), trial !== null && (_jsx(Dialog, { open: true, onClose: () => setTrial(null), title: "\u062A\u062C\u0631\u0628\u0629 \u0634\u0647\u0631 \u0645\u062C\u0627\u0646\u064A \u2014 \u0643\u0627\u0645\u0644\u0629 \u0627\u0644\u0645\u0632\u0627\u064A\u0627", size: "md", children: trial.result ? (_jsx(TrialCredsView, { result: trial.result, phone: String(trial.row.phone ?? ''), onDone: () => setTrial(null) })) : (_jsx(TrialConfirmForm, { name: String(trial.row.name ?? ''), loading: trialMut.isPending, onConfirm: (plan) => trialMut.mutate({ id: String(trial.row.id), plan }) })) })), creds !== null && (_jsx(Dialog, { open: true, onClose: () => setCreds(null), title: "\u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u0644\u0648\u062D\u0629 \u0627\u0644\u0637\u0628\u064A\u0628", size: "md", children: _jsx(EntityCredsView, { row: creds.row, loading: credMut.isPending, hasResult: Boolean(creds.result && !creds.result.accountError), onGenerate: () => credMut.mutate(creds.row), onDone: () => setCreds(null) }) })), _jsx(ConfirmDialog, { open: deleting !== null, onClose: () => setDeleting(null), onConfirm: () => deleting && deleteMut.mutate(deleting), title: "\u062D\u0630\u0641 \u0627\u0644\u0633\u062C\u0644", message: `هل أنت متأكد من حذف «${String(deleting?.name ?? '')}»؟ لا يمكن التراجع عن هذا الإجراء.`, loading: deleteMut.isPending })] }));
}
async function toggleFeatured(table, id, current) {
    const { error } = await supabase.from(table).update({ is_featured: !current }).eq('id', id);
    return !error;
}
function PlanToggle({ table, row }) {
    const qc = useQueryClient();
    const current = String(row.plan ?? 'free');
    return (_jsxs("select", { value: current, onChange: async (e) => {
            const plan = e.target.value;
            // تفعيل الباقة لمدة شهر من الآن، والرجوع للمجانية يلغي تاريخ الانتهاء
            await updateEntity(table, String(row.id), {
                plan,
                plan_expires_at: plan === 'free' ? null : planExpiryFromNow(),
            });
            void qc.invalidateQueries({ queryKey: ['admin-entities', table] });
        }, className: cn('cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-bold outline-none', current === 'free' && 'border-border bg-subtle text-muted', current === 'pro' && 'border-primary/30 bg-primary-light text-primary-dark', current === 'gold' && 'border-gold bg-gold-soft text-gold-dark'), children: [_jsx("option", { value: "free", children: "\u0645\u062C\u0627\u0646\u064A" }), _jsx("option", { value: "pro", children: "\u0627\u062D\u062A\u0631\u0627\u0641\u064A" }), _jsx("option", { value: "gold", children: "\u0630\u0647\u0628\u064A" })] }));
}
function EntityForm({ table, meta, dataType, values, onClose, onDone }) {
    const [form, setForm] = useState(() => ({ ...values }));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const toast = useToast();
    const qc = useQueryClient();
    const isEdit = Boolean(values.id);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const linesOf = (v) => String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!String(form.name ?? '').trim()) {
            setError('الاسم مطلوب');
            return;
        }
        setSaving(true);
        const payload = {
            name: String(form.name ?? '').trim(),
            slug: String(form.slug ?? '').trim() || slugify(String(form.name ?? '')),
            description: String(form.description ?? '').trim() || null,
            phone: String(form.phone ?? '').trim() || null,
            whatsapp: String(form.whatsapp ?? '').trim() || null,
            facebook: String(form.facebook ?? '').trim() || null,
            instagram: String(form.instagram ?? '').trim() || null,
            address: String(form.address ?? '').trim() || null,
            lat: form.lat ? Number(form.lat) : null,
            lng: form.lng ? Number(form.lng) : null,
            is_verified: Boolean(form.is_verified),
            is_active: Boolean(form.is_active),
            is_featured: dataType === 'doctor' || dataType === 'pharmacy' ? Boolean(form.is_featured) : undefined,
            is_featured_placeholder: undefined,
            is_active_placeholder: undefined,
            image: form.image ? String(form.image) : null,
            plan: String(form.plan ?? 'free'),
            updated_at: new Date().toISOString(),
        };
        delete payload.is_active_placeholder;
        delete payload.is_featured_placeholder;
        const compact = (m) => { if (form[m] !== undefined)
            payload[m] = linesOf(form[m]); };
        const single = (m) => { if (form[m] !== undefined)
            payload[m] = String(form[m] ?? '').trim() || null; };
        // قوائم الصور تُخزَّن كمصفوفة مسارات مباشرة (وليس نصاً مفصولاً بأسطر)
        const arrays = (m) => {
            if (form[m] !== undefined) {
                const v = form[m];
                payload[m] = Array.isArray(v) ? v.filter(Boolean) : linesOf(v);
            }
        };
        arrays('images');
        arrays('gallery');
        if (dataType === 'doctor') {
            set('specialty', form.specialty ?? '');
            payload.specialty = String(form.specialty ?? '') || null;
            payload.gender = String(form.gender ?? '') || null;
            payload.experience_years = form.experience_years ? Number(form.experience_years) : null;
            payload.bio = String(form.bio ?? '').trim() || null;
            compact('certifications');
            compact('services');
            single('video_url');
        }
        else if (dataType === 'clinic' || dataType === 'hospital' || dataType === 'health_center') {
            payload.specialty = String(form.specialty ?? '') || null;
            compact('services');
            compact('departments');
            if (dataType === 'hospital')
                single('emergency_phone');
        }
        else if (dataType === 'pharmacy') {
            compact('services');
            single('opening_hours');
        }
        else if (dataType === 'lab') {
            compact('services');
            compact('tests');
            single('opening_hours');
        }
        else if (dataType === 'radiology') {
            compact('services');
            compact('machines');
            single('opening_hours');
        }
        const workHours = getWorkHours(form);
        if (workHours)
            payload.work_hours = workHours;
        // تفعيل مدة الباقة: عند تغيير الباقة تُحدد لمدة شهر من الآن، والرجوع للمجانية يلغي تاريخ الانتهاء
        const prevPlan = String(values.plan ?? 'free');
        const nextPlan = String(form.plan ?? 'free');
        if (nextPlan !== prevPlan) {
            payload.plan_expires_at = nextPlan === 'free' ? null : planExpiryFromNow();
        }
        let result;
        if (isEdit) {
            result = await supabase.from(table).update(payload).eq('id', String(values.id)).select().single();
        }
        else {
            payload.created_at = new Date().toISOString();
            payload.sort_order = Math.floor(Date.now() / 1000);
            result = await supabase.from(table).insert(payload).select().single();
        }
        setSaving(false);
        if (result.error) {
            setError(result.error.message);
            return;
        }
        await qc.invalidateQueries({ queryKey: ['entities'] });
        toast.show(isEdit ? 'تم حفظ التعديلات' : 'تمت الإضافة بنجاح');
        onDone();
    };
    const upload = async (files, target) => {
        if (!files?.length)
            return;
        setSaving(true);
        try {
            const type = meta.type;
            for (const f of Array.from(files)) {
                const compressed = await compressImage(f);
                const path = await uploadImage(type, compressed);
                if (target === 'image')
                    set('image', path);
                else if (target === 'images')
                    set('images', [...(form.images ?? []), path]);
                else
                    set('gallery', [...(form.gallery ?? []), path]);
            }
            toast.show('تم رفع الصورة');
        }
        catch {
            toast.show('تعذر رفع الصورة', 'error');
        }
        finally {
            setSaving(false);
        }
    };
    const removeImage = (target, path) => {
        if (target === 'image') {
            void deleteImage(form.image);
            set('image', null);
        }
        else {
            const list = (form[target] ?? []).filter((p) => p !== path);
            set(target, list);
            void deleteImage(path);
        }
    };
    const imgUrl = (p) => p && !p.startsWith('http') ? supabase.storage.from('medical').getPublicUrl(p).data.publicUrl : (p ?? undefined);
    return (_jsx(Dialog, { open: true, onClose: onClose, title: isEdit ? `تعديل: ${String(values.name ?? '')}` : `إضافة ${meta.label}`, size: "xl", children: _jsxs("form", { onSubmit: submit, className: "space-y-6", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "\u0627\u0644\u0627\u0633\u0645", required: true, children: _jsx(Input, { value: String(form.name ?? ''), onChange: (e) => set('name', e.target.value), required: true }) }), (dataType === 'doctor' || dataType === 'clinic') && (_jsxs(Field, { label: "\u0627\u0644\u0627\u062E\u062A\u0635\u0627\u0635", hint: "\u0627\u062E\u062A\u0631 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u0633\u062F\u0644\u0629 \u0623\u0648 \u0627\u0643\u062A\u0628 \u0627\u062E\u062A\u0635\u0627\u0635\u0627\u064B \u062C\u062F\u064A\u062F\u0627\u064B \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F", children: [_jsx(Input, { list: "specialty-suggestions", value: String(form.specialty ?? ''), onChange: (e) => set('specialty', e.target.value), placeholder: "\u0645\u062B\u0627\u0644: \u0642\u0644\u0628\u064A\u0629\u060C \u0639\u0638\u0627\u0645\u060C \u062C\u0647\u0627\u0632 \u0647\u0636\u0645\u064A\u2026" }), _jsx("datalist", { id: "specialty-suggestions", children: enumValues.specialties.map((s) => _jsx("option", { value: s }, s)) })] })), _jsx(Field, { label: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", children: _jsx(Input, { value: String(form.phone ?? ''), onChange: (e) => set('phone', e.target.value), placeholder: "09xx xxx xxx", dir: "ltr" }) }), _jsx(Field, { label: "\u0648\u0627\u062A\u0633\u0627\u0628", children: _jsx(Input, { value: String(form.whatsapp ?? ''), onChange: (e) => set('whatsapp', e.target.value), placeholder: "09xx xxx xxx", dir: "ltr" }) }), _jsx(Field, { label: "\u0641\u064A\u0633\u0628\u0648\u0643 (\u0631\u0627\u0628\u0637)", children: _jsx(Input, { value: String(form.facebook ?? ''), onChange: (e) => set('facebook', e.target.value), placeholder: "https://facebook.com/...", dir: "ltr" }) }), _jsx(Field, { label: "\u0627\u0646\u0633\u062A\u063A\u0631\u0627\u0645 (\u0631\u0627\u0628\u0637)", children: _jsx(Input, { value: String(form.instagram ?? ''), onChange: (e) => set('instagram', e.target.value), placeholder: "https://instagram.com/...", dir: "ltr" }) }), dataType === 'hospital' && (_jsx(Field, { label: "\u0631\u0642\u0645 \u0627\u0644\u0637\u0648\u0627\u0631\u0626", children: _jsx(Input, { value: String(form.emergency_phone ?? ''), onChange: (e) => set('emergency_phone', e.target.value), dir: "ltr" }) })), _jsx(Field, { label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", children: _jsx(Input, { value: String(form.address ?? ''), onChange: (e) => set('address', e.target.value) }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Field, { label: "\u062E\u0637 \u0627\u0644\u0639\u0631\u0636 (Lat)", children: _jsx(Input, { type: "number", step: "any", value: String(form.lat ?? ''), onChange: (e) => set('lat', e.target.value), dir: "ltr" }) }), _jsx(Field, { label: "\u062E\u0637 \u0627\u0644\u0637\u0648\u0644 (Lng)", children: _jsx(Input, { type: "number", step: "any", value: String(form.lng ?? ''), onChange: (e) => set('lng', e.target.value), dir: "ltr" }) })] }), dataType === 'doctor' && (_jsxs(_Fragment, { children: [_jsx(Field, { label: "\u0633\u0646\u0648\u0627\u062A \u0627\u0644\u062E\u0628\u0631\u0629", children: _jsx(Input, { type: "number", value: String(form.experience_years ?? ''), onChange: (e) => set('experience_years', e.target.value) }) }), _jsx(Field, { label: "\u0627\u0644\u062C\u0646\u0633", children: _jsxs(Select, { value: String(form.gender ?? ''), onChange: (e) => set('gender', e.target.value), children: [_jsx("option", { value: "", children: "\u2014 \u0628\u062F\u0648\u0646 \u2014" }), _jsx("option", { value: "male", children: "\u0630\u0643\u0631" }), _jsx("option", { value: "female", children: "\u0623\u0646\u062B\u0649" })] }) })] })), _jsx(Field, { label: "\u0627\u0644\u0628\u0627\u0642\u0629", children: _jsxs(Select, { value: String(form.plan ?? 'free'), onChange: (e) => set('plan', e.target.value), children: [_jsx("option", { value: "free", children: "\u0645\u062C\u0627\u0646\u064A\u0629" }), _jsx("option", { value: "pro", children: "\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629" }), _jsx("option", { value: "gold", children: "\u0630\u0647\u0628\u064A\u0629" })] }) })] }), _jsx(Field, { label: "\u0627\u0644\u0648\u0635\u0641 / \u0627\u0644\u0646\u0628\u0630\u0629", children: _jsx(Textarea, { rows: 4, value: String(form.description ?? form.bio ?? ''), onChange: (e) => { set('description', e.target.value); set('bio', e.target.value); } }) }), dataType === 'doctor' && (_jsx(Field, { label: "\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A (\u0643\u0644 \u0634\u0647\u0627\u062F\u0629 \u0641\u064A \u0633\u0637\u0631)", children: _jsx(Textarea, { rows: 3, value: String(form.certifications ?? '').split('|').join('\n'), onChange: (e) => set('certifications', e.target.value) }) })), (dataType === 'clinic' || dataType === 'hospital' || dataType === 'health_center' || dataType === 'lab' || dataType === 'radiology' || dataType === 'pharmacy') && (_jsx(Field, { label: dataType === 'hospital' || dataType === 'health_center' ? 'الأقسام (كل قسم في سطر)' : dataType === 'pharmacy' ? 'الخدمات (كل خدمة في سطر)' : 'الخدمات (كل خدمة في سطر)', children: _jsx(Textarea, { rows: 3, value: String(form.departments ?? form.services ?? '').split('|').join('\n'), onChange: (e) => {
                            set('departments', e.target.value);
                            set('services', e.target.value);
                        } }) })), dataType === 'lab' && (_jsx(Field, { label: "\u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 (\u0643\u0644 \u062A\u062D\u0644\u064A\u0644 \u0641\u064A \u0633\u0637\u0631)", children: _jsx(Textarea, { rows: 3, value: String(form.tests ?? ''), onChange: (e) => set('tests', e.target.value) }) })), dataType === 'radiology' && (_jsx(Field, { label: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629 (\u0643\u0644 \u062C\u0647\u0627\u0632 \u0641\u064A \u0633\u0637\u0631)", children: _jsx(Textarea, { rows: 3, value: String(form.machines ?? ''), onChange: (e) => set('machines', e.target.value) }) })), _jsx(Field, { label: "\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0645", children: _jsx(WorkHoursEditor, { value: form.work_hours, onChange: (wh) => set('work_hours', wh) }) }), dataType === 'doctor' && (_jsx(Field, { label: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0641\u064A\u062F\u064A\u0648 \u0627\u0644\u062A\u0639\u0631\u064A\u0641\u064A (YouTube)", children: _jsx(Input, { value: String(form.video_url ?? ''), onChange: (e) => set('video_url', e.target.value), dir: "ltr", placeholder: "https://www.youtube.com/embed/\u2026" }) })), _jsx(ImageUploader, { label: "\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", paths: form.image ? [form.image] : [], onUpload: (f) => void upload(f, 'image'), onRemove: () => removeImage('image'), imgUrl: imgUrl }), _jsx(ImageUploader, { label: "\u0645\u0639\u0631\u0636 \u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u0625\u0636\u0627\u0641\u064A", paths: (form.images ?? []).concat(form.gallery ?? []), onUpload: (f) => void upload(f, dataType === 'doctor' ? 'gallery' : 'images'), onRemove: (p) => removeImage(dataType === 'doctor' ? 'gallery' : 'images', p), imgUrl: imgUrl, multiple: true }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("label", { className: cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition', form.is_verified ? 'border-primary bg-primary-light/50 text-primary-dark' : 'border-border text-muted hover:border-primary/40'), children: [_jsx("input", { type: "checkbox", className: "hidden", checked: Boolean(form.is_verified), onChange: (e) => set('is_verified', e.target.checked) }), form.is_verified ? _jsx(Eye, { className: "size-4" }) : _jsx(EyeOff, { className: "size-4" }), "\u0645\u0648\u062B\u0651\u0642"] }), _jsxs("label", { className: cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition', form.is_active ? 'border-primary bg-primary-light/50 text-primary-dark' : 'border-border text-muted hover:border-primary/40'), children: [_jsx("input", { type: "checkbox", className: "hidden", checked: Boolean(form.is_active), onChange: (e) => set('is_active', e.target.checked) }), form.is_active ? _jsx(Eye, { className: "size-4" }) : _jsx(EyeOff, { className: "size-4" }), "\u0645\u0641\u0639\u0651\u0644"] }), (dataType === 'doctor' || dataType === 'pharmacy') && (_jsxs("label", { className: cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition', form.is_featured ? 'border-gold bg-gold-soft text-gold-dark' : 'border-border text-muted hover:border-gold/60'), children: [_jsx("input", { type: "checkbox", className: "hidden", checked: Boolean(form.is_featured), onChange: (e) => set('is_featured', e.target.checked) }), _jsx(Star, { className: `size-4 ${form.is_featured ? 'fill-gold' : ''}` }), "\u0645\u0645\u064A\u0651\u0632"] })), _jsxs("div", { className: "rounded-xl bg-subtle px-3 py-3 text-center text-xs font-bold text-muted", children: ["\u0639\u062F\u062F \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A: ", String(form.view_count ?? 0)] })] }), error && _jsx("p", { className: "rounded-xl bg-wine-soft px-3 py-2.5 text-xs font-semibold text-error", children: error }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx(Button, { type: "submit", loading: saving, className: "flex-1", children: isEdit ? 'حفظ التعديلات' : 'إضافة' }), _jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "\u0625\u0644\u063A\u0627\u0621" })] })] }) }));
}
function ImageUploader({ label, paths, onUpload, onRemove, imgUrl, multiple }) {
    return (_jsxs("div", { children: [_jsx("p", { className: "mb-2 text-sm font-semibold text-ink", children: label }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [paths.filter(Boolean).map((p) => (_jsxs("div", { className: "relative", children: [_jsx("img", { src: imgUrl(p), alt: "", className: "size-24 rounded-xl border border-border object-cover" }), _jsx("button", { type: "button", onClick: () => onRemove(p), className: "absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-full bg-error text-white shadow cursor-pointer", children: _jsx(X, { className: "size-3.5" }) })] }, p))), _jsxs("label", { className: "flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted transition hover:border-primary hover:text-primary", children: [_jsx(Upload, { className: "size-6" }), _jsx("span", { className: "text-[10px] font-bold", children: "\u0631\u0641\u0639 \u0635\u0648\u0631\u0629" }), _jsx("input", { type: "file", accept: "image/*", multiple: multiple, className: "hidden", onChange: (e) => onUpload(e.target.files) })] })] })] }));
}
function getWorkHours(form) {
    const wh = form.work_hours;
    if (wh && Object.keys(wh).length) {
        const cleaned = {};
        for (const [k, v] of Object.entries(wh)) {
            if (String(v ?? '').trim())
                cleaned[k] = String(v).trim();
        }
        return Object.keys(cleaned).length ? cleaned : null;
    }
    return null;
}
function WorkHoursEditor({ value, onChange }) {
    const days = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
    const names = { sat: 'السبت', sun: 'الأحد', mon: 'الاثنين', tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة' };
    const current = value ?? {};
    return (_jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: days.map((d) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-14 shrink-0 text-xs font-bold text-muted", children: names[d] }), _jsx(Input, { value: current[d] ?? '', placeholder: "9:00 - 17:00 \u0623\u0648 \u0645\u063A\u0644\u0642", onChange: (e) => onChange({ ...current, [d]: e.target.value }) })] }, d))) }));
}
function TrialConfirmForm({ name, loading, onConfirm }) {
    const [plan, setPlan] = useState('pro');
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "rounded-xl bg-gold-soft px-4 py-3 text-xs leading-6 text-gold-dark", children: ["\u0633\u062A\u064F\u0641\u0639\u064E\u0651\u0644 \u0644\u0644\u0637\u0628\u064A\u0628 ", _jsx("strong", { className: "text-ink", children: name }), " \u0628\u0627\u0642\u0629 \u0643\u0627\u0645\u0644\u0629 \u0644\u0645\u062F\u0629 ", _jsx("strong", { className: "text-ink", children: "\u0634\u0647\u0631 \u0648\u0627\u062D\u062F" }), " \u062A\u064F\u062D\u062A\u0633\u0628 \u0645\u0646 \u0627\u0644\u0622\u0646: \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0648\u0634\u0627\u0631\u0629 \u0627\u0644\u0628\u0627\u0642\u0629 \u0648\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0644\u0641 \u2014 ", _jsx("strong", { className: "text-ink", children: "\u062F\u0648\u0646 \u0634\u0627\u0631\u0629 \u00AB\u0645\u0645\u064A\u0651\u0632\u00BB \u0641\u064A \u0627\u0644\u0648\u0627\u062C\u0647\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629" }), ". \u0625\u0646 \u0643\u0627\u0646\u062A \u0644\u0647 \u062A\u062C\u0631\u0628\u0629 \u0633\u0627\u0628\u0642\u0629 \u0641\u0633\u062A\u064F\u0645\u062F\u064E\u0651\u062F \u0634\u0647\u0631\u0627\u064B \u062C\u062F\u064A\u062F\u0627\u064B \u0645\u0646 \u0627\u0644\u0622\u0646\u060C \u0648\u062A\u064F\u0646\u0634\u0623 \u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u0644\u0648\u062D\u062A\u0647 \u0641\u0648\u0631\u0627\u064B \u0644\u062A\u0633\u0644\u064A\u0645\u0647\u0627 \u0644\u0647."] }), _jsx(Field, { label: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629", children: _jsxs(Select, { value: plan, onChange: (e) => setPlan(e.target.value), children: [_jsx("option", { value: "pro", children: "\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629" }), _jsx("option", { value: "gold", children: "\u0630\u0647\u0628\u064A\u0629" })] }) }), _jsxs(Button, { loading: loading, className: "flex-1", onClick: () => onConfirm(plan), children: [_jsx(Gift, { className: "size-4" }), "\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062A\u062C\u0631\u0628\u0629 \u0648\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062D\u0633\u0627\u0628"] })] }));
}
function TrialCredsView({ result, phone, onDone }) {
    const toast = useToast();
    const [copied, setCopied] = useState(null);
    const magic = result.magic_token ? `${window.location.origin}/account/${result.slug}?tk=${encodeURIComponent(result.magic_token)}` : '';
    const message = `مرحباً ${result.name ?? ''}، تم تفعيل تجربة شهر مجاني كامل في دليل طيبة الإمام الطبي:\nرابط لوحة تحكمك: ${magic}\nالبريد: ${result.email ?? ''}\nكلمة السر: ${result.password ?? ''}\nتشمل: طلبات المواعيد وإدارة ملفك الكامل. بالتوفيق!`;
    const copy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setTimeout(() => setCopied(null), 1200);
        }
        catch {
            toast.show('تعذر النسخ', 'error');
        }
    };
    const wa = phone ? `https://wa.me/963${phone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(message)}` : '';
    const row = (label, value, key) => (_jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border border-border bg-subtle px-4 py-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-[11px] font-bold text-muted", children: label }), _jsx("p", { className: "mt-0.5 truncate text-sm font-bold text-ink", dir: "ltr", children: value })] }), _jsx("button", { onClick: () => void copy(value, key), className: "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:text-primary cursor-pointer", "aria-label": `نسخ ${label}`, children: copied === key ? _jsx(Check, { className: "size-4 text-success" }) : _jsx(Copy, { className: "size-4" }) })] }));
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-success", children: [_jsx(Sparkles, { className: "size-4" }), "\u062A\u0645 \u062A\u0641\u0639\u064A\u0644/\u062A\u0645\u062F\u064A\u062F \u062A\u062C\u0631\u0628\u0629 \u0634\u0647\u0631 \u0643\u0627\u0645\u0644 \u0644\u0640\u00AB", result.name, "\u00BB", result.times_activated && result.times_activated > 1 ? ` (التفعيل رقم ${result.times_activated})` : '', " \u0645\u0639 \u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u062C\u062F\u064A\u062F\u0629 \u0644\u0644\u0648\u062D\u0629."] }), _jsxs("div", { className: "space-y-3", children: [row('رابط الدخول المباشر للوحة', magic, 'link'), row('البريد الإلكتروني', result.email ?? '', 'email'), row('كلمة السر', result.password ?? '', 'pass')] }), _jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [wa && (_jsx(Button, { variant: "whatsapp", asChild: true, children: _jsxs("a", { href: wa, target: "_blank", rel: "noopener noreferrer", children: [_jsx(MessageCircle, { className: "size-4" }), " \u0625\u0631\u0633\u0627\u0644 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628"] }) })), _jsxs(Button, { variant: "secondary", onClick: () => void copy(message, 'all'), children: [copied === 'all' ? _jsx(Check, { className: "size-4" }) : _jsx(Copy, { className: "size-4" }), "\u0646\u0633\u062E \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0639\u0627\u064B"] })] }), _jsxs("p", { className: "flex items-start gap-1.5 text-[11px] leading-5 text-muted", children: [_jsx(KeyRound, { className: "mt-0.5 size-3.5 shrink-0 text-primary" }), "\u062A\u0646\u062A\u0647\u064A \u0627\u0644\u062A\u062C\u0631\u0628\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0628\u0639\u062F \u0634\u0647\u0631 \u2014 \u0648\u064A\u0645\u0643\u0646\u0643 \u0625\u0639\u0627\u062F\u0629 \u062A\u0641\u0639\u064A\u0644\u0647\u0627 \u0645\u0646 \u0632\u0631 \u0627\u0644\u0647\u062F\u064A\u0629 \uD83C\uDF81 \u0641\u064A \u0623\u064A \u0648\u0642\u062A\u060C \u0623\u0648 \u062A\u0648\u0644\u064A\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u062C\u062F\u064A\u062F\u0629 \u0645\u0646 \u0632\u0631 \u00AB\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644\u00BB \u062F\u0648\u0646 \u062A\u0645\u062F\u064A\u062F."] }), _jsx(Button, { variant: "outline", className: "w-full", onClick: onDone, children: "\u0625\u063A\u0644\u0627\u0642" })] }));
}
/** توليد/إعادة إرسال بيانات دخول لوحة طبيب لديه حساب فعّال (تجربة أو اشتراك) */
function EntityCredsView({ row, loading, hasResult, onGenerate, onDone }) {
    const [copied, setCopied] = useState(null);
    const toast = useToast();
    const result = hasResult ? row.__creds : undefined;
    const phone = String(row.phone ?? '');
    const magic = result?.linkToken && result?.slug
        ? `${window.location.origin}/account/${result.slug}?tk=${encodeURIComponent(result.linkToken)}`
        : '';
    const message = `مرحباً ${result?.name ?? String(row.name ?? '')}، بيانات دخول لوحة تحكمك في دليل طيبة الإمام الطبي:\nرابط الدخول المباشر: ${magic}\nالبريد: ${result?.email ?? ''}\nكلمة السر: ${result?.password ?? ''}\nيمكنك من اللوحة إدارة ملفك وساعات دوامك وطلبات المواعيد. بالتوفيق!`;
    const copy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setTimeout(() => setCopied(null), 1200);
        }
        catch {
            toast.show('تعذر النسخ', 'error');
        }
    };
    const wa = phone ? `https://wa.me/963${phone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(message)}` : '';
    if (!result) {
        return (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "rounded-xl bg-subtle px-4 py-3 text-xs leading-6 text-muted", children: ["\u0633\u064A\u062A\u0645 \u062A\u0648\u0644\u064A\u062F ", _jsx("strong", { className: "text-ink", children: "\u0643\u0644\u0645\u0629 \u0633\u0631 \u0648\u0631\u0627\u0628\u0637 \u062F\u062E\u0648\u0644 \u0633\u062D\u0631\u064A \u062C\u062F\u064A\u062F\u064A\u0646" }), " \u0644\u0644\u0637\u0628\u064A\u0628 ", _jsx("strong", { className: "text-ink", children: String(row.name ?? '') }), " \u2014 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0642\u062F\u064A\u0645\u0629 \u0644\u0645 \u062A\u0639\u062F \u0628\u062D\u0648\u0632\u062A\u0643 (\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631 \u0645\u062E\u0632\u0646\u0629 \u0645\u0634\u0641\u0631\u0629) \u0648\u0647\u0630\u0627 \u0627\u0644\u062A\u0648\u0644\u064A\u062F \u064A\u0639\u0637\u064A\u0643 \u0646\u0633\u062E\u0629 \u062C\u062F\u064A\u062F\u0629 \u0643\u0627\u0645\u0644\u0629 \u0644\u062A\u0633\u0644\u064A\u0645\u0647\u0627 \u0644\u0647. \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0633\u0627\u0628\u0642 \u0628\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631 \u0627\u0644\u0642\u062F\u064A\u0645\u0629 \u0633\u064A\u062A\u0648\u0642\u0641."] }), _jsxs(Button, { loading: loading, className: "w-full", onClick: onGenerate, children: [_jsx(KeyRound, { className: "size-4" }), "\u062A\u0648\u0644\u064A\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u062C\u062F\u064A\u062F\u0629"] })] }));
    }
    const credRow = (label, value, key) => (_jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border border-border bg-subtle px-4 py-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-[11px] font-bold text-muted", children: label }), _jsx("p", { className: "mt-0.5 truncate text-sm font-bold text-ink", dir: "ltr", children: value })] }), _jsx("button", { onClick: () => void copy(value, key), className: "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:text-primary cursor-pointer", "aria-label": `نسخ ${label}`, children: copied === key ? _jsx(Check, { className: "size-4 text-success" }) : _jsx(Copy, { className: "size-4" }) })] }));
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-success", children: [_jsx(KeyRound, { className: "size-4" }), "\u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u062C\u062F\u064A\u062F\u0629 \u0644\u0640\u00AB", result.name ?? String(row.name ?? ''), "\u00BB \u2014 \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0625\u0631\u0633\u0627\u0644."] }), _jsxs("div", { className: "space-y-3", children: [credRow('رابط الدخول المباشر للوحة', magic, 'link'), credRow('البريد الإلكتروني', result.email ?? '', 'email'), credRow('كلمة السر', result.password ?? '', 'pass')] }), _jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [wa && (_jsx(Button, { variant: "whatsapp", asChild: true, children: _jsxs("a", { href: wa, target: "_blank", rel: "noopener noreferrer", children: [_jsx(MessageCircle, { className: "size-4" }), " \u0625\u0631\u0633\u0627\u0644 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628"] }) })), _jsxs(Button, { variant: "secondary", onClick: () => void copy(message, 'all'), children: [copied === 'all' ? _jsx(Check, { className: "size-4" }) : _jsx(Copy, { className: "size-4" }), "\u0646\u0633\u062E \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0639\u0627\u064B"] })] }), _jsx(Button, { variant: "outline", className: "w-full", onClick: onDone, children: "\u0625\u063A\u0644\u0627\u0642" })] }));
}
