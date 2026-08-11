// بيانات تجريبية (Seed) لمنصة دليلك الطبي
// الاستخدام: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node supabase/seed.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('أعد تعيين SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const sb = createClient(url.replace(/\/rest\/v1\/?$/, ''), serviceKey, {
  auth: { persistSession: false },
})

const now = new Date().toISOString()
const today = new Date()
const addDays = (d) => new Date(today.getTime() + d * 86400000).toISOString().slice(0, 10)

// ---------- توليد صور SVG بديلة ----------
const svg = (label, color, icon) => `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420">
<rect width="640" height="420" fill="${color}"/>
<g fill="none" stroke="rgba(255,255,255,.9)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
  ${icon}
</g>
<text x="320" y="330" text-anchor="middle" font-family="sans-serif" font-size="42" font-weight="700" fill="#ffffff">${label}</text>
</svg>`

const icons = {
  doctor: '<path d="M320 150 v70 M285 185 h70 M270 150a50 50 0 1 1 100 0"/>',
  clinic: '<path d="M120 300 L320 140 L520 300 Z"/><rect x="270" y="246" width="100" height="54" rx="6"/>',
  hospital: '<path d="M140 300 V200 l60 40 V160 l60 40 V120" /><rect x="120" y="300" width="80" height="40"/><rect x="260" y="300" width="80" height="40"/><rect x="400" y="300" width="120" height="40"/>',
  pharmacy: '<circle cx="320" cy="210" r="90"/><path d="M320 140 v140 M250 210 h140"/>',
  lab: '<path d="M260 130 h120 v60 l70 110 a40 40 0 0 1-34 60 h-192 a40 40 0 0 1-34-60 l70-110 z"/>',
  radiology: '<rect x="150" y="160" width="340" height="160" rx="70"/><circle cx="320" cy="240" r="34"/>',
  health: '<path d="M320 300a110 110 0 1 0-110-110 110 110 0 0 0 110 110z M320 190 m-30 0 a30 30 0 1 1 60 0 a30 30 0 1 1 -60 0"/>',
  article: '<rect x="180" y="150" width="280" height="170" rx="12"/><path d="M220 210 h200 M220 250 h140"/>',
}

const colors = {
  doctor: '#0F766E',
  clinic: '#0D9488',
  hospital: '#0284C7',
  pharmacy: '#16A34A',
  lab: '#D97706',
  radiology: '#E11D48',
  health: '#F59E0B',
  article: '#7C3AED',
}

function writeSvg(folder, name, label, kind) {
  const dir = join(root, 'public', 'images', folder)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, name), svg(label, colors[kind], icons[kind]))
  return `/images/${folder}/${name}`
}

// ---------- الجداول الأساسية ----------
async function find(name, value) {
  const { data } = await sb.from(name).select('id').eq('slug', value).maybeSingle()
  return data
}

const city = (await find('cities', 'taybet-al-imam'))?.id

async function categoryId(slug) {
  const c = await find('categories', slug)
  return c?.id ?? null
}

const CATS = {}
for (const s of ['kids', 'women', 'nutrition', 'heart', 'diabetes', 'hypertension', 'mental-health', 'sports', 'prevention', 'medications', 'first-aid']) {
  CATS[s] = await categoryId(s)
}

const workHours = () => ({
  sat: '9:00 - 17:00', sun: '9:00 - 17:00', mon: '9:00 - 17:00',
  tue: '9:00 - 17:00', wed: '9:00 - 17:00', thu: '9:00 - 17:00', fri: 'مغلق',
})
const workHoursLong = () => ({
  sat: '8:00 - 20:00', sun: '8:00 - 20:00', mon: '8:00 - 20:00',
  tue: '8:00 - 20:00', wed: '8:00 - 20:00', thu: '8:00 - 20:00', fri: '8:00 - 13:00',
})

const base = (slug) => ({ slug, city_id: city, is_active: true, is_verified: false, plan: 'free', created_at: now, updated_at: now })

async function insert(table, rows) {
  const { data, error } = await sb.from(table).insert(rows).select('id')
  if (error) {
    console.error(`خطأ في ${table}:`, error.message)
    return []
  }
  console.log(`✓ ${table}: ${data.length} سجل`)
  return data
}

