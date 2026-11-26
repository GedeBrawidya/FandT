import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth'
import { FandtLogo } from '@/components/fandt-logo'
import {
  AlertCircle,
  Sparkles,
  Loader2,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react'
import { useTheme } from '@/lib/theme'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

export function LoginPage() {
  const { session, loading, signInWithGoogle, signInDemo } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const hasError = Boolean(errorMessage)

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true })
    }
  }, [session, navigate])

  // If auth is loading and there's no error, show quick verifying screen
  if (loading && !errorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F6F1E8] dark:bg-[#090A0D] text-stone-900 dark:text-stone-100 transition-colors">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <FandtLogo size="lg" />
          <div className="flex items-center gap-2.5 text-xs font-bold text-stone-600 dark:text-stone-300">
            <Loader2 size={18} className="animate-spin text-amber-500" />
            <span>Memverifikasi akun Google…</span>
          </div>
        </div>
      </div>
    )
  }

  // Intercept any URL error parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const err =
        searchParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error_description') ||
        hashParams.get('error')

      if (err) {
        setErrorMessage(decodeURIComponent(err.replace(/\+/g, ' ')))
      }
    }
  }, [])

  const handleSignInGoogle = async () => {
    setErrorMessage(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect with Google'
      setErrorMessage(msg)
      setGoogleLoading(false)
    }
  }

  const handleSignInDemo = () => {
    signInDemo('Marco')
    navigate('/', { replace: true })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#F6F1E8] dark:bg-[#090A0D] text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {/* ======================================================== */}
      {/* ATMOSPHERIC BACKGROUND (Aurora Glow)                     */}
      {/* ======================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Dark mode aurora streak */}
        <div className="hidden dark:block absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[860px] rounded-full bg-gradient-to-r from-violet-600/25 via-rose-500/25 to-amber-500/20 blur-[130px] opacity-75" />
        <div className="hidden dark:block absolute -bottom-36 -left-20 h-[480px] w-[620px] rounded-full bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-transparent blur-[120px] opacity-60" />

        {/* Light mode warm glow */}
        <div className="dark:hidden absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[780px] rounded-full bg-gradient-to-b from-amber-200/40 via-orange-100/30 to-transparent blur-[110px]" />
        <div className="dark:hidden absolute -bottom-32 right-0 h-[420px] w-[500px] rounded-full bg-gradient-to-tl from-emerald-100/40 to-transparent blur-[100px]" />
      </div>

      {/* Theme toggle at top right corner */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="h-10 w-10 rounded-full bg-white/90 dark:bg-[#18191D]/90 backdrop-blur-md shadow-lisso border border-stone-200/80 dark:border-white/[0.1] flex items-center justify-center text-stone-700 dark:text-stone-300 hover:scale-105 active:scale-95 transition-all"
          title={`Ganti ke tema ${theme === 'light' ? 'gelap (doff)' : 'terang (cream)'}`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* ======================================================== */}
      {/* MAIN CLEAN ELEVATED CARD                                 */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full max-w-[400px] rounded-[32px] bg-white/95 dark:bg-[#131418]/90 backdrop-blur-2xl border border-stone-200/90 dark:border-white/[0.12] shadow-[0_24px_60px_-12px_rgba(40,30,20,0.12),0_12px_24px_-8px_rgba(40,30,20,0.06)] dark:shadow-[0_28px_70px_rgba(0,0,0,0.7)] p-8 sm:p-9 flex flex-col items-center text-center gap-6 transition-all">
        {/* Custom F&T Monogram Logo Badge */}
        <FandtLogo size="lg" />

        {/* Brand & Heading Section */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Masuk ke FandT
          </h1>
          <p className="text-xs sm:text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs mx-auto">
            Workspace all-in-one untuk keuangan, tugas, produktivitas, dan kalendermu.
          </p>
        </div>

        {/* Error Alert Box (if OAuth reports an error) */}
        {errorMessage && (
          <div className="w-full rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3.5 text-xs text-rose-700 dark:text-rose-300 text-left flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <p className="text-[11.5px] leading-relaxed font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="w-full flex flex-col gap-3 pt-1">
          {/* Hero Google OAuth Button */}
          <button
            type="button"
            onClick={handleSignInGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white dark:bg-[#1C1E24] hover:bg-stone-50 dark:hover:bg-[#252830] border border-stone-200/90 dark:border-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.06)] px-5 py-3.5 text-sm font-bold text-stone-900 dark:text-stone-100 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-60"
          >
            {googleLoading ? (
              <>
                <Loader2 size={18} className="animate-spin text-stone-500" />
                <span>Menghubungkan ke Google…</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Masuk dengan Google</span>
              </>
            )}
          </button>

          {/* Quick Demo Guest Mode Button */}
          <button
            type="button"
            onClick={handleSignInDemo}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-stone-100/90 dark:bg-[#1A1C22]/80 hover:bg-stone-200/80 dark:hover:bg-[#23252C] border border-stone-200/70 dark:border-white/[0.06] py-3 px-4 text-xs font-bold text-stone-600 dark:text-stone-300 transition-all active:scale-[0.99]"
            title="Coba aplikasi langsung dalam mode tamu tanpa login"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Masuk Langsung (Mode Tamu / Demo)</span>
          </button>
        </div>

        {/* Security & Auto Signup Microcopy */}
        <div className="pt-2 border-t border-stone-100 dark:border-white/[0.06] w-full flex items-center justify-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Jika belum terdaftar, akun baru otomatis dibuat</span>
        </div>
      </div>
    </div>
  )
}
