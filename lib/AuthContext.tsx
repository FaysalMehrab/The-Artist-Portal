'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Model, AgencyProfile } from '@/types'

interface AuthContextType {
  user: User | null
  session: Session | null
  role: 'model' | 'agency' | null
  modelProfile: Model | null
  agencyProfile: AgencyProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, role: null,
  modelProfile: null, agencyProfile: null, loading: true,
  signOut: async () => {}, refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<'model' | 'agency' | null>(null)
  const [modelProfile, setModelProfile] = useState<Model | null>(null)
  const [agencyProfile, setAgencyProfile] = useState<AgencyProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    // Use maybeSingle() — returns null instead of 406 error when no row found
    const { data: model } = await supabase
      .from('models').select('*').eq('id', userId).maybeSingle()
    if (model) {
      setRole('model'); setModelProfile(model); setAgencyProfile(null); return
    }
    const { data: agency } = await supabase
      .from('agency_profiles').select('*').eq('id', userId).maybeSingle()
    if (agency) {
      setRole('agency'); setAgencyProfile(agency); setModelProfile(null); return
    }
    setRole(null); setModelProfile(null); setAgencyProfile(null)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setRole(null); setModelProfile(null); setAgencyProfile(null) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setSession(null); setRole(null)
    setModelProfile(null); setAgencyProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, role, modelProfile, agencyProfile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