// ---------- صور ----------
const docImg1 = writeSvg('doctors', 'd1.svg', 'د. أحمد', 'doctor')
const docImg2 = writeSvg('doctors', 'd2.svg', 'د. فاتن', 'doctor')
const docImg3 = writeSvg('doctors', 'd3.svg', 'د. سامر', 'doctor')
const clinicImg1 = writeSvg('clinics', 'c1.svg', 'عيادة النور', 'clinic')
const clinicImg2 = writeSvg('clinics', 'c2.svg', 'عيادة الأمل', 'clinic')
const hospitalImg = writeSvg('hospitals', 'h1.svg', 'مشفى المدينة', 'hospital')
const pharmacyImg = writeSvg('pharmacies', 'p1.svg', 'صيدلية', 'pharmacy')

// ---------- الأطباء ----------
const doctors = [
  { name: 'د. أحمد خالد النعيم', specialty: 'طب الأطفال', gender: 'male', experience_years: 15, bio: 'اختصاصي أمراض الأطفال، خبرة أكثر من 15 عاماً في متابعة صحة الأطفال وحديثي الولادة في طيبة الإمام.', certifications: ['دبلوم طب الأطفال', 'بورد سوري في طب الأطفال'], services: ['متابعة نمو الأطفال', 'تطعيمات', 'علاج أمراض الجهاز التنفسي عند الأطفال'] },
  { name: 'د. فاتن محمود الحايك', specialty: 'النسائية والتوليد', gender: 'female', experience_years: 12, bio: 'اختصاصية النساء والتوليد، متابعة الحوامل وإجراء العمليات القيصرية بأمان.', certifications: ['اختصاص النسائية والتوليد'], services: ['متابعة الحمل', 'الولادة الطبيعية والقيصرية', 'فحوصات الرحم والثدي'] },
  { name: 'د. سامر عادل قطريب', specialty: 'الأمراض الباطنية', gender: 'male', experience_years: 20, bio: 'اختصاصي أمراض باطنية وقلبية، متابعة مرضى الضغط والسكري والقلب.', certifications: ['اختصاص الباطنية والقلب'], services: ['متابعة الضغط والسكري', 'تخطيط القلب', 'استشارات القلب'] },
  { name: 'د. ريم سعيد خضور', specialty: 'العينية', gender: 'female', experience_years: 9, bio: 'اختصاصية العينية، فحص الإبصار ومعالجة أمراض العين.', certifications: ['اختصاص طب العيون'], services: ['معاينة النظر', 'وصف النظارات', 'علاج التهاب العين'] },
  { name: 'د. عمر ياسين العلي', specialty: 'الأذن والأنف والحنجرة', gender: 'male', experience_years: 11, bio: 'اختصاصي الأذن والأنف والحنجرة، جراحات الأنف والأذن.', certifications: ['اختصاص أذن أنف حنجرة'], services: ['تنظير الأذن والأنف', 'علاج الدوار', 'اللحمية'] },
  { name: 'د. ناديا حسين شامي', specialty: 'الأمراض الجلدية', gender: 'female', experience_years: 8, bio: 'اختصاصية أمراض جلدية وجمالية.', certifications: ['اختصاص أمراض جلدية'], services: ['علاج حب الشباب', 'معالجة الحساسية الجلدية', 'ليزر'] },
  { name: 'د. كمال سمير درويش', specialty: 'العظمية', gender: 'male', experience_years: 18, bio: 'اختصاصي جراحة العظام والمفاصل والكسور.', certifications: ['اختصاص جراحة العظام'], services: ['علاج الكسور', 'المفاصل', 'الفيزيائية'] },
  { name: 'د. ليلاس عبد الستار', specialty: 'طب عام', gender: 'female', experience_years: 6, bio: 'طبيبة عامة، عيادة يومية للرعاية الأولية.', certifications: ['شهادة الطب العام'], services: ['الرعاية الأولية', 'وصفات العلاج', 'متابعة المرضى المزمنين'] },
]

const docRows = doctors.map((d, i) => ({
  ...base(`doctor-${i + 1}`),
  name: d.name, specialty: d.specialty, gender: d.gender, experience_years: d.experience_years,
  bio: d.bio, certifications: d.certifications, services: d.services, work_hours: workHoursLong(),
  phone: `09${String(3 + i)}${String(420000 + i * 1111)}`, whatsapp: `09${String(3 + i)}${String(420000 + i * 1111)}`,
  address: 'ش. الوحدة، طيبة الإمام', lat: 35.29 + i * 0.0016, lng: 36.99 - i * 0.0009,
  image: [docImg1, docImg2, docImg3, docImg2, docImg1, docImg3, docImg1, docImg2][i],
  sort_order: i, is_verified: i % 3 === 0,
}))
const insertedDoctors = await insert('doctors', docRows)

