import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Image as ImageIcon, Trash2, Upload, Star, Images, Save } from 'lucide-react';
import { useDashboardSession } from '@/layouts/DashboardLayout';
import { readStoredSession, updateEntityOwn, folderForType } from '@/services/entityAccount';
import { compressImage, uploadToFolder, deleteImage } from '@/services/admin';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getPublicUrl } from '@/lib/supabase';
import { Seo } from '@/components/seo/Seo';
import { queryClient } from '@/lib/queryClient';
export function DashboardMediaPage() {
    const { session, setSession } = useDashboardSession();
    const toast = useToast();
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [mainImage, setMainImage] = useState(null);
    const [gallery, setGallery] = useState([]);
    useEffect(() => {
        if (!session?.entity)
            return;
        const e = session.entity;
        setMainImage(e.image ?? null);
        const g = e.gallery ?? e.images ?? [];
        setGallery(Array.isArray(g) ? g : []);
    }, [session]);
    if (!session)
        return null;
    const folder = folderForType(session.entity_type);
    const handleMainUpload = async (file) => {
        setUploading(true);
        try {
            const compressed = await compressImage(file);
            const path = await uploadToFolder(folder, compressed);
            if (path) {
                if (mainImage)
                    await deleteImage(mainImage).catch(() => { });
                setMainImage(path);
                toast.show('تم رفع الصورة الرئيسية — اضغط حفظ للتثبيت');
            }
            else {
                toast.show('فشل رفع الصورة — تأكد من تطبيق سياسات التخزين في Supabase', 'error');
            }
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : '';
            if (msg.includes('row-level security') || msg.includes('403')) {
                toast.show('فشل الرفع: سياسات التخزين غير مطبقة — طبّق migration_entity_dashboard.sql', 'error');
            }
            else {
                toast.show(`فشل رفع الصورة: ${msg || 'خطأ غير معروف'}`, 'error');
            }
        }
        finally {
            setUploading(false);
        }
    };
    const handleGalleryUpload = async (files) => {
        if (gallery.length + files.length > 12) {
            toast.show('الحد الأقصى 12 صورة في المعرض', 'error');
            return;
        }
        setUploading(true);
        try {
            const paths = [];
            for (const f of Array.from(files)) {
                const c = await compressImage(f);
                const p = await uploadToFolder(folder, c);
                if (p)
                    paths.push(p);
            }
            if (paths.length === 0) {
                toast.show('فشل رفع الصور — سياسات التخزين غير مطبقة', 'error');
            }
            else {
                setGallery((prev) => [...prev, ...paths]);
                toast.show(`تم رفع ${paths.length} صورة — اضغط حفظ للتثبيت`);
            }
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : '';
            toast.show(`فشل رفع بعض الصور: ${msg || 'تحقق من سياسات التخزين'}`, 'error');
        }
        finally {
            setUploading(false);
        }
    };
    const removeGallery = (idx) => {
        const path = gallery[idx];
        setGallery((prev) => prev.filter((_, i) => i !== idx));
        if (path)
            void deleteImage(path);
    };
    const save = async () => {
        const stored = readStoredSession();
        if (!stored)
            return;
        setSaving(true);
        const ok = await updateEntityOwn(stored.token, { image: mainImage, gallery, images: gallery });
        setSaving(false);
        if (ok) {
            toast.show('تم حفظ الصور — ستظهر في صفحة الجهة بعد تحديثها');
            setSession((prev) => prev ? { ...prev, entity: { ...(prev.entity ?? {}), image: mainImage, gallery, images: gallery } } : prev);
            void queryClient.invalidateQueries({ queryKey: ['entities'] });
            void queryClient.invalidateQueries({ queryKey: ['entities', 'detail'] });
        }
        else
            toast.show('تعذر الحفظ — تأكد من تطبيق ترحيل الصور في Supabase', 'error');
    };
    const mainUrl = getPublicUrl(mainImage) ?? mainImage;
    return (_jsxs("div", { className: "mx-auto max-w-4xl space-y-6", children: [_jsx(Seo, { title: "\u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u0645\u0639\u0631\u0636", description: "\u0625\u062F\u0627\u0631\u0629 \u0635\u0648\u0631 \u0627\u0644\u062C\u0647\u0629" }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-black text-ink", children: "\u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u0645\u0639\u0631\u0636" }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u062A\u0638\u0647\u0631 \u0641\u064A \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u0628\u062D\u062B. \u0627\u0644\u0645\u0639\u0631\u0636 \u064A\u0638\u0647\u0631 \u062F\u0627\u062E\u0644 \u0635\u0641\u062D\u0629 \u0627\u0644\u062C\u0647\u0629 (\u062D\u062A\u0649 12 \u0635\u0648\u0631\u0629)." })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Star, { className: "size-4 text-gold-dark" }), " \u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629"] }) }), _jsx(CardBody, { children: _jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start", children: [_jsx("div", { className: "flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-subtle-strong", children: mainUrl ? _jsx("img", { src: mainUrl, alt: "\u0627\u0644\u0635\u0648\u0631\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", className: "size-full object-cover" }) : _jsx(ImageIcon, { className: "size-10 text-muted" }) }), _jsxs("div", { className: "flex-1 space-y-3", children: [_jsx("p", { className: "text-sm text-muted", children: "\u064A\u064F\u0641\u0636\u0644 \u0645\u0642\u0627\u0633 \u0645\u0631\u0628\u0639 800\u00D7800 \u0628\u062C\u0648\u062F\u0629 \u0639\u0627\u0644\u064A\u0629. \u0633\u064A\u062A\u0645 \u0636\u063A\u0637 \u0627\u0644\u0635\u0648\u0631\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B." }), _jsxs("label", { className: "inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark", children: [_jsx(Upload, { className: "size-4" }), " ", uploading ? 'جارٍ الرفع…' : 'اختيار صورة جديدة', _jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => { const f = e.target.files?.[0]; if (f)
                                                        void handleMainUpload(f); e.target.value = ''; }, disabled: uploading })] }), mainImage && _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setMainImage(null), children: [_jsx(Trash2, { className: "size-4" }), " \u0625\u0632\u0627\u0644\u0629"] })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Images, { className: "size-4 text-primary" }), " \u0645\u0639\u0631\u0636 \u0627\u0644\u0635\u0648\u0631 (", gallery.length, "/12)"] }), _jsxs("label", { className: "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-bold hover:bg-subtle", children: [_jsx(Upload, { className: "size-4" }), " \u0625\u0636\u0627\u0641\u0629 \u0635\u0648\u0631", _jsx("input", { type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: (e) => { if (e.target.files?.length)
                                            void handleGalleryUpload(e.target.files); e.target.value = ''; }, disabled: uploading })] })] }), _jsxs(CardBody, { children: [gallery.length === 0 ? (_jsxs("div", { className: "rounded-2xl border border-dashed border-border bg-subtle py-12 text-center", children: [_jsx(Images, { className: "mx-auto size-8 text-muted" }), _jsx("p", { className: "mt-2 text-sm text-muted", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0635\u0648\u0631 \u0641\u064A \u0627\u0644\u0645\u0639\u0631\u0636 \u2014 \u0623\u0636\u0641 \u0635\u0648\u0631\u0627\u064B \u0644\u0639\u064A\u0627\u062F\u062A\u0643 \u0623\u0648 \u062A\u062C\u0647\u064A\u0632\u0627\u062A\u0643" })] })) : (_jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4", children: gallery.map((p, i) => {
                                    const url = getPublicUrl(p) ?? p;
                                    return (_jsxs("div", { className: "group relative overflow-hidden rounded-2xl border border-border bg-subtle-strong", children: [_jsx("img", { src: url, alt: "", className: "aspect-square w-full object-cover" }), _jsx("button", { onClick: () => removeGallery(i), className: "absolute right-2 top-2 flex size-8 items-center justify-center rounded-xl bg-wine-soft0 text-white opacity-0 shadow transition group-hover:opacity-100 hover:bg-wine-dark", children: _jsx(Trash2, { className: "size-4" }) })] }, `${p}-${i}`));
                                }) })), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsxs(Button, { onClick: () => void save(), loading: saving, children: [_jsx(Save, { className: "size-4" }), " \u062D\u0641\u0638 \u0627\u0644\u0635\u0648\u0631"] }), _jsx("span", { className: "py-2 text-xs text-muted", children: "\u0627\u0644\u062D\u0641\u0638 \u064A\u062D\u062F\u0651\u062B \u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0641\u0648\u0631\u0627\u064B" })] })] })] })] }));
}
