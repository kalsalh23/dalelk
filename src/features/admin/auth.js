import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentProfile, signOut } from '@/services/admin';
import { supabase } from '@/lib/supabase';
const AdminAuthContext = createContext({
    profile: null,
    loading: true,
    isAdmin: false,
    refresh: async () => undefined,
    logout: async () => undefined,
});
export const useAdminAuth = () => useContext(AdminAuthContext);
export function AdminAuthProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const refresh = async () => {
        const p = await getCurrentProfile();
        setProfile(p);
        setLoading(false);
    };
    useEffect(() => {
        void refresh();
        const { data } = supabase.auth.onAuthStateChange((event, _session) => {
            if (event === 'SIGNED_IN')
                void refresh();
            if (event === 'SIGNED_OUT')
                setProfile(null);
        });
        return () => data.subscription.unsubscribe();
    }, []);
    const logout = async () => {
        await signOut();
        setProfile(null);
    };
    return (_jsx(AdminAuthContext.Provider, { value: { profile, loading, isAdmin: Boolean(profile?.is_admin), refresh, logout }, children: children }));
}
