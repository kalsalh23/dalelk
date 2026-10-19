const token = process.env.SUPABASE_MANAGEMENT_TOKEN
const projectRef = process.env.SUPABASE_PROJECT_REF
const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ query: "SELECT proname FROM pg_proc WHERE proname LIKE 'book%' OR proname LIKE 'taken%' OR proname LIKE 'bridge%'" }),
})
console.log(await res.text())