// ---------- العيادات ----------
const clinics = [
  { name: 'عيادة النور للطب العام', specialty: 'طب عام', services: ['فحص ولي وتحاليل', 'معالجة أمراض موسمية', 'تطعيمات'] },
  { name: 'عيادة الأمل للنسائية', specialty: 'النسائية والتوليد', services: ['متابعة الحمل', 'سونار', 'تناورات رحمية'] },
  { name: 'عيادة القلب وطب الضغط', specialty: 'القلبية', services: ['تخطيط قلب', 'إيكو', 'متابعة الضغط'] },
  { name: 'عيادة السكري والغدد', specialty: 'الغدد والسكري', services: ['متابعة السكري', 'قياس السكر التراكمي', 'الغدة الدرقية'] },
  { name: 'عيادة العظام والكسور', specialty: 'العظمية', services: ['جبائر', 'متابعة كسور', 'حقن مفاصل'] },
  { name: 'عيادة طب الأطفال الحديثة', specialty: 'طب الأطفال', services: ['متابعة رضع', 'لقاحات دورية', 'علاج الحساسية'] },
]
const clinicRows = clinics.map((c, i) => ({
  ...base(`clinic-${i + 1}`),
  name: c.name, specialty: c.specialty, description: `عيادة ${c.name} تقدم خدمات طبية نوعية في طيبة الإمام.`, services: c.services, work_hours: workHours(),
  phone: `09820${String(50100 + i * 170)}`, whatsapp: `09820${String(50100 + i * 170)}`,
  address: 'ش. الجمهورية، طيبة الإمام', lat: 35.291 + i * 0.0014, lng: 36.99 + i * 0.0007,
  image: [clinicImg1, clinicImg2][i % 2], sort_order: i, is_verified: i < 3,
}))
await insert('clinics', clinicRows)

// ---------- المشافي ----------
const hospImg = writeSvg('hospitals', 'h2.svg', 'مشفى الشفاء', 'hospital')
await insert('hospitals', [
  { ...base('hospital-1'), name: 'مشفى المدينة العام', description: 'المشفى العام الرئيسي في طيبة الإمام يقدم خدمات طوارئ 24 ساعة وأقساماً متعددة.', departments: ['الطوارئ', 'الباطنية', 'الجراحة', 'الأطفال', 'التوليد', 'العناية المشددة'], services: ['إسعافات', 'عمليات', 'غسيل كلية', 'مخبر مركزي'], work_hours: { sat: '24 ساعة', sun: '24 ساعة', mon: '24 ساعة', tue: '24 ساعة', wed: '24 ساعة', thu: '24 ساعة', fri: '24 ساعة' }, phone: '0933000100', emergency_phone: '0933000100', address: 'ش. المستشفى، طيبة الإمام', lat: 35.287, lng: 36.986, image: hospitalImg, sort_order: 0, is_verified: true },
  { ...base('hospital-2'), name: 'مشفى الشفاء للنسائية والأطفال', description: 'مشفى متخصص في طب النساء والتوليد وحديثي الولادة.', departments: ['الولادة', 'حديثي الولادة', 'النسائية'], services: ['ولادة طبيعية وقيصرية', 'حضانات', 'استشارات نسائية'], work_hours: { sat: '24 ساعة', sun: '24 ساعة', mon: '24 ساعة', tue: '24 ساعة', wed: '24 ساعة', thu: '24 ساعة', fri: '24 ساعة' }, phone: '0933000150', emergency_phone: '0933000151', address: 'حي الجنوب، طيبة الإمام', lat: 35.286, lng: 36.993, image: hospImg, sort_order: 1 },
])

