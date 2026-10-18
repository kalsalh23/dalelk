import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCurrentProfile, signOut } from '@/services/admin'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import type { Session } from '@supabase/supabase-js'

interface AdminAuthValue {
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthValue>({
  profile: null,
  loading: true,
  isAdmin: false,
  refresh: async () => undefined,
  logout: async () => undefined,
})

export const useAdminAuth = () => useContext(AdminAuthContext)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    const p = await getCurrentProfile()
    setProfile(p)
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
    const { data } = supabase.auth.onAuthStateChange((event: string, _session: Session | null) => {
      if (event === 'SIGNED_IN') void refresh()
      if (event === 'SIGNED_OUT') setProfile(null)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await signOut()
    setProfile(null)
  }

  return (
    <AdminAuthContext.Provider value={{ profile, loading, isAdmin: Boolean(profile?.is_admin), refresh, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}