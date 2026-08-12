import type { EntityType, Plan } from '@/types'

export const APP_NAME = 'دليلك الطبي'
export const APP_SLOGAN = 'كل ما تحتاجه من خدمات صحية في مدينة طيبة الإمام... في مكان واحد.'
export const DEFAULT_CITY = 'طيبة الإمام'

export interface ServiceDef {
  key: string
  name: string
  description: string
  route: string
  icon: string
  color: string
}

export const SERVICES: ServiceDef[] = [
  {
    key: 'doctor',
    name: 'الأطباء',
    description: 'أطباء الاختصاص العام والاختصاصات الدقيقة في المدينة.',
    route: '/doctors',
    icon: 'stethoscope',
    color: 'emerald',
  },
  {
    key: 'clinic',
    name: 'العيادات',
    description: 'عيادات خاصة للاختصاصات المتنوعة.',
    route: '/clinics',
    icon: 'building',
    color: 'teal',
  },
  {
    key: 'hospital',
    name: 'المشافي',
    description: 'مشافي ومراكز علاجية في طيبة الإمام.',
    route: '/hospitals',
    icon: 'hospital',
    color: 'sky',
  },
  {
    key: 'pharmacy',
    name: 'الصيدليات',
    description: 'صيدليات موثوقة لجميع الاحتياجات الدوائية.',
    route: '/pharmacies',
    icon: 'pill',
    color: 'green',
  },
  {
    key: 'duty',
    name: 'الصيدليات المناوبة',
    description: 'الصيدليات المناوبة خارج ساعات الدوام.',
    route: '/duty-pharmacies',
    icon: 'moon',
    color: 'indigo',
  },
  {
    key: 'lab',
    name: 'المخابر',
    description: 'مخابر التحاليل الطبية والأحياء الدقيقة.',
    route: '/labs',
    icon: 'flask',
    color: 'amber',
  },
  {
    key: 'radiology',
    name: 'مراكز الأشعة',
    description: 'مراكز التصوير الشعاعي والرنين المغناطيسي.',
    route: '/radiology',
    icon: 'scan',
    color: 'rose',
  },
  {
    key: 'health_center',
    name: 'المراكز الصحية',
    description: 'مراكز رعاية صحية أولية للمواطنين.',
    route: '/health-centers',
    icon: 'heart-pulse',
    color: 'orange',
  },
]

export const ARTICLE_CATEGORIES = [
  'الأطفال',
  'المرأة',
  'التغذية',
  'القلب',
  'السكري',
  'الضغط',
  'الصحة النفسية',
  'الرياضة',
  'الوقاية',
  'الأدوية',
  'الإسعافات الأولية',
]

export const SPECIALTIES = [
  'طب عام',
  'طب الأطفال',
  'النسائية والتوليد',
  'القلبية',
  'الأذن والأنف والحنجرة',
  'العينية',
  'الأمراض الجلدية',
  'العظمية',
  'الباطنية',
  'الأمراض النفسية',
  'المسالك البولية',
  'الأسنان',
  'الجراحة العامة',
  'العصبية',
  'الغدد والسكري',
  'العلاج الفيزيائي',
]

export const PLANS: {
  key: Plan
  name: string
  icon: string
  description: string
  features: string[]
}[] = [
  {
    key: 'free',
    name: 'الخطة المجانية',
    icon: 'free',
    description: 'الإدراج الأساسي في الدليل',
    features: ['صورة واحدة', 'رقم الهاتف', 'الموقع على الخريطة', 'الظهور الطبيعي في البحث'],
  },
  {
    key: 'pro',
    name: 'الخطة الاحترافية',
    icon: 'sparkles',
    description: 'ملف احترافي كامل',
    features: [
      'حتى 20 صورة',
      'فيديو تعريفي',
      'معرض الخدمات',
      'جميع وسائل التواصل وواتساب',
      'شارة موثّق',
      'ظهور أفضل في البحث',
      'إحصائيات الصفحة',
    ],
  },
  {
    key: 'gold',
    name: 'الخطة الذهبية',
    icon: 'crown',
    description: 'كل مزايا الاحترافية مع تميّز كامل',
    features: [
      'كل مزايا الاحترافية',
      'بانر بارز',
      'صفحة مميزة',
      'عرض الفريق الطبي',
      'أولوية في البحث',
      'الظهور في الصفحة الرئيسية',
      'تمييز البطاقة',
    ],
  },
]

export const PLAN_NAMES: Record<Plan, string> = {
  free: 'مجاني',
  pro: 'احترافي',
  gold: 'ذهبي',
}

// تُقرأ القيمة الفعلية من إعدادات المنصة (app_settings) — هذا هو الافتراضي إن غابت الإعدادات
export const SUBSCRIPTIONS_ENABLED = true

export const DAYS_AR: Record<string, string> = {
  sat: 'السبت',
  sun: 'الأحد',
  mon: 'الاثنين',
  tue: 'الثلاثاء',
  wed: 'الأربعاء',
  thu: 'الخميس',
  fri: 'الجمعة',
}

export const DEFAULT_WORK_HOURS: Record<string, string> = {
  sat: '9:00 - 17:00',
  sun: '9:00 - 17:00',
  mon: '9:00 - 17:00',
  tue: '9:00 - 17:00',
  wed: '9:00 - 17:00',
  thu: '9:00 - 17:00',
  fri: 'مغلق',
}

export const ENTITY_LABELS: Record<EntityType, string> = {
  doctor: 'طبيب',
  clinic: 'عيادة',
  hospital: 'مشفى',
  health_center: 'مركز صحي',
  pharmacy: 'صيدلية',
  lab: 'مخبر',
  radiology: 'مركز أشعة',
}

export const MAP_COLORS: Record<EntityType, string> = {
  doctor: '#0F766E',
  clinic: '#0D9488',
  hospital: '#0284C7',
  health_center: '#F59E0B',
  pharmacy: '#16A34A',
  lab: '#D97706',
  radiology: '#E11D48',
}

export const DEFAULT_CITY_COORDS = { lat: 35.2662637, lng: 36.7118709 }

export const ABOUT_TEXT =
  'دليلك الطبي هو دليل رقمي شامل للخدمات الطبية في مدينة طيبة الإمام، يوفر للمواطن قائمة موثّقة بالأطباء والعيادات والمشافي والصيدليات والمراكز الصحية، مع مواقعهم على الخريطة وساعات الدوام وأرقام التواصل، بالإضافة إلى نصائح طبية موثوقة وقاعدة أسئلة وأجوبة صحية.'

export const DEFAULT_DEVELOPER = {
  name: 'م. قصي مهند الصالح',
  title: 'مطوّر المنصة',
  phone: '0952639157',
  international_phone: '+963952639157',
  instagram: 'https://www.instagram.com/kosai_al_saleh?igsh=cWM0dzEzaThqN2sz',
  facebook: 'https://www.facebook.com/share/17m6YZ1NKS/',
}