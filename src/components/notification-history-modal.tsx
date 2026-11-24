import { useState } from 'react'
import { Bell, Check, Clock, DollarSign, Calendar, AlertTriangle, X } from 'lucide-react'

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  type: 'finance' | 'task' | 'bill' | 'system'
  isRead: boolean
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Daily Allowance Calculated',
    message: 'Your daily allowance today is Rp 50.000. Current spend is Rp 0.',
    time: '2 hours ago',
    type: 'finance',
    isRead: false,
  },
  {
    id: '2',
    title: 'Upcoming Bill Due Date',
    message: 'Internet & WiFi bill is due on Nov 25, 2026.',
    time: 'Yesterday, 14:30',
    type: 'bill',
    isRead: false,
  },
  {
    id: '3',
    title: 'Active Savings Target',
    message: 'Active period Nov 25 – Dec 24 with savings target of Rp 500.000.',
    time: '2 days ago',
    type: 'finance',
    isRead: true,
  },
  {
    id: '4',
    title: 'Upcoming Task',
    message: 'Weekly Strategy Sync is scheduled for today at 10:00.',
    time: '3 days ago',
    type: 'task',
    isRead: true,
  },
]

export function NotificationHistoryModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)

  if (!open) return null

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'finance':
        return <DollarSign size={16} className="text-emerald-500" />
      case 'bill':
        return <AlertTriangle size={16} className="text-amber-500" />
      case 'task':
        return <Calendar size={16} className="text-blue-500" />
      default:
        return <Clock size={16} className="text-stone-500" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="lisso-card w-full max-w-md p-6 max-h-[85vh] flex flex-col gap-4 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-stone-100 dark:bg-[#181818] flex items-center justify-center text-stone-700 dark:text-stone-300">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Notification History
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {unreadCount > 0 ? `${unreadCount} new notifications` : 'All notifications marked as read'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium px-2 py-1 transition-colors"
              >
                Mark as read
              </button>
            )}
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-[#181818] flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1 no-scrollbar">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-colors flex items-start gap-3 ${
                item.isRead
                  ? 'bg-stone-50/60 dark:bg-[#141414] border-transparent text-stone-600 dark:text-stone-400'
                  : 'bg-white dark:bg-[#181818] border-stone-200/80 dark:border-white/[0.1] shadow-xs'
              }`}
            >
              <div className="h-8 w-8 rounded-full bg-stone-100 dark:bg-[#202020] shrink-0 flex items-center justify-center mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-stone-400 shrink-0">{item.time}</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                  {item.message}
                </p>
              </div>
              {!item.isRead && (
                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center border-t border-stone-100 dark:border-white/[0.08]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-[#181818] dark:hover:bg-[#202020] text-xs font-semibold text-stone-800 dark:text-stone-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