// ---------- المراكز الصحية ----------
await insert('health_centers', [
  { ...base('health-1'), name: 'المركز الصحي الأول', description: 'مركز رعاية صحية أولية يقدم الخدمات التلقيحية والمتابعة للمرضى المزمنين.', departments: ['عيادة عامة', 'تلقيح', 'متابعة مزمنة'], services: ['تطعيمات وطنية', 'متابعة سكري وضغط', 'فعالية الأطفال'], work_hours: workHours(), phone: '0933001180', address: 'وسط المدينة، طيبة الإمام', lat: 35.292, lng: 36.988, sort_order: 0, image: writeSvg('health', 'h1.svg', 'المركز الصحي', 'health') },
  { ...base('health-2'), name: 'المركز الصحي الثاني - حي الشام', description: 'مركز صحي يخدم أحياء جنوب المدينة.', departments: ['عيادة عامة', 'صحة الأسرة'], services: ['رعاية طفل سليم', 'صحة المرأة'], work_hours: workHours(), phone: '0933001181', address: 'حي الشام، طيبة الإمام', lat: 35.288, lng: 36.997, sort_order: 1 },
])

// ---------- الصيدليات ----------
const pharmacyRows = [
  'صيدلية الشفاء', 'صيدلية النور', 'صيدلية العافية', 'صيدلية الحكيم',
  'صيدلية البركة', 'صيدلية الهدى', 'صيدلية الأمل', 'صيدلية الفيحاء',
].map((name, i) => ({
  ...base(`pharmacy-${i + 1}`),
  name, description: `صيدلية ${name.replace('صيدلية ', '')} توفر الأدوية والمستلزمات الطبية في طيبة الإمام.`,
  services: ['أدوية', 'مستلزمات', 'أدوية مرضى مزمنين'], opening_hours: '9 صباحاً - 11 مساءً',
  phone: `09670${String(50000 + i * 130)}`, address: `شارع ${['الوحدة', 'الجمهورية', 'البحرة', 'الأوتوستراد', 'المشفى', 'السوق', 'حي الشام', 'المدخل الشرقي'][i]}، طيبة الإمام`,
  lat: 35.29 + i * 0.0011, lng: 36.99 + (i % 2 === 0 ? 1 : -1) * 0.0012,
  image: i % 2 === 0 ? pharmacyImg : writeSvg('pharmacies', `p${i + 2}.svg`, 'صيدلية', 'pharmacy'), sort_order: i,
}))
await insert('pharmacies', pharmacyRows)

// ---------- الصيدليات المناوبة (اليوم وما بعده) ----------
const pharmIds = (await sb.from('pharmacies').select('id').limit(8)).data ?? []
if (pharmIds.length) {
  const dutyRows = []
  for (let i = 0; i < 6; i++) {
    dutyRows.push({
      pharmacy_id: pharmIds[i % pharmIds.length].id,
      city_id: city,
      start_date: addDays(i * 3),
      end_date: addDays(i * 3 + 2),
      duty_hours: ['8 مساءً حتى 8 صباحاً', 'من 7 مساءً حتى 7 صباحاً', 'منتصف الليل حتى 8 صباحاً'][i % 3],
      notes: 'مناوبة ليلية خارج أوقات الدوام الرسمي',
      is_active: true, created_at: now, updated_at: now,
    })
  }
  await insert('duty_pharmacies', dutyRows)
}

// ---------- المخابر ----------
await insert('labs', [
  { ...base('lab-1'), name: 'مخبر المدينة الطبي', description: 'مخبر تحاليل طبية مجهز بأحدث الأجهزة.', services: ['تحاليل دم كاملة', 'كيمياء حيوية', 'هرمونات', 'زراعة'], tests: ['CBC', 'سكر تراكمي', 'وظائف كبد وكلى', 'تحاليل للد', 'فيتامين D'], opening_hours: '8 صباحاً - 8 مساءً', phone: '0941000230', address: 'ش. الوحدة، طيبة الإمام', lat: 35.2895, lng: 36.9895, sort_order: 0, image: writeSvg('labs', 'l1.svg', 'المخبر الطبي', 'lab') },
  { ...base('lab-2'), name: 'مخبر الأمان للأحياء الدقيقة', description: 'متخصص في زراعة الأحياء الدقيقة والتحاليل الدقيقة.', services: ['زراعة جرثومة', 'مضاد حيوي حساسية', 'تحاليل نسائية'], tests: ['زراعة بول', 'زراعة خراج', 'حساسية دوائية'], opening_hours: '9 صباحاً - 7 مساءً', phone: '0941000231', address: 'ش. الجمهورية، طيبة الإمام', lat: 35.291, lng: 36.991, sort_order: 1 },
  { ...base('lab-3'), name: 'مخبر البرج الحديث', description: 'تحاليل شاملة مع خدمة طلب النتائج عبر واتساب.', services: ['تحاليل شاملة', 'تحاليل بيتي', 'صحة عامة'], tests: ['وظائف غدة درقية', 'تحاليل السكري الكاملة', 'مخزون الحديد'], opening_hours: '8 صباحاً - 9 مساءً', phone: '0941000232', address: 'المدخل الشرقي، طيبة الإمام', lat: 35.29, lng: 36.994, sort_order: 2 },
])

