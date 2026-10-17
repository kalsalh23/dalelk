import { jsx as _jsx } from "react/jsx-runtime";
import { EntityListPage } from '@/components/entities/EntityListPage';
import { SpecialtyCards } from '@/components/entities/SpecialtyCards';
import { EntityDetailPage } from '@/components/entities/EntityDetailPage';
const defs = {
    doctors: {
        type: 'doctor',
        title: 'الأطباء',
        subtitle: 'تصفح أطباء الاختصاص في مدينة طيبة الإمام',
        showSpecialty: true,
    },
    clinics: {
        type: 'clinic',
        title: 'العيادات',
        subtitle: 'دليل عيادات الاختصاص في مدينة طيبة الإمام',
    },
    hospitals: {
        type: 'hospital',
        title: 'المشافي',
        subtitle: 'مشافي ومراكز علاجية في طيبة الإمام',
    },
    health: {
        type: 'health_center',
        title: 'المراكز الصحية',
        subtitle: 'مراكز الرعاية الصحية الأولية في طيبة الإمام',
    },
    pharmacies: {
        type: 'pharmacy',
        title: 'الصيدليات',
        subtitle: 'صيدليات موثوقة لجميع الاحتياجات الدوائية',
    },
    labs: {
        type: 'lab',
        title: 'المخابر',
        subtitle: 'مخابر التحاليل الطبية في طيبة الإمام',
    },
    radiology: {
        type: 'radiology',
        title: 'مراكز الأشعة',
        subtitle: 'مراكز التصوير الشعاعي في طيبة الإمام',
    },
};
export const DoctorsList = () => _jsx(SpecialtyCards, {});
export const DoctorDetail = () => _jsx(EntityDetailPage, { type: "doctor", title: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621" });
export const ClinicsList = () => _jsx(EntityListPage, { type: defs.clinics.type, title: defs.clinics.title, subtitle: defs.clinics.subtitle });
export const ClinicDetail = () => _jsx(EntityDetailPage, { type: "clinic", title: "\u0627\u0644\u0639\u064A\u0627\u062F\u0627\u062A" });
export const HospitalsList = () => _jsx(EntityListPage, { type: defs.hospitals.type, title: defs.hospitals.title, subtitle: defs.hospitals.subtitle });
export const HospitalDetail = () => _jsx(EntityDetailPage, { type: "hospital", title: "\u0627\u0644\u0645\u0634\u0627\u0641\u064A" });
export const HealthList = () => _jsx(EntityListPage, { type: defs.health.type, title: defs.health.title, subtitle: defs.health.subtitle });
export const HealthDetail = () => _jsx(EntityDetailPage, { type: "health_center", title: "\u0627\u0644\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0635\u062D\u064A\u0629" });
export const PharmaciesList = () => _jsx(EntityListPage, { type: defs.pharmacies.type, title: defs.pharmacies.title, subtitle: defs.pharmacies.subtitle });
export const PharmacyDetail = () => _jsx(EntityDetailPage, { type: "pharmacy", title: "\u0627\u0644\u0635\u064A\u062F\u0644\u064A\u0627\u062A" });
export const LabsList = () => _jsx(EntityListPage, { type: defs.labs.type, title: defs.labs.title, subtitle: defs.labs.subtitle });
export const LabDetail = () => _jsx(EntityDetailPage, { type: "lab", title: "\u0627\u0644\u0645\u062E\u0627\u0628\u0631" });
export const RadiologyList = () => _jsx(EntityListPage, { type: defs.radiology.type, title: defs.radiology.title, subtitle: defs.radiology.subtitle });
export const RadiologyDetail = () => _jsx(EntityDetailPage, { type: "radiology", title: "\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0623\u0634\u0639\u0629" });
