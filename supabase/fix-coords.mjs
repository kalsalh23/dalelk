// تصحيح إحداثيات الكيانات لتطابق الشوارع الحقيقية في طيبة الإمام
// المركز الحقيقي للمدينة (OSM node): 35.2662637, 36.7118709
// الشارع الرئيسي (secondary) يمتد عمودياً عند خطّ طول ≈ 36.712
// الاستخدام: node supabase/fix-coords.mjs (دخول كمدير)
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmail = process.env.ADMIN_EMAIL || 'admin@dalil.com'
const adminPass = process.env.ADMIN_PASSWORD || 'dalil@2026'

if (!url || !anonKey) {
  console.error('أعد تعيين SUPABASE_URL و SUPABASE_ANON_KEY')
  process.exit(1)
}

const sb = createClient(url.replace(/\/rest\/v1\/?$/, ''), serviceKey || anonKey, {
  auth: { persistSession: false },
})

if (!serviceKey) {
  const { error } = await sb.auth.signInWithPassword({ email: adminEmail, password: adminPass })
  if (error) {
    console.error('تعذّر تسجيل دخول المدير:', error.message)
    process.exit(1)
  }
}

// كل كيان يُثبَّت على شارع حقيقي (إحداثيات من شبكة الطرق OSM لمدينة طيبة الإمام)
const POINTS = {
  doctors: [
    { slug: 'taybet-doctor-1', lat: 35.26452, lng: 36.71258, address: 'الشارع الرئيسي، طيبة الإمام' },   // هشام الخطاب
    { slug: 'taybet-doctor-2', lat: 35.26507, lng: 36.71214, address: 'الشارع الرئيسي، طيبة الإمام' },   // علي عبد الرحمن
    { slug: 'taybet-doctor-3', lat: 35.26561, lng: 36.71262, address: 'الشارع الرئيسي، طيبة الإمام' },   // مصطفى اليوسف
    { slug: 'taybet-doctor-4', lat: 35.26382, lng: 36.71172, address: 'شارع السوق، طيبة الإمام' },       // أحمد العتر
    { slug: 'taybet-doctor-5', lat: 35.26621, lng: 36.71157, address: 'وسط المدينة، طيبة الإمام' },      // محمد نجيب الخطيب
    { slug: 'taybet-doctor-6', lat: 35.26631, lng: 36.71187, address: 'مستوصف طيبة الإمام، وسط المدينة' }, // سامي الرحال
    { slug: 'taybet-doctor-7', lat: 35.26488, lng: 36.71165, address: 'الشارع الرئيسي، طيبة الإمام' },   // همام سليمان
    { slug: 'taybet-doctor-8', lat: 35.26683, lng: 36.71217, address: 'الشارع الرئيسي، طيبة الإمام' },   // أيمن العبد الله
  ],
  pharmacies: [
    { slug: 'taybet-pharm-1', lat: 35.26494, lng: 36.71224, address: 'الشارع الرئيسي، طيبة الإمام' },   // بهاء الخطيب
    { slug: 'taybet-pharm-2', lat: 35.26551, lng: 36.71161, address: 'وسط المدينة، طيبة الإمام' },       // هالة كربجها
    { slug: 'taybet-pharm-3', lat: 35.26612, lng: 36.71248, address: 'الشارع الرئيسي، طيبة الإمام' },   // أحمد العيسى
    { slug: 'taybet-pharm-4', lat: 35.26688, lng: 36.71193, address: 'وسط المدينة، طيبة الإمام' },       // ندى الرحال
    { slug: 'taybet-pharm-5', lat: 35.26626, lng: 36.71231, address: 'الشارع الرئيسي، طيبة الإمام' },   // رابعة اليوسف
    { slug: 'taybet-pharm-6', lat: 35.26570, lng: 36.71202, address: 'الشارع الرئيسي، طيبة الإمام' },   // ياسمين الكيال
    { slug: 'taybet-pharm-7', lat: 35.26421, lng: 36.71181, address: 'شارع السوق، طيبة الإمام' },       // محمد العيسى
    { slug: 'taybet-pharm-8', lat: 35.26601, lng: 36.71139, address: 'وسط المدينة، طيبة الإمام' },       // غالب الحامد
    { slug: 'taybet-pharm-9', lat: 35.26719, lng: 36.70802, address: 'طريق صوران — مقابل عيادة د. محمود العبد الله' }, // محمد الخضر
  ],
}

let ok = 0
for (const [table, rows] of Object.entries(POINTS)) {
  for (const p of rows) {
    const { data, error } = await sb
      .from(table)
      .update({ lat: p.lat, lng: p.lng, address: p.address })
      .eq('slug', p.slug)
    if (error) {
      console.error(`✗ ${table}/${p.slug}:`, error.message)
    } else {
      console.log(`✓ ${table}/${p.slug} → ${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`)
      ok++
    }
  }
}

// المستوصف والمركز الصحي والمختبر على إحداثيات المركز الحقيقي
for (const [table, slug, lat, lng, addr] of [
  ['health_centers', 'taybet-health-1', 35.2662637, 36.7118709, 'وسط المدينة، طيبة الإمام'],
  ['hospitals', 'taybet-hosp-1', 35.26465, 36.71235, 'الشارع الرئيسي، طيبة الإمام'],
  ['labs', 'taybet-lab-1', 35.26670, 36.71262, 'وسط المدينة، طيبة الإمام'],
]) {
  const { error } = await sb.from(table).update({ lat, lng, address: addr }).eq('slug', slug)
  if (error) console.error(`✗ ${table}/${slug}:`, error.message)
  else { console.log(`✓ ${table}/${slug} → ${lat.toFixed(6)}, ${lng.toFixed(6)}`); ok++ }
}

console.log(`\nانهيت تحديث ${ok} كياناً ✓`)