// ---------- مراكز الأشعة ----------
await insert('radiology_centers', [
  { ...base('radiology-1'), name: 'مركز الأشعة الحديث', description: 'تصوير شعاعي وأمواج صوتية بجودة عالية.', services: ['إيكو', 'أشعة عادية', 'دوبلر'], machines: ['جهاز إيكو Philips', 'أشعة ديجيتال'], opening_hours: '9 صباحاً - 8 مساءً', phone: '0935000120', address: 'ش. المشفى، طيبة الإمام', lat: 35.2865, lng: 36.987, sort_order: 0, image: writeSvg('radiology', 'r1.svg', 'مركز الأشعة', 'radiology') },
  { ...base('radiology-2'), name: 'مركز الشفاء التصويري', description: 'تصوير مقطعي محوري وأشعة متخصصة.', services: ['CTT', 'أشعة عادية', 'تصوير هرموني'], machines: ['مفراس'], opening_hours: '8 صباحاً - 9 مساءً', phone: '0935000121', address: 'حي الشام، طيبة الإمام', lat: 35.288, lng: 36.996, sort_order: 1 },
])

// ---------- المقالات ----------
const articles = [
  { title: 'نصائح لتقوية مناعة الأطفال في الشتاء', cat: 'kids', excerpt: 'كيف تحمي طفلك من الأمراض الموسمية في فصل الشتاء.', content: '<h2>مناعة الأطفال</h2><p>احرص على التغذية المتوازنة الغنية بالفواكه والخضار، ونام الطفل لساعات كافية، وشجع على النشاط البدني في الهواء الطلق.</p><ul><li>غسل اليدين بانتظام</li><li>تجنب الأماكن المزدحمة</li><li>إجراء التطعيمات في موعدها</li></ul>' },
  { title: 'كيف تتعامل مع ارتفاع الضغط؟', cat: 'hypertension', excerpt: 'دليل عملي للمصابين بارتفاع ضغط الدم.', content: '<h2>ارتفاع الضغط</h2><p>قلل الملح في الطعام، حافظ على الوزن، مارس الرياضة 30 دقيقة يومياً، والتزم بالأدوية الموصوفة.</p><p>تابع قياس الضغط يومياً وسجل النتائج لعرضها على الطبيب.</p>' },
  { title: 'السكري: معلومات أساسية لكل مريض', cat: 'diabetes', excerpt: 'كل ما يجب أن تعرفه عن مرض السكري وضبطه.', content: '<h2>مرض السكري</h2><p>يؤثر السكري على طريقة استخدام الجسم للسكر. تتضمن الإدارة الجيدة: قياس السكر بانتظام، التغذية الصحية، المشي اليومي، وأخذ الأدوية أو الأنسولين بانتظام.</p>' },
  { title: 'تغذية الحامل في الأشهر الأولى', cat: 'women', excerpt: 'أهم المكملات والأطعمة لصحة الأم والجنين.', content: '<h2>تغذية الحامل</h2><p>احرصي على حمض الفوليك في الأشهر الثلاثة الأولى، والحديد في منتصف الحمل، وأطعمة غنية بالكالسيوم والبروتين طوال الحمل.</p>' },
  { title: 'علامات السكتة الدماغية وكيفية التصرف', cat: 'heart', excerpt: 'التعرف المبكر على السكتة الدماغية ينقذ الحياة.', content: '<h2>علامات السكتة</h2><p>تذكر: FACE — وجه (تدلي الوجه)، ذراع (ضعف الذراع)، كلام (صعوبة الكلام)، الوقت. عند ظهور أي علامة توجه فوراً للطوارئ.</p>' },
  { title: 'الصحة النفسية: متى أطلب المساعدة؟', cat: 'mental-health', excerpt: 'التعامل الصحي مع القلق والاكتئاب.', content: '<h2>الصحة النفسية</h2><p>إن شعور الحزن والقلق المستمر لأكثر من أسبوعين يستدعي مراجعة مختص. تحدث مع عائلتك ولا تتردد بالطلب المساعدة المهنية.</p>' },
  { title: 'الإسعافات الأولية للحروق المنزلية', cat: 'first-aid', excerpt: 'خطوات آمنة لمعالجة الحروق البسيطة.', content: '<h2>الحروق</h2><p>اغسل الحرق بماء بارد 10-15 دقيقة، لا تستخدم الثلج مباشرة، غطِ الحرق بضماد نظيف، ولا تفتح الفقاعات.</p>' },
  { title: 'الوقاية من أمراض الشتاء الموسمية', cat: 'prevention', excerpt: 'عادات صحية تقي من الزكام والإنفلونزا.', content: '<h2>الوقاية الشتوية</h2><p>احصل على لقاح الإنفلونزا الموسمي، واغسل يديك باستمرار، وتهوية المنازل يومياً، وشرب السوائل الدافئة.</p>' },
  { title: 'استخدام المضادات الحيوية بشكل صحيح', cat: 'medications', excerpt: 'لماذا لا تعالج المضادات الفيروسات؟', content: '<h2>المضادات الحيوية</h2><p>تستخدم المضادات الحيوية للبكتيريا فقط وليست فعالة ضد الفيروسات. لا توقف العلاج بجرعة قبل موعدها ولا تتشارك الدواء مع الآخرين.</p>' },
  { title: 'الرياضة وصحة القلب', cat: 'sports', excerpt: 'نشاط بدني مناسب لكل الأعمار.', content: '<h2>الرياضة</h2><p>المشي 30 دقيقة يومياً يقلل أمراض القلب والسكري. ابدأ تدريجياً واستشر طبيبك قبل برامج التمارين القوية خاصة مع وجود أمراض مزمنة.</p>' },
]
const articleRows = articles.map((a, i) => ({
  title: a.title, slug: `article-${i + 1}`, category_id: CATS[a.cat] ?? null,
  image: writeSvg('articles', `art${i + 1}.svg`, 'مقال', 'article'),
  excerpt: a.excerpt, content: a.content, is_published: true, is_featured: i < 3,
  published_at: addDays(-i), seo_title: a.title,
  view_count: Math.floor(Math.random() * 300), created_at: now, updated_at: now,
}))
await insert('articles', articleRows)

