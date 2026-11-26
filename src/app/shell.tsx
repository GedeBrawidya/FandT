import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/auth'
import { useTheme } from '@/lib/theme'
import { NotificationDropdown } from '@/components/notification-dropdown'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { FandtLogo } from '@/components/fandt-logo'
import { QuickAddSheet } from '@/features/finance/components/quick-add-sheet'
import {
  Home,
  CheckSquare,
  CreditCard,
  FileText,
  Calendar,
  User,
  Bell,
  Sun,
  Moon,
  Plus,
  Loader2,
} from 'lucide-react'

const DESKTOP_NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tasks', label: 'Tasks', end: false },
  { to: '/productivity', label: 'Productivity', end: false },
  { to: '/calendar', label: 'Calendar', end: false },
  { to: '/finance', label: 'Finance', end: false },
]

const MOBILE_NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare, end: false },
  { to: '/finance', label: 'Cards', icon: CreditCard, end: false },
  { to: '/productivity', label: 'Notes', icon: FileText, end: false },
  { to: '/calendar', label: 'Agenda', icon: Calendar, end: false },
  { to: '/settings', label: 'Profile', icon: User, end: false },
]

function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#FAF7F2] dark:bg-[#090909]">
      <div className="lisso-card p-8 flex flex-col items-center gap-4 border-0 shadow-lg">
        <Loader2 size={32} className="text-stone-900 dark:text-stone-100 animate-spin" />
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">Loading FandT…</p>
      </div>
    </div>
  )
}

export function AppShell() {
  const { session, loading, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  if (loading) return <FullScreenLoader />

  if (!session) {
    // If URL contains OAuth access_token, auth is currently resolving, stay on loader
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      return <FullScreenLoader />
    }
    const search = location.search || ''
    const hash = location.hash || ''
    setTimeout(() => navigate(`/login${search}${hash}`, { replace: true }), 0)
    return <FullScreenLoader />
  }

  const user = session.user
  const fullName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Marco'
  const email = user?.email ?? 'marco@ruangpribadi.id'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = fullName.slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`min-h-screen bg-[#FAF7F2] dark:bg-[#090909] text-stone-900 dark:text-stone-100 transition-colors ${location.pathname === '/' ? 'lg:h-screen lg:overflow-hidden' : ''}`}>
      {/* ======================================================== */}
      {/* TOP HEADER (FandT Clean UI)                              */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 dark:bg-[#090909]/95 backdrop-blur-md border-b-0">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between">
          {/* Brand: Clean F&T Logo + Name */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <FandtLogo size="sm" />
            <span className="font-black text-xl tracking-tighter text-stone-900 dark:text-stone-100 transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">
              FandT
            </span>
          </NavLink>

          {/* Desktop Center Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/80 dark:bg-[#141414]/90 shadow-lisso border border-stone-200/60 dark:border-white/[0.08]">
            {DESKTOP_NAV_ITEMS.map(({ to, label, end }) => {
              const isActive = end
                ? location.pathname === to
                : location.pathname === to || location.pathname.startsWith(to + '/')
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={`px-5 py-2 rounded-full text-xs font-bold tracking-tight transition-all duration-200 ${
                    isActive
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                  }`}
                >
                  {label}
                </NavLink>
              )
            })}
          </nav>

          {/* Right Action Icons (Notif Bell, Theme Toggle, Avatar) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Notification Bell with Dropdown Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationOpen(!notificationOpen)
                  setProfileOpen(false)
                }}
                aria-label="Notification History"
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white dark:bg-[#141414] shadow-lisso border border-stone-200/60 dark:border-white/[0.08] flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1c1c1c] transition-colors"
                title="View notifications"
              >
                <Bell size={17} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              </button>

              <NotificationDropdown
                open={notificationOpen}
                onClose={() => setNotificationOpen(false)}
              />
            </div>

            {/* Theme Toggle (Cream Light ↔ Doff Dark) */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white dark:bg-[#141414] shadow-lisso border border-stone-200/60 dark:border-white/[0.08] flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1c1c1c] transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            {/* User Avatar with Dropdown */}
            <div className="relative pl-0.5">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen)
                  setNotificationOpen(false)
                }}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700 shadow-xs border-2 border-white dark:border-stone-800 flex items-center justify-center text-xs font-bold text-stone-700 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 transition-colors"
                title="Open profile"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </button>

              <ProfileDropdown
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                userName={fullName}
                userEmail={email}
                avatarUrl={avatarUrl}
                initials={initials}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTENT WRAPPER                                     */}
      {/* ======================================================== */}
      <main className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 ${location.pathname === '/' ? 'pt-1.5 sm:pt-2 pb-28 lg:pb-2 lg:overflow-hidden' : 'pt-3 sm:pt-5 pb-28 md:pb-8'}`}>
        <Outlet />
      </main>

      {/* ======================================================== */}
      {/* FLOATING ACTION BUTTON (Mobile transaction shortcut)     */}
      {/* ======================================================== */}
      <div className="fixed bottom-20 right-4 sm:right-6 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setQuickAddOpen(true)}
          className="h-12 w-12 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xl flex items-center justify-center hover:bg-stone-800 dark:hover:bg-white active:scale-95 transition-all"
          title="Quick transaction"
          aria-label="Add transaction"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* ======================================================== */}
      {/* FLOATING BOTTOM PILL NAVBAR (Mobile only, based on ref)   */}
      {/* ======================================================== */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/95 dark:bg-[#141414]/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/[0.1] shadow-2xl max-w-[calc(100vw-24px)]">
        {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon, end }) => {
          const isActive = end
            ? location.pathname === to
            : location.pathname === to || location.pathname.startsWith(to + '/')
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={`flex items-center gap-1.5 transition-all duration-200 ${
                isActive
                  ? 'px-3.5 py-2 rounded-full bg-stone-100 dark:bg-[#252525] text-stone-900 dark:text-stone-100 font-bold text-xs shadow-xs'
                  : 'p-2.5 rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
              title={label}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && <span className="text-[11px] font-bold tracking-tight">{label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Quick Add Sheet */}
      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  )
}
