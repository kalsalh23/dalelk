import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { startBookingTracking } from '@/services/bookingStatus';
import { Analytics } from "@vercel/analytics/react";
// تسجيل Service Worker للإشعارات الخارجية
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => { });
    });
}
// تتبّع حالة طلبات المواعيد المعلّقة (استقصاء مجاني + إشعار للمواطن عند القبول/الرفض)
startBookingTracking();
createRoot(document.getElementById('root')).render(_jsxs(StrictMode, { children: [_jsx(Analytics, {}), _jsx(App, {})] }));