// ---------- الأسئلة والأجوبة ----------
const questions = [
  ['ما علاج السعال؟', 'يعتمد علاج السعال على سببه: عادةً يزول السعال الناتج عن الزكام خلال أسبوع أو أسبوعين. يمكن استخدام العسل والمشروبات الدافئة لتخفيف الأعراض، مع تجنب التبغ. إذا استمر السعال أكثر من ثلاثة أسابيع أو كان مصحوباً ببلغم مدموم أو ألم صدر، راجع الطبيب.', ['سعال', 'كحة', 'كحه', 'سعال جاف', 'سعال شديد']],
  ['كيف أخفض ضغط الدم؟', 'تخفيف الملح، خسارة الوزن الزائد، النشاط البدني المنتظم، تقليل الكافيين والإقلاع عن التدخين. مع الالتزام بأدوية الضغط التي يصفها الطبيب وقياس الضغط بانتظام.', ['ضغط', 'ضغط الدم', 'ارتفاع الضغط', 'قلب']],
  ['ما أعراض السكري؟', 'العطش الشديد، كثرة التبول، فقدان الوزن دون سبب، التعب، وعدم وضوح الرؤية. عند ظهور هذه الأعراض يفضل إجراء فحص سكر الدم التراكمي.', ['سكري', 'السكر', 'سكر الدم', 'تراكمي']],
  ['متى يتوقف نزيف الأنف؟', 'اجلس واضبط الوضع، امل الرأس للأمام قليلاً، اضغط على الأنف لمدة 10 دقائق. إذا استمر النزيف أكثر من 20 دقيقة أو تكرر بكثرة راجع الطبيب.', ['نزيف', 'رعاف', 'أنف', 'نزيف الأنف']],
  ['كيف أتعامل مع الحمى عند طفلي؟', 'راقب حالة الطفل وحافظ على ترطيبه بالسوائل، واستخدم خافض الحرارة المناسب لعمره حسب تعليمات الطبيب. إذا تجاوزت الحرارة 39° أو استمرت أكثر من 3 أيام أو ظهر طفح أو تشنج راجع الطبيب فوراً.', ['حمى', 'طفل', 'حرارة', 'سخونة']],
  ['ما علاج الإمساك؟', 'الإكثار من الماء والألياف (خضار، فواكه، حبوب كاملة)، الرياضة اليومية، وتحديد موعد ثابت للحمام. يمكن استخدام الملينات الخفيفة بعد استشارة الصيدلي.', ['إمساك', 'بطن', 'جهاز هضمي', 'هضم']],
  ['كيف أوقف ألم الأسنان؟', 'اشطف الفم بماء دافئ، استخدم خيط الأسنان، ومسكن بسيط (باراسيتامول). تجنب الحرارة العالية. الألم المستمر يتطلب فحصاً عند طبيب الأسنان.', ['ألم أسنان', 'أسنان', 'ضرس', 'ألم ضرس']],
  ['ما علاج حرقة المعدة؟', 'تناول وجبات صغيرة، تجنب الأطعمة الحارة والدهنية والشاي على الريق، وارفع الرأس أثناء النوم. مضادات الحموضة المتوفرة صيدلياً تساعد مؤقتاً. سريعة التكرار؟ راجع الطبيب.', ['حرقة', 'معدة', 'حموضة', 'ارتجاع']],
  ['كيف أخفف آلام الدورة الشهرية؟', 'كمادات دافئة على البطن، مسكنات بسيطة، وشاي بالأعشاب، مع راحة كافية. الآلام الشديدة غير المحتملة تستدعي تقييم طبيب نسائية.', ['دورة', 'دورة شهرية', 'آلام الدورة', 'نسائية']],
  ['ما إجراء الصداع النصفي؟', 'البعد عن المحفزات (الضوء، الضوء الشديد، الأصوات)، ومسكنات خلال بدايات النوبة، والراحة في مكان هادئ. التكرار المتزايد يستدعي مشورة طبيب الأعصاب.', ['صداع', 'نصفي', 'رأس', 'شقيقة']],
  ['نسبة فيتامين د الطبيعية؟', 'تتراوح المعدلات الطبيعية غالباً بين 30-50 نانوغرام/مل (الحدود تختلف بين المخابر). نقص فيتامين د شائع، يعالَج غالباً بمكملات مع مراجعة مختص.', ['فيتامين د', 'فيتامين', 'نقص فيتامين']],
  ['ما أعراض فقر الدم؟', 'التعب والإرهاق، شحوب البشرة، الدوخة، سرعة التعب مع الجهد، وضيق النفس. يُشخَّص بفحص CBC. يعتمد العلاج على السبب (نقص حديد، فولات، B12…).', ['فقر دم', 'أنيميا', 'دم', 'حبأ الحديد']],
]

