import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth'
import { hasSupabaseConfig } from '@/lib/supabase'
import {
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2,
  Sun,
  Moon,
  CheckCircle2,
  HelpCircle,
  Mail,
  User as UserIcon,
  Zap,
  Copy,
  Check,
} from 'lucide-react'
import { useTheme } from '@/lib/theme'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

export function LoginPage() {
  const { session, loading, signInWithGoogle, signInGoogleDirect, signInDemo } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [showDirectForm, setShowDirectForm] = useState(false)
  const [userName, setUserName] = useState('Marco')
  const [userEmail, setUserEmail] = useState('marco@gmail.com')
  const [showGuide, setShowGuide] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)

  useEffect(() => {
    if (!loading && session) {
      navigate('/', { replace: true })
    }
  }, [session, loading, navigate])

  // Check URL error parameters on mount (from Supabase OAuth callback)
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
        const decoded = decodeURIComponent(err.replace(/\+/g, ' '))
        setErrorMessage(decoded)
        if (decoded.toLowerCase().includes('database error')) {
          setErrorDetails(
            'Penyebab: Trigger PostgreSQL Supabase belum diperbarui dengan SET search_path = public, auth, atau Site URL di Supabase Dashboard masih mengarah ke localhost:3000.'
          )
        }
      }
    }
  }, [])

  const handleSignInGoogle = async () => {
    setErrorMessage(null)
    setErrorDetails(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungkan ke Google OAuth'
      setErrorMessage(msg)
      setGoogleLoading(false)
    }
  }

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    signInGoogleDirect(userName || 'User', userEmail || 'user@fandt.app')
    navigate('/', { replace: true })
  }

  const handleSignInDemo = () => {
    signInDemo('Marco')
    navigate('/', { replace: true })
  }

  const handleCopyGuide = () => {
    const sqlScript = `-- Jalankan di Supabase SQL Editor:
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
-- Lalu jalankan file supabase/migrations/0004_fix_oauth_trigger.sql`
    navigator.clipboard.writeText(sqlScript)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2500)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#F6F1E8] dark:bg-[#090A0D] text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {/* ======================================================== */}
      {/* ATMOSPHERIC BACKGROUND (Aurora Glow from reference 2)    */}
      {/* ======================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Dark mode aurora streak */}
        <div className="hidden dark:block absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[860px] rounded-full bg-gradient-to-r from-violet-600/25 via-rose-500/25 to-amber-500/20 blur-[130px] opacity-70" />
        <div className="hidden dark:block absolute -bottom-36 -left-20 h-[480px] w-[620px] rounded-full bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-transparent blur-[120px] opacity-60" />
        
        {/* Light mode warm glow */}
        <div className="dark:hidden absolute -top-32 left-1/2 -translate-x-1/2 h-[480px] w-[780px] rounded-full bg-gradient-to-b from-amber-200/40 via-orange-100/30 to-transparent blur-[110px]" />
        <div className="dark:hidden absolute -bottom-32 right-0 h-[420px] w-[500px] rounded-full bg-gradient-to-tl from-emerald-100/40 to-transparent blur-[100px]" />
      </div>

      {/* ======================================================== */}
      {/* MAIN ELEVATED FLOATING CARD (Thick tactile feel)        */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full max-w-[430px] rounded-[32px] bg-white/95 dark:bg-[#131418]/90 backdrop-blur-2xl border border-stone-200/90 dark:border-white/[0.12] shadow-[0_24px_60px_-12px_rgba(40,30,20,0.12),0_12px_24px_-8px_rgba(40,30,20,0.06)] dark:shadow-[0_28px_70px_rgba(0,0,0,0.7)] p-6 sm:p-8 flex flex-col gap-5 transition-all">
        {/* Top Controls: Segmented Tab Switcher (Image 2) & Theme Toggle */}
        <div className="flex items-center justify-between gap-3">
          {/* Tab Switcher Pills */}
          <div className="flex items-center p-1 rounded-full bg-stone-100 dark:bg-[#1C1E24] border border-stone-200/80 dark:border-white/[0.08] shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'signin'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'signup'
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full bg-stone-100 dark:bg-[#1C1E24] border border-stone-200/80 dark:border-white/[0.08] flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 active:scale-95 transition-all"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        {/* Brand & Heading Section (Image 1 & 2 inspired) */}
        <div className="text-left space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-tighter text-stone-900 dark:text-stone-100">
            <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-stone-900 text-white dark:bg-white dark:text-stone-900 text-[10px]">
              ✦
            </span>
            <span>FandT</span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            {activeTab === 'signin' ? 'Log in to FandT' : 'Create an account'}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            {activeTab === 'signin'
              ? 'Your personal finance & daily workspace starts here.'
              : 'Daftar instan dan mulai kelola keuangan, tugas, dan targetmu.'}
          </p>
        </div>

        {/* Error Alert Box (Diagnosa Error Redirect & Database) */}
        {errorMessage && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3.5 text-xs text-rose-700 dark:text-rose-300 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-start gap-2 font-bold">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>Info Autentikasi Google:</span>
            </div>
            <p className="text-[11.5px] leading-relaxed pl-5 font-medium">{errorMessage}</p>
            {errorDetails && (
              <p className="text-[10.5px] pl-5 text-rose-600/90 dark:text-rose-400/90 leading-normal">
                {errorDetails}
              </p>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SOCIAL & QUICK SIGN IN ROW (Directly matching references) */}
        {/* ======================================================== */}
        <div className="space-y-2">
          {/* Main Primary Google Login Button */}
          <button
            type="button"
            onClick={handleSignInGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white dark:bg-[#1A1C22] hover:bg-stone-50 dark:hover:bg-[#23252C] border border-stone-200/90 dark:border-white/[0.1] shadow-[0_2px_6px_rgba(0,0,0,0.04)] px-4 py-3 text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-100 transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-60"
          >
            {googleLoading ? (
              <>
                <Loader2 size={16} className="animate-spin text-stone-500" />
                <span>Menghubungkan ke Google OAuth…</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Lanjutkan dengan Google</span>
              </>
            )}
          </button>

          {/* Quick Demo & Fast Login shortcuts side-by-side */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSignInDemo}
              className="flex items-center justify-center gap-2 rounded-2xl bg-stone-100/90 dark:bg-[#1A1C22] hover:bg-stone-200/80 dark:hover:bg-[#23252C] border border-stone-200/70 dark:border-white/[0.06] py-2.5 px-3 text-xs font-bold text-stone-700 dark:text-stone-200 transition-all active:scale-[0.98]"
              title="Masuk sebagai tamu tanpa login"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Mode Demo</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDirectForm(!showDirectForm)}
              className={`flex items-center justify-center gap-2 rounded-2xl border py-2.5 px-3 text-xs font-bold transition-all active:scale-[0.98] ${
                showDirectForm
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 border-transparent shadow-xs'
                  : 'bg-stone-100/90 dark:bg-[#1A1C22] hover:bg-stone-200/80 dark:hover:bg-[#23252C] text-stone-700 dark:text-stone-200 border-stone-200/70 dark:border-white/[0.06]'
              }`}
            >
              <Zap size={14} className={showDirectForm ? 'text-amber-400' : 'text-stone-500'} />
              <span>Mode Cepat</span>
            </button>
          </div>
        </div>

        {/* Elegant Divider: "OR CONTINUE WITH EMAIL" */}
        <div className="relative flex items-center justify-center py-0.5">
          <div className="w-full border-t border-stone-200 dark:border-white/[0.08]" />
          <span className="absolute bg-white dark:bg-[#131418] px-3 text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
            or
          </span>
        </div>

        {/* Email Direct Login Form */}
        <form onSubmit={handleDirectSubmit} className="space-y-3">
          {(activeTab === 'signup' || showDirectForm) && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Nama Akun Anda"
                  className="w-full text-xs font-semibold h-11 pl-9 pr-3.5 rounded-2xl bg-stone-50 dark:bg-[#18191E] border border-stone-200/90 dark:border-white/[0.08] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 transition-all"
                />
                <UserIcon size={14} className="absolute left-3 top-3.5 text-stone-400" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block">
              Alamat Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full text-xs font-semibold h-11 pl-9 pr-3.5 rounded-2xl bg-stone-50 dark:bg-[#18191E] border border-stone-200/90 dark:border-white/[0.08] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 transition-all"
              />
              <Mail size={14} className="absolute left-3 top-3.5 text-stone-400" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white h-11 text-xs sm:text-sm font-bold shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all active:scale-[0.99]"
          >
            <span>{activeTab === 'signin' ? 'Continue with Email' : 'Create an Account'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Footer Toggle Accordion for Supabase & Google Cloud Setup */}
        <div className="border-t border-stone-100 dark:border-white/[0.06] pt-3">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle size={14} />
              Panduan URL Supabase &amp; Fix Database Error
            </span>
            <span>{showGuide ? '▲' : '▼'}</span>
          </button>

          {showGuide && (
            <div className="mt-2.5 p-3.5 rounded-2xl bg-stone-50 dark:bg-[#18191E] border border-stone-200/80 dark:border-white/[0.08] text-[11px] text-stone-600 dark:text-stone-400 space-y-2 leading-relaxed animate-in fade-in duration-200">
              <p className="font-bold text-stone-900 dark:text-stone-100">
                Cara menyelesaikan redirect localhost:3000 &amp; Database Error:
              </p>
              <ol className="list-decimal pl-4 space-y-1.5 text-[10.5px]">
                <li>
                  Buka <strong>Supabase Dashboard</strong> &rarr; <strong>Authentication</strong> &rarr; <strong>URL Configuration</strong>.
                </li>
                <li>
                  Ganti <strong>Site URL</strong> menjadi:
                  <code className="block mt-0.5 p-1 rounded bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-[10px] break-all">
                    https://fand-t.vercel.app
                  </code>
                </li>
                <li>
                  Tambahkan ke <strong>Redirect URLs</strong>:
                  <code className="block mt-0.5 p-1 rounded bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-[10px] break-all">
                    https://fand-t.vercel.app/**
                  </code>
                </li>
                <li>
                  Buka <strong>SQL Editor</strong> di Supabase, lalu jalankan file migrasi:
                  <code className="block mt-0.5 p-1 rounded bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-[10px] break-all">
                    0004_fix_oauth_trigger.sql
                  </code>
                </li>
              </ol>

              <button
                type="button"
                onClick={handleCopyGuide}
                className="w-full mt-1.5 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-stone-200/70 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-[10.5px] font-bold text-stone-800 dark:text-stone-200 transition-colors"
              >
                {copiedSql ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedSql ? 'SQL Panduan Disalin!' : 'Salin Instruksi Fix'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Small Bottom Terms Notice (Matching Image 2) */}
        <p className="text-[10px] text-center text-stone-400 dark:text-stone-500 leading-normal">
          By continuing, you agree to FandT's Terms &amp; Conditions and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
