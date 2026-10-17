import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, AtSign, Phone, ShieldCheck, Code2, BellRing, BellOff } from 'lucide-react';
import { InstagramIcon, FacebookIcon } from '@/components/ui/BrandIcons';
import { Logo } from '@/components/ui/Logo';
import { APP_NAME, DEFAULT_DEVELOPER, FEATURE_CLINICS } from '@/constants';
import { subscribePush, pushSupported } from '@/services/push';
const links = [
    { label: 'الرئيسية', to: '/' },
    { label: 'الأطباء', to: '/doctors' },
    { label: 'العيادات', to: '/clinics' },
    { label: 'المشافي', to: '/hospitals' },
    { label: 'الصيدليات', to: '/pharmacies' },
    { label: 'الصيدليات المناوبة', to: '/duty-pharmacies' },
    { label: 'اسأل دليلك', to: '/ask' },
].filter((l) => FEATURE_CLINICS || l.to !== '/clinics');
export function Footer({ developer = DEFAULT_DEVELOPER }) {
    const [pushBusy, setPushBusy] = useState(false);
    const [pushOn, setPushOn] = useState(() => typeof Notification !== 'undefined' && Notification.permission === 'granted');
    const [pushMsg, setPushMsg] = useState('');
    const enablePush = async () => {
        setPushBusy(true);
        setPushMsg('');
        const r = await subscribePush({ news: true, dailyDuty: true });
        setPushBusy(false);
        if (r === 'ok') {
            setPushOn(true);
            setPushMsg('تم تفعيل الإشعارات بنجاح — ستصلك أخبار المنصة وتذكير صيدليات المناوبة 3 مرات يومياً (كل 8 ساعات).');
        }
        else if (r === 'denied')
            setPushMsg('حظرت المتصفح الإشعارات — فعّلها من إعدادات الموقع في المتصفح.');
        else if (r === 'unsupported')
            setPushMsg('متصفحك لا يدعم الإشعارات — على آيفون أضف الموقع إلى الشاشة الرئيسية أولاً.');
        else
            setPushMsg('تعذر التفعيل، حاول مجدداً.');
    };
    const headCls = 'mb-2.5 text-xs font-black tracking-wide text-emerald-300';
    const linkCls = 'transition-colors hover:text-white';
    const socialCls = 'flex size-8 items-center justify-center rounded-lg border border-white/15 text-white/60 transition-colors hover:border-white/50 hover:text-white';
    return (_jsx("footer", { className: "mt-10 bg-primary-dark text-white", children: _jsxs("div", { className: "mx-auto max-w-7xl px-4 py-6 sm:px-6", children: [_jsxs("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3", children: [_jsxs("div", { children: [_jsx(Logo, { inverse: true }), _jsx("p", { className: "mt-2.5 max-w-xs text-xs leading-6 text-white/55", children: "\u062F\u0644\u064A\u0644 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0641\u064A \u0645\u062F\u064A\u0646\u0629 \u0637\u064A\u0628\u0629 \u0627\u0644\u0625\u0645\u0627\u0645 \u2014 \u0643\u0644 \u0645\u0627 \u062A\u062D\u062A\u0627\u062C\u0647 \u0645\u0646 \u062E\u062F\u0645\u0627\u062A \u0635\u062D\u064A\u0629 \u0641\u064A \u0645\u0643\u0627\u0646 \u0648\u0627\u062D\u062F." })] }), _jsxs("div", { children: [_jsx("h4", { className: headCls, children: "\u0627\u0644\u0623\u0642\u0633\u0627\u0645" }), _jsx("ul", { className: "grid grid-cols-2 gap-1.5 text-[13px] text-white/70", children: links.map((l) => (_jsx("li", { children: _jsx(Link, { to: l.to, className: linkCls, children: l.label }) }, l.to))) })] }), _jsxs("div", { children: [_jsx("h4", { className: headCls, children: "\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627" }), _jsxs("div", { className: "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/70", children: [_jsx(Phone, { className: "size-3.5 shrink-0 text-emerald-300" }), _jsx("span", { children: "\u0645\u0637\u0648\u0651\u0631 \u0627\u0644\u0645\u0646\u0635\u0629: \u0645. \u0642\u0635\u064A \u0645\u0647\u0646\u062F \u0627\u0644\u0635\u0627\u0644\u062D" }), _jsx("a", { dir: "ltr", href: "https://wa.me/963952639157", target: "_blank", rel: "noopener noreferrer", className: "font-bold text-emerald-300 hover:underline", children: "0952639157" })] }), _jsxs("div", { className: "mt-3 flex items-center gap-2", children: [developer.instagram && (_jsx("a", { href: developer.instagram, target: "_blank", rel: "noopener noreferrer", className: socialCls, "aria-label": "\u0625\u0646\u0633\u062A\u063A\u0631\u0627\u0645", children: _jsx(InstagramIcon, { className: "size-4" }) })), developer.facebook && (_jsx("a", { href: developer.facebook, target: "_blank", rel: "noopener noreferrer", className: socialCls, "aria-label": "\u0641\u064A\u0633\u0628\u0648\u0643", children: _jsx(FacebookIcon, { className: "size-4" }) })), _jsx("a", { href: `https://wa.me/963${developer.phone?.replace(/^0/, '')}`, target: "_blank", rel: "noopener noreferrer", className: socialCls, "aria-label": "\u0648\u0627\u062A\u0633\u0627\u0628", children: _jsx(MessageCircle, { className: "size-4" }) }), _jsx("a", { href: `mailto:support@dalil-altaybeh.com`, className: socialCls, "aria-label": "\u0628\u0631\u064A\u062F", children: _jsx(AtSign, { className: "size-4" }) })] }), _jsxs("p", { className: "mt-3 flex items-center gap-1.5 text-[11px] leading-5 text-white/40", children: [_jsx(ShieldCheck, { className: "size-3.5 shrink-0 text-emerald-300" }), "\u064A\u0647\u062F\u0641 \u0647\u0630\u0627 \u0627\u0644\u062F\u0644\u064A\u0644 \u0644\u0644\u062A\u062B\u0642\u064A\u0641 \u0648\u0644\u0627 \u064A\u064F\u063A\u0646\u064A \u0639\u0646 \u0627\u0633\u062A\u0634\u0627\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u062E\u062A\u0635."] })] })] }), pushSupported() && (_jsxs("div", { className: "mt-5 flex flex-col items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("span", { className: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400 text-primary-dark", children: pushOn ? _jsx(BellRing, { className: "size-4" }) : _jsx(BellOff, { className: "size-4" }) }), _jsxs("div", { children: [_jsxs("p", { className: "text-xs font-black text-white", children: ["\u0625\u0634\u0639\u0627\u0631\u0627\u062A ", APP_NAME] }), _jsx("p", { className: "text-[11px] text-white/60", children: "\u0635\u064A\u062F\u0644\u064A\u0629 \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629 \u0643\u0644 8 \u0633\u0627\u0639\u0627\u062A\u060C \u0627\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u062C\u062F\u064A\u062F\u0629\u060C \u0648\u062A\u062D\u062F\u064A\u062B\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F." }), pushMsg && _jsx("p", { className: "text-[10px] font-bold text-emerald-300", children: pushMsg })] })] }), _jsxs("button", { onClick: () => void enablePush(), disabled: pushOn || pushBusy, className: "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-3.5 py-2 text-xs font-bold text-primary-dark transition hover:bg-emerald-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer", children: [_jsx(BellRing, { className: "size-3.5" }), pushOn ? 'الإشعارات مفعّلة' : pushBusy ? 'جارٍ التفعيل…' : 'تفعيل الإشعارات'] })] })), _jsxs("div", { className: "mt-5 flex flex-col items-center gap-1.5 border-t border-white/10 pt-4 text-[11px] text-white/40 sm:flex-row sm:justify-between", children: [_jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " ", APP_NAME, " \u2014 \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629"] }), _jsxs("p", { className: "flex items-center gap-1.5", children: [_jsx(Code2, { className: "size-3 text-emerald-300" }), "\u062A\u0637\u0648\u064A\u0631 ", developer.name] })] })] }) }));
}
