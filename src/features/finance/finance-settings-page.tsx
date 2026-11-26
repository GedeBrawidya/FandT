import { BudgetPeriodSettings } from '@/features/finance/components/budget-period-settings'
import { CategoryList } from '@/features/finance/components/category-list'

export function FinanceSettingsPage() {
  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">Finance Settings</h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">Configure pay cycle period, savings allocation, and manage categories.</p>
      </div>

      {/* Budget Period & Savings Target Settings */}
      <BudgetPeriodSettings />

      {/* Categories Management */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Transaction Categories</h2>
        <CategoryList />
      </div>
    </div>
  )
}
