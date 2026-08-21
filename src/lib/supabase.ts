import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const getPublicUrl = (path: string | null | undefined): string | null => {
  if (!path) return null
  if (path.startsWith('http')) return path
  if (path.startsWith('/')) return path
  // المسار المخزن مثل "doctors/123.jpg" → نحتاج بادئة bucket
  const clean = path.replace(/^medical\//, '')
  // استخدم SDK للحصول على URL صحيح مع bucket
  try {
    const { data } = supabase.storage.from('medical').getPublicUrl(clean)
    if (data?.publicUrl) return data.publicUrl
  } catch {
    // fallback
  }
  return `${supabaseUrl}/storage/v1/object/public/medical/${clean}`
}