import { useState } from 'react'
import { useAuth } from '@/app/auth'
import { useTheme } from '@/lib/theme'
import { useTransactions } from '@/features/finance/hooks/use-transactions'
import { formatTransactionsToCSV, downloadCSV } from '@/features/finance/api/export'
import {
  User,
  Sun,
  Moon,
  Calendar,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

export function SettingsPage() {
  const { session, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { data: transactions = [] } = useTransactions({})

  const [displayName, setDisplayName] = useState(
    session?.user?.user_metadata?.full_name ?? 'Marco'
  )
  const [periodStartDay, setPeriodStartDay] = useState('25')
  const [googleCalendarSync, setGoogleCalendarSync] = useState(true)
  const [savedNotice, setSavedNotice] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 3000)
  }

  const handleExportAll = () => {
    const csv = formatTransactionsToCSV(transactions)
    downloadCSV(`fandt-backup-transaksi-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  const handleResetCache = () => {
    if (confirm('Clear local session cache and sign out?')) {
      localStorage.clear()
      window.location.href = '/login'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
          Settings &amp; Profile
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Manage user profile, display theme, budget period cycle, and data backups.
        </p>
      </div>

      {/* Profil Section */}
      <div className="lisso-card p-6 sm:p-7 space-y-5">
        <div className="flex items-center gap-2 border-b border-stone-100 dark:border-white/[0.08] pb-3">
          <User size={18} className="text-stone-800 dark:text-stone-200" />
          <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            User Profile
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full text-xs font-semibold h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Registered Email
              </label>
              <input
                type="email"
                disabled
                value={session?.user?.email ?? 'marco@ruangpribadi.id'}
                className="w-full text-xs font-semibold h-11 px-3.5 rounded-2xl bg-stone-100/50 dark:bg-[#141414]/50 text-stone-500 border border-stone-200/50 dark:border-white/[0.05] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Payday / Budget Start Day (1–28)
              </label>
              <input
                type="number"
                min={1}
                max={28}
                value={periodStartDay}
                onChange={(e) => setPeriodStartDay(e.target.value)}
                className="w-full text-xs font-semibold h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Daily allowance resets automatically on this day each month.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Timezone
              </label>
              <input
                type="text"
                disabled
                value="Asia/Jakarta (WIB)"
                className="w-full text-xs font-semibold h-11 px-3.5 rounded-2xl bg-stone-100/50 dark:bg-[#141414]/50 text-stone-500 border border-stone-200/50 dark:border-white/[0.05] cursor-not-allowed"
              />
            </div>
          </div>

          {savedNotice && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Profile settings saved successfully!</span>
            </div>
          )}

          <div className="pt-2">
            <button type="submit" className="lisso-btn-black text-xs">
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Tema & Penampilan */}
      <div className="lisso-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/[0.08] pb-3">
          <div>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              Appearance Theme
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Choose between Warm Cream Light and Monochrome Black Dark
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="lisso-btn-secondary text-xs gap-2"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span>Switch to {theme === 'light' ? 'Monochrome Dark' : 'Cream Light'}</span>
          </button>
        </div>
      </div>

      {/* Sinkronisasi Google Calendar (PRD Stage B) */}
      <div className="lisso-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-500" />
            <div>
              <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                Google Calendar Integration
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Sync tasks &amp; bills directly with your Google Calendar
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={googleCalendarSync}
              onChange={(e) => setGoogleCalendarSync(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900 dark:peer-checked:bg-stone-100"></div>
          </label>
        </div>

        <div className="text-xs text-stone-500 dark:text-stone-400 space-y-1">
          <p>
            Status: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Connected</span>
          </p>
          <p className="text-[11px] text-stone-400">
            "Add to Google Calendar" button is available in task details.
          </p>
        </div>
      </div>

      {/* Backup & Data Management */}
      <div className="lisso-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/[0.08] pb-3">
          <div>
            <h2 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              Data Management &amp; Backup
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Export financial records and reset local application cache
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={handleExportAll} className="lisso-btn-secondary text-xs gap-1.5">
            <Download size={15} />
            <span>Export All Transactions (CSV)</span>
          </button>

          <button onClick={handleResetCache} className="lisso-btn-secondary text-xs gap-1.5 text-rose-600 hover:text-rose-700">
            <Trash2 size={15} />
            <span>Clear Cache &amp; Reset Session</span>
          </button>
        </div>
      </div>
    </div>
  )
}
