import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const DEMO_STORAGE_KEY = 'ruang_demo_session'

function createMockSession(name = 'Marco', email = 'marco@ruangpribadi.id'): Session {
  const user: User = {
    id: '00000000-0000-0000-0000-000000000001',
    app_metadata: { provider: 'demo' },
    user_metadata: {
      full_name: name,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: email,
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  }

  return {
    access_token: 'demo-access-token',
    token_type: 'bearer',
    expires_in: 86400 * 30,
    refresh_token: 'demo-refresh-token',
    user,
    expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
  }
}

function createGoogleMockSession(name = 'Marco', email = 'marco@gmail.com'): Session {
  const user: User = {
    id: '00000000-0000-0000-0000-000000000001',
    app_metadata: { provider: 'google' },
    user_metadata: {
      full_name: name,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: email,
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  }

  return {
    access_token: 'google-simulated-token',
    token_type: 'bearer',
    expires_in: 86400 * 30,
    refresh_token: 'google-simulated-refresh-token',
    user,
    expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
  }
}

type AuthContextValue = {
  session: Session | null
  loading: boolean
  isDemo: boolean
  signInWithGoogle: () => Promise<void>
  signInGoogleDirect: (name?: string, email?: string) => void
  signInDemo: (name?: string) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem(DEMO_STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved) as Session
      } catch {
        return null
      }
    }
    return null
  })

  // If URL has OAuth access_token in hash, remain in loading state while exchanging
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      return true
    }
    return Boolean(supabase && !session)
  })

  useEffect(() => {
    // If we have demo session and no OAuth hash, don't block
    if (session?.user?.app_metadata?.provider === 'demo' && (!window.location.hash || !window.location.hash.includes('access_token'))) {
      setLoading(false)
      return
    }

    if (!supabase) {
      setLoading(false)
      return
    }

    // 1. Explicitly check and recover OAuth access_token from URL hash
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      if (accessToken && refreshToken) {
        setLoading(true)
        void supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .then(({ data }) => {
            if (data?.session) {
              localStorage.removeItem(DEMO_STORAGE_KEY)
              setSession(data.session)
              // Clean up token hash from browser address bar
              window.history.replaceState(null, '', window.location.pathname)
            }
            setLoading(false)
          })
          .catch(() => {
            setLoading(false)
          })
      }
    } else {
      void supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setSession(data.session)
        }
        setLoading(false)
      })
    }

    // 2. Listen to real-time auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession) {
        localStorage.removeItem(DEMO_STORAGE_KEY)
        setSession(nextSession)
      }
      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!supabase) {
      throw new Error('Supabase client belum terkonfigurasi. Cek .env file.')
    }
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/`
      : 'https://fand-t.vercel.app/'

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) throw error
  }

  const signInDemo = (name = 'Marco') => {
    const mock = createMockSession(name)
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(mock))
    setSession(mock)
  }

  const signInGoogleDirect = (name = 'Marco', email = 'marco@gmail.com') => {
    const mock = createGoogleMockSession(name, email)
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(mock))
    setSession(mock)
  }

  const signOut = async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY)
    setSession(null)
    if (supabase) {
      await supabase.auth.signOut().catch(() => {})
    }
  }

  const isDemo = session?.user?.app_metadata?.provider === 'demo'

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isDemo,
        signInWithGoogle,
        signInGoogleDirect,
        signInDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider')
  return context
}
