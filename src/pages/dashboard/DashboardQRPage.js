import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { QrCode, Download, Printer, ExternalLink } from 'lucide-react';
import { useDashboardSession } from '@/layouts/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Seo } from '@/components/seo/Seo';
import { APP_FULL_NAME } from '@/constants';
/** رمز QR جاهز للطباعة — يفتح صفحة الجهة عند المسح */
export function DashboardQRPage() {
    const { session } = useDashboardSession();
    const [dataUrl, setDataUrl] = useState(null);
    const [error, setError] = useState(false);
    const routeLink = session
        ? session.entity_type === 'health_center'
            ? 'health-centers'
            : session.entity_type === 'radiology'
                ? 'radiology'
                : `${session.entity_type}s`
        : '';
    const url = useMemo(() => {
        if (!session)
            return '';
        return `${window.location.origin}/${routeLink}/${encodeURIComponent(session.slug)}`;
    }, [session, routeLink]);
    const name = String(session?.entity?.name ?? '');
    const specialty = String(session?.entity?.specialty ?? '');
    useEffect(() => {
        if (!session)
            return;
        QRCode.toDataURL(url, {
            width: 640,
            margin: 2,
            color: { dark: '#054239', light: '#FFFFFF' },
            errorCorrectionLevel: 'M',
        })
            .then((d) => setDataUrl(d))
            .catch(() => setError(true));
    }, [session, url]);
    const download = () => {
        if (!dataUrl)
            return;
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'qr-dalil-altaybeh.png';
        a.click();
    };
    const print = () => {
        if (!dataUrl)
            return;
        const w = window.open('', '_blank', 'width=640,height=800');
        if (!w)
            return;
        w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>بطاقة ${name}</title>
      <style>
        body { font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f3f0e7; }
        .card { text-align: center; padding: 40px 48px; background: #fff; border: 3px solid #054239; border-radius: 24px; }
        .brand { color: #054239; font-size: 15px; font-weight: 700; letter-spacing: 0.3px; margin-bottom: 18px; }
        img.qr { width: 300px; height: 300px; display: block; margin: 0 auto; }
        h1 { color: #161616; font-size: 26px; margin: 18px 0 4px; }
        p.spec { color: #428177; font-weight: 700; margin: 0 0 10px; font-size: 14px; }
        p.hint { color: #666; font-size: 13px; margin: 12px 0 0; }
        p.url { color: #999; font-size: 10px; direction: ltr; margin: 6px 0 0; }
      </style></head><body>
      <div class="card">
        <div class="brand">${APP_FULL_NAME}</div>
        <img class="qr" src="${dataUrl}" alt="QR" />
        <h1>${name}</h1>
        ${specialty ? `<p class="spec">${specialty}</p>` : ''}
        <p class="hint">امسح الرمز لعرض صفحتي وخدماتي</p>
        <p class="url">${url}</p>
      </div>
      <script>window.onload = function () { window.print() }<\/script>
      </body></html>`);
        w.document.close();
    };
    if (!session) {
        return (_jsx(Card, { children: _jsxs(CardBody, { className: "p-10 text-center", children: [_jsx("h1", { className: "text-lg font-black text-ink", children: "\u0633\u062C\u0651\u0644 \u062F\u062E\u0648\u0644\u0643 \u0623\u0648\u0644\u0627\u064B" }), _jsx(Link, { to: "/dashboard/login", className: "mt-4 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark", children: "\u0635\u0641\u062D\u0629 \u0627\u0644\u062F\u062E\u0648\u0644" })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(Seo, { title: "\u0631\u0645\u0632 QR \u0644\u0635\u0641\u062D\u062A\u064A", description: "\u0628\u0637\u0627\u0642\u0629 \u0631\u0645\u0632 QR \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u0637\u0628\u0627\u0639\u0629 \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0642 \u0641\u064A \u0639\u064A\u0627\u062F\u062A\u0643" }), _jsxs("div", { children: [_jsxs("h1", { className: "flex items-center gap-2 text-2xl font-black text-ink", children: [_jsx(QrCode, { className: "size-6 text-primary" }), "\u0631\u0645\u0632 QR \u0644\u0635\u0641\u062D\u062A\u064A"] }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u0627\u0637\u0628\u0639 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0648\u0639\u0644\u0651\u0642\u0647\u0627 \u0641\u064A \u0639\u064A\u0627\u062F\u062A\u0643 \u0623\u0648 \u0635\u064A\u062F\u0644\u064A\u062A\u0643 \u2014 \u0645\u0633\u062D \u0627\u0644\u0631\u0645\u0632 \u064A\u0641\u062A\u062D \u0635\u0641\u062D\u062A\u0643 \u0645\u0628\u0627\u0634\u0631\u0629." })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_320px]", children: [_jsx(Card, { children: _jsxs(CardBody, { className: "flex flex-col items-center gap-5 p-8 text-center", children: [error ? (_jsx("p", { className: "text-sm text-error", children: "\u062A\u0639\u0630\u0631 \u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0631\u0645\u0632\u060C \u0623\u0639\u062F \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0635\u0641\u062D\u0629." })) : !dataUrl ? (_jsx("div", { className: "flex size-72 animate-pulse items-center justify-center rounded-2xl bg-subtle text-sm text-muted", children: "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u0648\u0644\u064A\u062F\u2026" })) : (_jsx("img", { src: dataUrl, alt: "\u0631\u0645\u0632 QR", className: "w-64 rounded-2xl border-4 border-primary-dark shadow-lg" })), _jsx("p", { className: "text-sm font-black text-ink", children: name }), _jsx("p", { className: "-mt-3 text-xs text-muted", dir: "ltr", children: url }), _jsxs("div", { className: "flex flex-wrap justify-center gap-3", children: [_jsxs(Button, { onClick: download, disabled: !dataUrl, children: [_jsx(Download, { className: "size-4" }), " \u062A\u0646\u0632\u064A\u0644 \u0627\u0644\u0635\u0648\u0631\u0629"] }), _jsxs(Button, { variant: "secondary", onClick: print, disabled: !dataUrl, children: [_jsx(Printer, { className: "size-4" }), " \u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0628\u0637\u0627\u0642\u0629"] }), _jsx(Button, { variant: "outline", asChild: true, children: _jsxs("a", { href: url, target: "_blank", rel: "noopener noreferrer", children: [_jsx(ExternalLink, { className: "size-4" }), " \u0641\u062A\u062D \u0635\u0641\u062D\u062A\u064A"] }) })] })] }) }), _jsx(Card, { className: "h-fit", children: _jsxs(CardBody, { className: "space-y-3 p-5 text-sm leading-7 text-muted", children: [_jsx("p", { className: "font-black text-ink", children: "\u0623\u0641\u0643\u0627\u0631 \u0644\u0644\u0627\u0633\u062A\u0641\u0627\u062F\u0629 \u0645\u0646 \u0627\u0644\u0631\u0645\u0632:" }), _jsx("p", { children: "\uD83D\uDDA8\uFE0F \u0627\u0637\u0628\u0639\u0647 \u0648\u0639\u0644\u0651\u0642\u0647 \u0639\u0646\u062F \u0628\u0627\u0628 \u0627\u0644\u0639\u064A\u0627\u062F\u0629 \u0623\u0648 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644." }), _jsx("p", { children: "\uD83D\uDCF1 \u0623\u0631\u0633\u0644 \u0635\u0648\u0631\u062A\u0647 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628 \u0644\u0645\u0631\u0636\u0627\u0643 \u0627\u0644\u062F\u0627\u0626\u0645\u064A\u0646." }), _jsx("p", { children: "\uD83D\uDDC2\uFE0F \u0623\u0636\u0641\u0647 \u0625\u0644\u0649 \u0628\u0637\u0627\u0642\u062A\u0643 \u0627\u0644\u0634\u062E\u0635\u064A\u0629 \u0623\u0648 \u0644\u0627\u0641\u062A\u0629 \u0627\u0644\u0639\u064A\u0627\u062F\u0629." }), _jsx("p", { children: "\uD83D\uDCCB \u0636\u0639\u0647 \u0639\u0644\u0649 \u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u0627\u0644\u0648\u0635\u0641\u0627\u062A \u0623\u0648 \u0623\u0648\u0631\u0627\u0642 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644." })] }) })] })] }));
}
