// يطبّق schema.sql على مشروع سوبابيس عبر Management API
// الاستخدام: SUPABASE_MANAGEMENT_TOKEN=... SUPABASE_PROJECT_REF=... node supabase/apply.mjs
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const token = process.env.SUPABASE_MANAGEMENT_TOKEN
const projectRef = process.env.SUPABASE_PROJECT_REF

if (!token || !projectRef) {
  console.error('أعد تعيين SUPABASE_MANAGEMENT_TOKEN و SUPABASE_PROJECT_REF')
  process.exit(1)
}

const sql = await readFile(join(__dirname, 'schema.sql'), 'utf8')
const storageSql = await readFile(join(__dirname, 'storage.sql'), 'utf8')

async function run(label, query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  })
  const text = await res.text()
  if (!res.ok) {
    // تجاهل الأخطاء الناتجة عن التطبيق المسبق (policy/table موجودة)
    if (text.includes('already exists') || text.includes('42710') || text.includes('42P07')) {
      console.log(`⚠ ${label}: موجودة مسبقاً (تم تجاهلها)`)
      return
    }
    console.error(`فشل التطبيق (${label}):`, res.status)
    console.error(text.slice(0, 3000))
    process.exit(1)
  }
  console.log(`تم تطبيق ${label} بنجاح ✓`)
}

await run('schema.sql', sql)
await run('storage.sql', storageSql)