for (const [q, a, kw] of questions) {
  const { data, error } = await sb.from('medical_questions').insert({ question: q, answer: a, is_active: true, created_at: now, updated_at: now }).select('id').single()
  if (!error && data) {
    await sb.from('medical_keywords').insert(kw.map((keyword) => ({ question_id: data.id, keyword })))
    console.log('✓ سؤال:', q.slice(0, 30))
  }
}

// ---------- إعدادات ----------
await sb.from('app_settings').upsert({ key: 'site', value: { subscriptions_enabled: false, notification_email: '' } })

// ---------- حساب المدير (اختياري) ----------
const adminEmail = process.env.ADMIN_EMAIL
const adminPass = process.env.ADMIN_PASSWORD
if (adminEmail && adminPass) {
  const { data: user, error } = await sb.auth.admin.createUser({
    email: adminEmail,
    password: adminPass,
    email_confirm: true,
    user_metadata: { name: 'مدير المنصة' },
  })
  if (error && error.message.includes('already')) {
    console.log('⚠ حساب المدير موجود مسبقاً')
    const { data: existing } = await sb.auth.admin.listUsers()
    const u = existing?.users.find((x) => x.email === adminEmail)
    if (u) await sb.from('profiles').upsert({ id: u.id, name: 'مدير المنصة', is_admin: true })
  } else if (user) {
    await sb.from('profiles').upsert({ id: user.id, name: 'مدير المنصة', is_admin: true })
    console.log('✓ تم إنشاء حساب المدير:', adminEmail)
  }
}

console.log('\nاكتمل الإدخال التجريبي بنجاح ✓')