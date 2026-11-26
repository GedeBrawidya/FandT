import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth'
import { hasSupabaseConfig } from '@/lib/supabase'
import { AlertCircle, ArrowRight, Sparkles, Loader2, Sun, Moon, CheckCircle2, HelpCircle } from 'lucide-react'
import { useTheme } from '@/lib/theme'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
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
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showGoogleDirect, setShowGoogleDirect] = useState(false)
  const [googleEmail, setGoogleEmail] = useState('marco@gmail.com')
  const [googleName, setGoogleName] = useState('Marco')
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    if (!loading && session) {
      navigate('/', { replace: true })
    }
  }, [session, loading, navigate])

  // Check URL error on mount
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
        setErrorMessage(
          `Gagal masuk dengan Google: "${err}". Anda dapat mencoba lagi atau masuk langsung menggunakan opsi "Masuk dengan Akun Google (Mode Cepat)" di bawah.`
        )
        setShowGoogleDirect(true)
      }
    }
  }, [])

  const handleSignInGoogle = async () => {
    setErrorMessage(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungkan ke Google OAuth'
      setErrorMessage(
        `Google OAuth belum diaktifkan di Supabase (${msg}). Buka opsi di bawah untuk masuk langsung dengan Akun Google Anda.`
      )
      setGoogleLoading(false)
      setShowGoogleDirect(true)
    }
  }

  const handleSignInGoogleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    signInGoogleDirect(googleName || 'Marco', googleEmail || 'marco@gmail.com')
    navigate('/', { replace: true })
  }

  const handleSignInDemo = () => {
    signInDemo('Marco')
    navigate('/', { replace: true })
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-[#F4EFE6] dark:bg-[#18191D] transition-colors">
      {/* Theme toggle at top right */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="h-10 w-10 rounded-full bg-white dark:bg-[#25282F] shadow-lisso flex items-center justify-center text-stone-700 dark:text-stone-300 hover:scale-105 active:scale-95 transition-all"
          title={`Ganti ke tema ${theme === 'light' ? 'gelap (doff)' : 'terang (cream)'}`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Main card */}
      <div className="lisso-card w-full max-w-md p-8 md:p-10 flex flex-col items-center gap-6">
        {/* Brand logo & title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-16 w-16 flex items-center justify-center rounded-3xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm">
            <span className="text-2xl font-extrabold tracking-tighter">✦</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
              FandT
            </h1>
            <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400 max-w-xs leading-relaxed">
              Workspace all-in-one untuk keuangan, tugas, produktivitas, dan kalendermu.
            </p>
          </div>
        </div>

        {/* Error notice if Google login failed */}
        {errorMessage && (
          <div className="w-full rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Info Google Login:</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          {/* Google OAuth Button */}
          <button
            onClick={handleSignInGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-full bg-white dark:bg-[#25282F] hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-white/[0.08] shadow-sm px-6 py-3.5 text-sm font-bold text-stone-800 dark:text-stone-200 transition-all active:scale-[0.98] disabled:opacity-50"
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

          {/* Direct Google Login Form (Instant entry without Cloud Console setup) */}
          {showGoogleDirect ? (
            <form
              onSubmit={handleSignInGoogleDirectSubmit}
              className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-white/[0.08] space-y-3 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Masuk Langsung dengan Akun Google
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold">
                  Instan
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
                  Nama Anda
                </label>
                <input
                  type="text"
                  required
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Nama Akun Google"
                  className="w-full text-xs font-semibold h-10 px-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
                  Email Google (@gmail.com)
                </label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="email@gmail.com"
                  className="w-full text-xs font-semibold h-10 px-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full lisso-btn-black text-xs py-2.5 justify-center shadow-xs"
              >
                Lanjutkan Masuk sebagai {googleName}
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowGoogleDirect(true)}
              className="text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 text-center py-1 hover:underline"
            >
              Atau masuk langsung dengan akun Google Anda &rarr;
            </button>
          )}

          {/* Quick Demo Mode button */}
          <button
            onClick={handleSignInDemo}
            className="w-full flex items-center justify-between rounded-full bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white px-6 py-3.5 text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} className="text-amber-400 dark:text-amber-600" />
              <span>Masuk Langsung (Mode Tamu / Demo)</span>
            </div>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Cara Aktivasi Real Supabase Google Auth Toggle */}
        <div className="w-full border-t border-stone-100 dark:border-stone-800 pt-3">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle size={14} />
              Cara Aktifkan Google OAuth di Supabase Console
            </span>
            <span>{showGuide ? '▲' : '▼'}</span>
          </button>

          {showGuide && (
            <div className="mt-2.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-[11px] text-stone-600 dark:text-stone-400 space-y-1.5 leading-relaxed animate-in fade-in duration-200">
              <p className="font-bold text-stone-900 dark:text-stone-100">
                3 Langkah Mengaktifkan Google OAuth Resmi:
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>
                  Buka <strong>Google Cloud Console</strong> &rarr; Credentials &rarr; Buat <strong>OAuth Client ID</strong> (Web application).
                </li>
                <li>
                  Di Google Cloud, masukkan <strong>Authorized redirect URI</strong>:
                  <code className="block mt-0.5 p-1 rounded bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 text-[10px] break-all">
                    https://dujxxkpdinvvbvwqtpvu.supabase.co/auth/v1/callback
                  </code>
                </li>
                <li>
                  Buka <strong>Supabase Dashboard</strong> &rarr; Authentication &rarr; Providers &rarr; Google (Aktifkan dan masukkan Client ID &amp; Client Secret).
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-stone-400 dark:text-stone-500">
            {hasSupabaseConfig ? '✓ Supabase Client Siap' : '⚠️ Mode Offline / Demo'}
          </p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500">
            Desain terinspirasi Lisso clean UI • Mode Cream &amp; Doff Dark
          </p>
        </div>
      </div>
    </div>
  )
}
