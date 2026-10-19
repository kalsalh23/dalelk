// Seed test data into Supabase via Management API
// Usage: SUPABASE_MANAGEMENT_TOKEN=... SUPABASE_PROJECT_REF=... node supabase/seed-via-api.mjs
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const token = process.env.SUPABASE_MANAGEMENT_TOKEN
const projectRef = process.env.SUPABASE_PROJECT_REF

if (!token || !projectRef) {
  console.error('Set SUPABASE_MANAGEMENT_TOKEN and SUPABASE_PROJECT_REF')
  process.exit(1)
}

const API = `https://api.supabase.com/v1/projects/${projectRef}/database/query`

async function q(sql) {
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: sql }),
  })
  const t = await r.text()
  if (!r.ok && !t.includes('already exists') && !t.includes('42710') && !t.includes('42701') && !t.includes('42P07')) {
    console.error('FAIL:', t.slice(0, 300))
    return null
  }
  try { return JSON.parse(t) } catch { return [] }
}

const now = new Date().toISOString()
const wh = `jsonb_build_object('sat','9:00 - 17:00','sun','9:00 - 17:00','mon','9:00 - 17:00','tue','9:00 - 17:00','wed','9:00 - 17:00','thu','9:00 - 17:00','fri','closed')`

// Categories
const catSlugs = ['kids', 'women', 'nutrition', 'heart', 'diabetes', 'hypertension', 'mental-health', 'sports', 'prevention', 'medications', 'first-aid']
const catNames = ['Children', 'Women', 'Nutrition', 'Heart', 'Diabetes', 'Blood Pressure', 'Mental Health', 'Sports', 'Prevention', 'Medications', 'First Aid']
for (let i = 0; i < catSlugs.length; i++) {
  await q(`INSERT INTO public.categories (name, slug, type, sort_order, is_active) VALUES ('${catNames[i]}', '${catSlugs[i]}', 'specialty', ${i}, true) ON CONFLICT DO NOTHING`)
}
console.log('OK categories')

// City
await q(`INSERT INTO public.cities (name, slug, lat, lng, is_active) VALUES ('Taybeh', 'taybet-al-imam', 32.6667, 36.0, true) ON CONFLICT DO NOTHING`)
console.log('OK city')

// Doctors (use RETURNING to get real UUIDs)
const doctors = [
  { name: 'Dr Ahmad', slug: 'dr-ahmad-khalil', specialty: 'Pediatrics', cat: 'kids', phone: '0933123456' },
  { name: 'Dr Faten', slug: 'dr-faten-saad', specialty: 'Gynecology', cat: 'women', phone: '0933654321' },
  { name: 'Dr Samer', slug: 'dr-samer-hani', specialty: 'Cardiology', cat: 'heart', phone: '0933111222' },
]
const doctorIds = []
for (const d of doctors) {
  const rows = await q(`INSERT INTO public.doctors (city_id, name, slug, specialty, specialty_category_id, gender, bio, description, experience_years, certifications, services, work_hours, phone, whatsapp, address, lat, lng, image, is_active, is_verified, plan, created_at, updated_at) SELECT c.id, '${d.name}', '${d.slug}', '${d.specialty}', cat.id, 'male', 'Professional doctor', 'Professional doctor', 10, '{}', '{}', ${wh}, '${d.phone}', '${d.phone}', 'Taybeh', 32.6667, 36.0, '/images/doctors/d1.svg', true, false, 'free', '${now}', '${now}' FROM public.cities c, public.categories cat WHERE c.slug='taybet-al-imam' AND cat.slug='${d.cat}' RETURNING id`)
  if (rows && rows[0]) { doctorIds.push(rows[0].id); console.log(`OK doctor ${d.name} (${rows[0].id})`) }
}

// Bridge map
if (doctorIds[0]) {
  await q(`INSERT INTO public.bridge_doctor_map (platform_doctor_id, enabled, created_at) VALUES ('${doctorIds[0]}', true, '${now}') ON CONFLICT DO NOTHING`)
  console.log('OK bridge_doctor_map linked')
}

console.log('Seed complete')