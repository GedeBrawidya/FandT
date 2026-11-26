import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DailyAllowanceCard } from '@/features/finance/components/daily-allowance-card'
import { SummaryCard } from '@/features/finance/components/summary-card'
import { SpendingChart } from '@/features/finance/components/spending-chart'
import { TopCategoriesCard } from '@/features/finance/components/top-categories-card'
import { QuickAddSheet } from '@/features/finance/components/quick-add-sheet'
import { Plus, ArrowRightLeft, CalendarClock, Wallet, Settings } from 'lucide-react'

export function FinancePage() {
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  const quickNav = [
    { label: 'Transactions', path: '/finance/transactions', icon: ArrowRightLeft },
    { label: 'Wallets', path: '/finance/wallets', icon: Wallet },
    { label: 'Bills', path: '/finance/bills', icon: CalendarClock },
    { label: 'Settings', path: '/finance/settings', icon: Settings },
  ]

  return (
    <div className="finance-screen space-y-5 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 mb-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Finance &amp; Budget
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Track your daily allowance, transactions and wallet balances in real time.
          </p>
        </div>
        <button
          onClick={() => setQuickAddOpen(true)}
          className="lisso-btn-black self-start"
        >
          <Plus size={16} />
          <span>Add transaction</span>
        </button>
      </div>

      {/* Main Top Overview Grid (Daily Allowance + Summary side-by-side on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <DailyAllowanceCard onSetupPeriod={() => { window.location.href = '/finance/settings' }} />
        <SummaryCard />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickNav.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className="lisso-card p-3 sm:p-4 flex flex-col items-center justify-center gap-2 text-center hover:bg-[#F3EEE6] dark:hover:bg-[#1a1a1a] transition-colors group"
            >
              <div className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 transition-colors">
                <Icon size={18} />
              </div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Analytics: 7-day spending & Top Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SpendingChart />
        <TopCategoriesCard />
      </div>

      {/* Quick Add Sheet */}
      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  )
}
