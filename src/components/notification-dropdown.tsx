import { useState, useRef, useEffect } from 'react'
import { X, CheckCircle2 } from 'lucide-react'

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  category: 'Finance' | 'Bills' | 'Tasks'
  categoryStyle: string
  isRead: boolean
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Daily Allowance Today',
    message: 'Your daily allowance for today is Rp 50.000. No variable expenses recorded yet.',
    time: '2 hours ago',
    category: 'Finance',
    categoryStyle: 'lisso-pill-green',
    isRead: false,
  },
  {
    id: '2',
    title: 'Upcoming Bill Due Date',
    message: 'Electricity & WiFi bills are due on Nov 25, 2026.',
    time: 'Yesterday',
    category: 'Bills',
    categoryStyle: 'lisso-pill-red',
    isRead: false,
  },
  {
    id: '3',
    title: 'Active Savings Target',
    message: 'Active period is running with a savings target of Rp 500.000.',
    time: '2 days ago',
    category: 'Finance',
    categoryStyle: 'lisso-pill-amber',
    isRead: true,
  },
  {
    id: '4',
    title: 'Task Completed',
    message: 'Task "Review Financial Report" was marked as completed.',
    time: '3 days ago',
    category: 'Tasks',
    categoryStyle: 'lisso-pill-blue',
    isRead: true,
  },
]

interface NotificationDropdownProps {
  open: boolean
  onClose: () => void
}

export function NotificationDropdown({ open, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
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

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-[28px] lisso-card shadow-2xl p-5 border border-stone-200/80 dark:border-white/[0.1] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              Mark as read
            </button>
          )}
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full hover:bg-stone-100 dark:hover:bg-[#181818] flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto space-y-2.5 py-3 pr-1 no-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No notifications yet
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl transition-colors border ${
                item.isRead
                  ? 'bg-stone-50/60 dark:bg-[#141414] border-transparent text-stone-500'
                  : 'bg-white dark:bg-[#181818] border-stone-200/80 dark:border-white/[0.08] shadow-xs text-stone-900 dark:text-stone-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={item.categoryStyle}>{item.category}</span>
                <span className="text-[10px] font-medium text-stone-400">{item.time}</span>
              </div>
              <h4 className="text-xs font-bold leading-snug">{item.title}</h4>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                {item.message}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-stone-100 dark:border-white/[0.08] text-center">
        <button
          onClick={onClose}
          className="w-full py-2 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-[#181818] dark:hover:bg-[#202020] text-xs font-bold text-stone-700 dark:text-stone-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
