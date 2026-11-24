import { BudgetPeriodSettings } from '@/features/finance/components/budget-period-settings'
import { CategoryList } from '@/features/finance/components/category-list'

export function FinanceSettingsPage() {
  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Finance Settings</h1>
        <p className="text-xs text-slate-400">Configure pay cycle period, savings allocation, and manage categories.</p>
      </div>

      {/* Budget Period & Savings Target Settings */}
      <BudgetPeriodSettings />

      {/* Categories Management */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-100">Transaction Categories</h2>
        <CategoryList />
      </div>
    </div>
  )
}
