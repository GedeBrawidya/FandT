import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const DEMO_STORAGE_KEY = 'ruang_demo_session'
const AUTH_SESSION_KEY = 'fandt_auth_session'

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

function parseOAuthHash(hash: string): Session | null {
  try {
    if (!hash || !hash.includes('access_token')) return null
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const expiresIn = Number(params.get('expires_in') || 3600)
    const expiresAt = Number(params.get('expires_at') || Math.floor(Date.now() / 1000) + expiresIn)
    const tokenType = params.get('token_type') || 'bearer'

    if (!accessToken) return null

    const parts = accessToken.split('.')
    if (parts.length !== 3) return null

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const json = new TextDecoder().decode(bytes)
    const payload = JSON.parse(json)

    const user: User = {
      id: payload.sub,
      aud: payload.aud,
      email: payload.email,
      phone: payload.phone || '',
      created_at: new Date((payload.iat || 0) * 1000).toISOString(),
      role: payload.role || 'authenticated',
      app_metadata: payload.app_metadata || {},
      user_metadata: payload.user_metadata || {},
      updated_at: new Date().toISOString(),
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken || '',
      expires_in: expiresIn,
      expires_at: expiresAt,
      token_type: 'bearer',
      user,
    }
  } catch {
    return null
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

    // 1. Immediately extract OAuth session if present in URL hash (synchronous, zero-delay)
    if (window.location.hash.includes('access_token')) {
      const oauthSession = parseOAuthHash(window.location.hash)
      if (oauthSession) {
        try {
          localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(oauthSession))
        } catch {}
        return oauthSession
      }
    }

    // 2. Synchronously read cached active auth session (Google OAuth etc.)
    const savedAuth = localStorage.getItem(AUTH_SESSION_KEY)
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth) as Session
        // Check if session has not expired (or if expires_at is far future)
        if (!parsed.expires_at || parsed.expires_at * 1000 > Date.now()) {
          return parsed
        }
      } catch {
        localStorage.removeItem(AUTH_SESSION_KEY)
      }
    }

    // 3. Fallback to demo session
    const savedDemo = localStorage.getItem(DEMO_STORAGE_KEY)
    if (savedDemo) {
      try {
        return JSON.parse(savedDemo) as Session
      } catch {
        return null
      }
    }
    return null
  })

  // If we already have a session, loading is false!
  const [loading, setLoading] = useState(Boolean(supabase && !session))

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

    // If OAuth hash was present, persist into Supabase client & clean address bar
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      if (accessToken && refreshToken) {
        void supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ data }) => {
          if (data?.session) {
            try {
              localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(data.session))
            } catch {}
            setSession(data.session)
          }
        }).catch(() => {})
      }
      // Clean up hash fragment from address bar smoothly
      window.history.replaceState(null, '', window.location.pathname)

      // If user landed on /login with valid session, redirect smoothly to root
      if (window.location.pathname === '/login') {
        window.history.replaceState(null, '', '/')
      }
    }

    // 1. Recover session from Supabase storage
    void supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        localStorage.removeItem(DEMO_STORAGE_KEY)
        try {
          localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(data.session))
        } catch {}
        setSession(data.session)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // 2. Real-time auth changes listener
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (nextSession) {
        localStorage.removeItem(DEMO_STORAGE_KEY)
        try {
          localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(nextSession))
        } catch {}
        setSession(nextSession)
        if (typeof window !== 'undefined' && window.location.pathname === '/login') {
          window.history.replaceState(null, '', '/')
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(AUTH_SESSION_KEY)
        localStorage.removeItem(DEMO_STORAGE_KEY)
        setSession(null)
      }
      setLoading(false)
    })

    // 3. Safety timeout to prevent infinite loading state
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => {
      listener.subscription.unsubscribe()
      clearTimeout(timeout)
    }
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
    localStorage.removeItem(AUTH_SESSION_KEY)
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(mock))
    setSession(mock)
  }

  const signInGoogleDirect = (name = 'Marco', email = 'marco@gmail.com') => {
    const mock = createGoogleMockSession(name, email)
    localStorage.removeItem(AUTH_SESSION_KEY)
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(mock))
    setSession(mock)
  }

  const signOut = async () => {
    localStorage.removeItem(AUTH_SESSION_KEY)
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
