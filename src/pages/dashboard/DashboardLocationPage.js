import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { MapPin, Save, ExternalLink, Navigation } from 'lucide-react';
import { useDashboardSession } from '@/layouts/DashboardLayout';
import { readStoredSession, updateEntityOwn } from '@/services/entityAccount';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { mapsLink } from '@/lib/utils';
import { Seo } from '@/components/seo/Seo';
import { queryClient } from '@/lib/queryClient';
export function DashboardLocationPage() {
    const { session, setSession } = useDashboardSession();
    const toast = useToast();
    const [address, setAddress] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (!session?.entity)
            return;
        const e = session.entity;
        setAddress(String(e.address ?? ''));
        setLat(e.lat != null ? String(e.lat) : '');
        setLng(e.lng != null ? String(e.lng) : '');
    }, [session]);
    if (!session)
        return null;
    const e = session.entity;
    const useMyLocation = () => {
        if (!navigator.geolocation) {
            toast.show('المتصفح لا يدعم تحديد الموقع', 'error');
            return;
        }
        navigator.geolocation.getCurrentPosition((pos) => {
            setLat(String(pos.coords.latitude));
            setLng(String(pos.coords.longitude));
            toast.show('تم التقاط الإحداثيات');
        }, () => toast.show('تعذر تحديد الموقع — تأكد من السماح للمتصفح', 'error'));
    };
    const save = async () => {
        const stored = readStoredSession();
        if (!stored)
            return;
        setSaving(true);
        const fields = {
            address: address.trim() || null,
            lat: lat.trim() || null,
            lng: lng.trim() || null,
        };
        const ok = await updateEntityOwn(stored.token, fields);
        setSaving(false);
        if (ok) {
            toast.show('تم حفظ الموقع — سيظهر على الخريطة مباشرة');
            setSession((prev) => prev ? { ...prev, entity: { ...(prev.entity ?? {}), address: fields.address, lat: lat.trim() ? Number(lat) : null, lng: lng.trim() ? Number(lng) : null } } : prev);
            void queryClient.invalidateQueries({ queryKey: ['entities'] });
            void queryClient.invalidateQueries({ queryKey: ['markers'] });
        }
        else
            toast.show('تعذر الحفظ — تأكد من تطبيق الترحيل في Supabase', 'error');
    };
    const previewLink = mapsLink(lat ? Number(lat) : e.lat, lng ? Number(lng) : e.lng, address || e.address);
    return (_jsxs("div", { className: "mx-auto max-w-3xl space-y-6", children: [_jsx(Seo, { title: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0639\u0646\u0648\u0627\u0646", description: "\u062A\u0639\u062F\u064A\u0644 \u0645\u0648\u0642\u0639 \u0627\u0644\u062C\u0647\u0629" }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-black text-ink", children: "\u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0627\u0644\u0639\u0646\u0648\u0627\u0646" }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u062D\u062F\u0651\u062F \u0639\u0646\u0648\u0627\u0646\u0643 \u0627\u0644\u062F\u0642\u064A\u0642 \u0648\u0627\u0644\u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A \u0644\u064A\u0638\u0647\u0631 \u0645\u0648\u0642\u0639\u0643 \u0628\u0634\u0643\u0644 \u0635\u062D\u064A\u062D \u0639\u0644\u0649 \u0627\u0644\u062E\u0631\u064A\u0637\u0629." })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "size-4 text-primary" }), " \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0648\u0627\u0644\u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A"] }) }), _jsxs(CardBody, { className: "space-y-4", children: [_jsx(Field, { label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062A\u0641\u0635\u064A\u0644\u064A", hint: "\u0645\u062B\u0627\u0644: \u0637\u064A\u0628\u0629 \u0627\u0644\u0625\u0645\u0627\u0645 - \u0627\u0644\u0634\u0627\u0631\u0639 \u0627\u0644\u0631\u0626\u064A\u0633\u064A \u0628\u062C\u0627\u0646\u0628 ...", children: _jsx(Input, { value: address, onChange: (e) => setAddress(e.target.value), placeholder: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646" }) }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "\u062E\u0637 \u0627\u0644\u0639\u0631\u0636 (lat)", children: _jsx(Input, { dir: "ltr", type: "number", step: "any", value: lat, onChange: (e) => setLat(e.target.value), placeholder: "35.26389" }) }), _jsx(Field, { label: "\u062E\u0637 \u0627\u0644\u0637\u0648\u0644 (lng)", children: _jsx(Input, { dir: "ltr", type: "number", step: "any", value: lng, onChange: (e) => setLng(e.target.value), placeholder: "36.70667" }) })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", type: "button", onClick: useMyLocation, children: [_jsx(Navigation, { className: "size-4" }), " \u062A\u062D\u062F\u064A\u062F \u0645\u0648\u0642\u0639\u064A \u0627\u0644\u062D\u0627\u0644\u064A"] }), _jsxs("a", { href: previewLink, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-bold hover:bg-subtle", children: [_jsx(ExternalLink, { className: "size-4" }), " \u0645\u0639\u0627\u064A\u0646\u0629 \u0639\u0644\u0649 \u062E\u0631\u0627\u0626\u0637 Google"] })] }), _jsxs("div", { className: "rounded-2xl border border-border bg-subtle p-4 text-xs leading-6 text-muted", children: [_jsx("p", { className: "font-bold text-ink", children: "\u0643\u064A\u0641 \u0623\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A\u061F" }), _jsxs("p", { className: "mt-1", children: ["\u0627\u0641\u062A\u062D ", _jsx("a", { href: "https://maps.google.com", target: "_blank", rel: "noreferrer", className: "font-bold text-primary hover:underline", children: "\u062E\u0631\u0627\u0626\u0637 Google" }), "\u060C \u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \u0645\u0648\u0642\u0639\u0643\u060C \u0648\u0627\u0646\u0633\u062E \u0627\u0644\u0623\u0631\u0642\u0627\u0645 \u0627\u0644\u062A\u064A \u062A\u0638\u0647\u0631 (lat, lng) \u0648\u0627\u0644\u0635\u0642\u0647\u0627 \u0647\u0646\u0627. \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0645 \u0632\u0631 \"\u062A\u062D\u062F\u064A\u062F \u0645\u0648\u0642\u0639\u064A \u0627\u0644\u062D\u0627\u0644\u064A\" \u0625\u0630\u0627 \u0643\u0646\u062A \u0641\u064A \u0627\u0644\u0645\u0648\u0642\u0639 \u0646\u0641\u0633\u0647."] })] }), _jsxs(Button, { onClick: () => void save(), loading: saving, children: [_jsx(Save, { className: "size-4" }), " \u062D\u0641\u0638 \u0627\u0644\u0645\u0648\u0642\u0639"] })] })] }), (lat && lng) && (_jsx(Card, { children: _jsx(CardBody, { className: "p-2", children: _jsx("iframe", { title: "\u0645\u0639\u0627\u064A\u0646\u0629 \u0627\u0644\u062E\u0631\u064A\u0637\u0629", className: "h-[280px] w-full rounded-xl border-0", loading: "lazy", src: `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=15&output=embed` }) }) }))] }));
}
