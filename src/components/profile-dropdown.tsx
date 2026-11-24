import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Settings, User } from 'lucide-react'

interface ProfileDropdownProps {
  open: boolean
  onClose: () => void
  userName: string
  userEmail: string
  avatarUrl?: string
  initials: string
  onSignOut: () => void
}

export function ProfileDropdown({
  open,
  onClose,
  userName,
  userEmail,
  avatarUrl,
  initials,
  onSignOut,
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 z-50 w-64 rounded-[28px] lisso-card shadow-2xl p-3 border border-stone-200/80 dark:border-white/[0.1] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* User Header */}
      <div className="flex items-center gap-3 p-2.5 border-b border-stone-100 dark:border-stone-800">
        <div className="h-10 w-10 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-700 shrink-0 flex items-center justify-center font-bold text-xs text-stone-700 dark:text-stone-200">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
            {userName}
          </p>
          <p className="text-[11px] text-stone-400 truncate">{userEmail}</p>
        </div>
      </div>

      {/* Menu Options */}
      <div className="py-1.5 space-y-0.5">
        <Link
          to="/settings"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#181818] transition-colors"
        >
          <User size={14} className="text-stone-400" />
          <span>Profile &amp; Account</span>
        </Link>
        <Link
          to="/finance/settings"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#181818] transition-colors"
        >
          <Settings size={14} className="text-stone-400" />
          <span>Budget Period Settings</span>
        </Link>
      </div>

      {/* Sign Out Button */}
      <div className="pt-1 border-t border-stone-100 dark:border-white/[0.08]">
        <button
          onClick={() => {
            onClose()
            onSignOut()
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )
}
