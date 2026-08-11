import { EntityListPage } from '@/components/entities/EntityListPage'
import { EntityDetailPage } from '@/components/entities/EntityDetailPage'

const defs = {
  doctors: {
    type: 'doctor' as const,
    title: 'الأطباء',
    subtitle: 'تصفح أطباء الاختصاص في مدينة طيبة الإمام',
    showSpecialty: true,
  },
  clinics: {
    type: 'clinic' as const,
    title: 'العيادات',
    subtitle: 'دليل عيادات الاختصاص في مدينة طيبة الإمام',
  },
  hospitals: {
    type: 'hospital' as const,
    title: 'المشافي',
    subtitle: 'مشافي ومراكز علاجية في طيبة الإمام',
  },
  health: {
    type: 'health_center' as const,
    title: 'المراكز الصحية',
    subtitle: 'مراكز الرعاية الصحية الأولية في طيبة الإمام',
  },
  pharmacies: {
    type: 'pharmacy' as const,
    title: 'الصيدليات',
    subtitle: 'صيدليات موثوقة لجميع الاحتياجات الدوائية',
  },
  labs: {
    type: 'lab' as const,
    title: 'المخابر',
    subtitle: 'مخابر التحاليل الطبية في طيبة الإمام',
  },
  radiology: {
    type: 'radiology' as const,
    title: 'مراكز الأشعة',
    subtitle: 'مراكز التصوير الشعاعي في طيبة الإمام',
  },
}

export const DoctorsList = () => <EntityListPage type={defs.doctors.type} title={defs.doctors.title} subtitle={defs.doctors.subtitle} showSpecialtyFilter />
export const DoctorDetail = () => <EntityDetailPage type="doctor" title="الأطباء" />
export const ClinicsList = () => <EntityListPage type={defs.clinics.type} title={defs.clinics.title} subtitle={defs.clinics.subtitle} />
export const ClinicDetail = () => <EntityDetailPage type="clinic" title="العيادات" />
export const HospitalsList = () => <EntityListPage type={defs.hospitals.type} title={defs.hospitals.title} subtitle={defs.hospitals.subtitle} />
export const HospitalDetail = () => <EntityDetailPage type="hospital" title="المشافي" />
export const HealthList = () => <EntityListPage type={defs.health.type} title={defs.health.title} subtitle={defs.health.subtitle} />
export const HealthDetail = () => <EntityDetailPage type="health_center" title="المراكز الصحية" />
export const PharmaciesList = () => <EntityListPage type={defs.pharmacies.type} title={defs.pharmacies.title} subtitle={defs.pharmacies.subtitle} />
export const PharmacyDetail = () => <EntityDetailPage type="pharmacy" title="الصيدليات" />
export const LabsList = () => <EntityListPage type={defs.labs.type} title={defs.labs.title} subtitle={defs.labs.subtitle} />
export const LabDetail = () => <EntityDetailPage type="lab" title="المخابر" />
export const RadiologyList = () => <EntityListPage type={defs.radiology.type} title={defs.radiology.title} subtitle={defs.radiology.subtitle} />
export const RadiologyDetail = () => <EntityDetailPage type="radiology" title="مراكز الأشعة" />