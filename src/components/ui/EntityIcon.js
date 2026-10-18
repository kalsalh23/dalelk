import { jsx as _jsx } from "react/jsx-runtime";
import { Stethoscope, Building2, Hospital, Pill, Moon, FlaskConical, ScanLine, HeartPulse, } from 'lucide-react';
const ICONS = {
    stethoscope: Stethoscope,
    building: Building2,
    hospital: Hospital,
    pill: Pill,
    moon: Moon,
    flask: FlaskConical,
    scan: ScanLine,
    'heart-pulse': HeartPulse,
};
export function ServiceIcon({ name, className }) {
    const Icon = ICONS[name] ?? Stethoscope;
    return _jsx(Icon, { className: className ?? 'size-5' });
}
export function EntityIcon({ type, className }) {
    const map = {
        doctor: Stethoscope,
        clinic: Building2,
        hospital: Hospital,
        pharmacy: Pill,
        health_center: HeartPulse,
        lab: FlaskConical,
        radiology: ScanLine,
    };
    const Icon = map[type] ?? Stethoscope;
    return _jsx(Icon, { className: className ?? 'size-5' });
}
export { ICONS as SERVICE_ICON_MAP };
