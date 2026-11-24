import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/auth'
import { useTheme } from '@/lib/theme'
import { NotificationDropdown } from '@/components/notification-dropdown'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { QuickAddSheet } from '@/features/finance/components/quick-add-sheet'
import {
  Bell,
  Sun,
  Moon,
  Plus,
  Loader2,
  Menu,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tasks', label: 'Tasks', end: false },
  { to: '/productivity', label: 'Productivity', end: false },
  { to: '/calendar', label: 'Calendar', end: false },
  { to: '/finance', label: 'Finance', end: false },
]

function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#FAF7F2] dark:bg-[#090909]">
      <div className="lisso-card p-8 flex flex-col items-center gap-4">
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (loading) return <FullScreenLoader />

  if (!session) {
    setTimeout(() => navigate('/login', { replace: true }), 0)
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
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#090909] text-stone-900 dark:text-stone-100 transition-colors">
      {/* ======================================================== */}
      {/* TOP HEADER (FandT Clean UI)                              */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/95 dark:bg-[#090909]/95 backdrop-blur-md border-b-0">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between">
          {/* Brand: Clean Text "FandT" (No circle logo, pure typography) */}
          <div className="flex items-center gap-2">
            <NavLink to="/" className="flex items-center gap-1 group">
              <span className="font-black text-2xl tracking-tighter text-stone-900 dark:text-stone-100 transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">
                FandT
              </span>
            </NavLink>
          </div>

          {/* Desktop Center Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/80 dark:bg-[#141414]/90 shadow-lisso border border-stone-200/60 dark:border-white/[0.08]">
            {NAV_ITEMS.map(({ to, label, end }) => {
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
          <div className="flex items-center gap-2.5">
            {/* Notification Bell with Dropdown Popover */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationOpen(!notificationOpen)
                  setProfileOpen(false)
                }}
                aria-label="Notification History"
                className="relative h-10 w-10 rounded-full bg-white dark:bg-[#141414] shadow-lisso border border-stone-200/60 dark:border-white/[0.08] flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1c1c1c] transition-colors"
                title="View notifications"
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              </button>

              {/* Dropdown below bell */}
              <NotificationDropdown
                open={notificationOpen}
                onClose={() => setNotificationOpen(false)}
              />
            </div>

            {/* Theme Toggle (Cream Light ↔ Doff Dark) */}
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full bg-white dark:bg-[#141414] shadow-lisso border border-stone-200/60 dark:border-white/[0.08] flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1c1c1c] transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* User Avatar with Dropdown (Sign out appears on click!) */}
            <div className="relative pl-1">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen)
                  setNotificationOpen(false)
                }}
                className="h-10 w-10 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700 shadow-xs border-2 border-white dark:border-stone-800 flex items-center justify-center text-xs font-bold text-stone-700 dark:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 transition-colors"
                title="Open profile"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </button>

              {/* Profile Dropdown below avatar */}
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

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-10 w-10 rounded-full bg-white dark:bg-[#141414] shadow-lisso border border-stone-200/60 dark:border-white/[0.08] flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1c1c1c] transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pb-3">
            <div className="md:hidden p-3 lisso-card flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
              {NAV_ITEMS.map(({ to, label, end }) => {
                const isActive = end
                  ? location.pathname === to
                  : location.pathname === to || location.pathname.startsWith(to + '/')
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-2.5 rounded-2xl text-xs font-semibold ${
                      isActive
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>{label}</span>
                  </NavLink>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTENT WRAPPER (With comfortable margin from nav) */}
      {/* ======================================================== */}
      <main className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 ${location.pathname === '/' ? 'lg:pb-3' : 'pb-8'}`}>
        <Outlet />
      </main>

      {/* ======================================================== */}
      {/* FLOATING ACTION BUTTON (Mobile only, hidden on desktop)  */}
      {/* ======================================================== */}
      <div className="fixed bottom-6 right-6 z-30 md:hidden">
        <button
          onClick={() => setQuickAddOpen(true)}
          className="h-14 w-14 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xl flex items-center justify-center hover:bg-stone-800 dark:hover:bg-white active:scale-95 transition-all"
          title="Quick Add Expense"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Quick Add Sheet */}
      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  )
}
