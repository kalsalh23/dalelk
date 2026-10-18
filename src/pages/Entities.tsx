import { EntityListPage } from '@/components/entities/EntityListPage'
import { SpecialtyCards } from '@/components/entities/SpecialtyCards'
import { EntityDetailPage } from '@/components/entities/EntityDetailPage'

const defs = {
  doctors: {
    type: 'doctor' as const,
    title: 'Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡',
    subtitle: 'ØªØµÙØ­ Ø£Ø·Ø¨Ø§Ø¡ Ø§Ù„Ø§Ø®ØªØµØ§Øµ ÙÙŠ Ù…Ø¯ÙŠÙ†Ø© Ø·ÙŠØ¨Ø© Ø§Ù„Ø¥Ù…Ø§Ù…',
    showSpecialty: true,
  },
  clinics: {
    type: 'clinic' as const,
    title: 'Ø§Ù„Ø¹ÙŠØ§Ø¯Ø§Øª',
    subtitle: 'Ø¯Ù„ÙŠÙ„ Ø¹ÙŠØ§Ø¯Ø§Øª Ø§Ù„Ø§Ø®ØªØµØ§Øµ ÙÙŠ Ù…Ø¯ÙŠÙ†Ø© Ø·ÙŠØ¨Ø© Ø§Ù„Ø¥Ù…Ø§Ù…',
  },
  hospitals: {
    type: 'hospital' as const,
    title: 'Ø§Ù„Ù…Ø´Ø§ÙÙŠ',
    subtitle: 'Ù…Ø´Ø§ÙÙŠ ÙˆÙ…Ø±Ø§ÙƒØ² Ø¹Ù„Ø§Ø¬ÙŠØ© ÙÙŠ Ø·ÙŠØ¨Ø© Ø§Ù„Ø¥Ù…Ø§Ù…',
  },
  health: {
    type: 'health_center' as const,
    title: 'Ø§Ù„Ù…Ø±Ø§ÙƒØ² Ø§Ù„ØµØ­ÙŠØ©',
    subtitle: 'Ù…Ø±Ø§ÙƒØ² Ø§Ù„Ø±Ø¹Ø§ÙŠØ© Ø§Ù„ØµØ­ÙŠØ© Ø§Ù„Ø£ÙˆÙ„ÙŠØ© ÙÙŠ Ø·ÙŠØ¨Ø© Ø§Ù„Ø¥Ù…Ø§Ù…',
  },
  pharmacies: {
    type: 'pharmacy' as const,
    title: 'Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª',
    subtitle: 'ØµÙŠØ¯Ù„ÙŠØ§Øª Ù…ÙˆØ«ÙˆÙ‚Ø© Ù„Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø§Ø­ØªÙŠØ§Ø¬Ø§Øª Ø§Ù„Ø¯ÙˆØ§Ø¦ÙŠØ©',
  },
  labs: {
    type: 'lab' as const,
    title: 'Ø§Ù„Ù…Ø®Ø§Ø¨Ø±',
    subtitle: 'Ù…Ø®Ø§Ø¨Ø± Ø§Ù„ØªØ­Ø§Ù„ÙŠÙ„ Ø§Ù„Ø·Ø¨ÙŠØ© ÙÙŠ Ø·ÙŠØ¨Ø© Ø§Ù„Ø¥Ù…Ø§Ù…',
  },
  radiology: {
    type: 'radiology' as const,
    title: 'Ù…Ø±Ø§ÙƒØ² Ø§Ù„Ø£Ø´Ø¹Ø©',
    subtitle: 'Ù…Ø±Ø§ÙƒØ² Ø§Ù„ØªØµÙˆÙŠØ± Ø§Ù„Ø´Ø¹Ø§Ø¹ÙŠ ÙÙŠ Ø·ÙŠØ¨Ø© Ø§Ù„Ø¥Ù…Ø§Ù…',
  },
}

export const DoctorsList = () => <SpecialtyCards />
export const DoctorDetail = () => <EntityDetailPage type="doctor" title="Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡" />
export const ClinicsList = () => <EntityListPage type={defs.clinics.type} title={defs.clinics.title} subtitle={defs.clinics.subtitle} />
export const ClinicDetail = () => <EntityDetailPage type="clinic" title="Ø§Ù„Ø¹ÙŠØ§Ø¯Ø§Øª" />
export const HospitalsList = () => <EntityListPage type={defs.hospitals.type} title={defs.hospitals.title} subtitle={defs.hospitals.subtitle} />
export const HospitalDetail = () => <EntityDetailPage type="hospital" title="Ø§Ù„Ù…Ø´Ø§ÙÙŠ" />
export const HealthList = () => <EntityListPage type={defs.health.type} title={defs.health.title} subtitle={defs.health.subtitle} />
export const HealthDetail = () => <EntityDetailPage type="health_center" title="Ø§Ù„Ù…Ø±Ø§ÙƒØ² Ø§Ù„ØµØ­ÙŠØ©" />
export const PharmaciesList = () => <EntityListPage type={defs.pharmacies.type} title={defs.pharmacies.title} subtitle={defs.pharmacies.subtitle} />
export const PharmacyDetail = () => <EntityDetailPage type="pharmacy" title="Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª" />
export const LabsList = () => <EntityListPage type={defs.labs.type} title={defs.labs.title} subtitle={defs.labs.subtitle} />
export const LabDetail = () => <EntityDetailPage type="lab" title="Ø§Ù„Ù…Ø®Ø§Ø¨Ø±" />
export const RadiologyList = () => <EntityListPage type={defs.radiology.type} title={defs.radiology.title} subtitle={defs.radiology.subtitle} />
export const RadiologyDetail = () => <EntityDetailPage type="radiology" title="Ù…Ø±Ø§ÙƒØ² Ø§Ù„Ø£Ø´Ø¹Ø©" />
