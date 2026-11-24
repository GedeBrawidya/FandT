import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/app/auth'
import { AppShell } from '@/app/shell'
import { Loader2 } from 'lucide-react'

// Eagerly loaded (small, always needed)
import { LoginPage } from '@/features/auth/login-page'

// Lazy-loaded feature pages
const DashboardPage = lazy(() =>
  import('@/features/dashboard/dashboard-page').then((m) => ({ default: m.DashboardPage }))
)
const FinancePage = lazy(() =>
  import('@/features/finance/finance-page').then((m) => ({ default: m.FinancePage }))
)
const TransactionsPage = lazy(() =>
  import('@/features/finance/transactions-page').then((m) => ({ default: m.TransactionsPage }))
)
const BillsPage = lazy(() =>
  import('@/features/finance/bills-page').then((m) => ({ default: m.BillsPage }))
)
const WalletsPage = lazy(() =>
  import('@/features/finance/wallets-page').then((m) => ({ default: m.WalletsPage }))
)
const FinanceSettingsPage = lazy(() =>
  import('@/features/finance/finance-settings-page').then((m) => ({ default: m.FinanceSettingsPage }))
)
const TasksPage = lazy(() =>
  import('@/features/tasks/tasks-page').then((m) => ({ default: m.TasksPage }))
)
const ProductivityPage = lazy(() =>
  import('@/features/productivity/productivity-page').then((m) => ({ default: m.ProductivityPage }))
)
const TaskDetailPage = lazy(() =>
  import('@/features/tasks/task-detail-page').then((m) => ({ default: m.TaskDetailPage }))
)
const CalendarPage = lazy(() =>
  import('@/features/calendar/calendar-page').then((m) => ({ default: m.CalendarPage }))
)
const WishlistPage = lazy(() =>
  import('@/features/wishlist/wishlist-page').then((m) => ({ default: m.WishlistPage }))
)
const SettingsPage = lazy(() =>
  import('@/features/settings/settings-page').then((m) => ({ default: m.SettingsPage }))
)

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 size={24} className="animate-spin text-emerald-400" />
    </div>
  )
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>
}

function withAuth(element: React.ReactNode) {
  return <AuthProvider>{element}</AuthProvider>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withAuth(<LoginPage />),
  },
  {
    path: '/',
    element: withAuth(<AppShell />),
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'finance', element: withSuspense(<FinancePage />) },
      { path: 'finance/transactions', element: withSuspense(<TransactionsPage />) },
      { path: 'finance/bills', element: withSuspense(<BillsPage />) },
      { path: 'finance/wallets', element: withSuspense(<WalletsPage />) },
      { path: 'finance/settings', element: withSuspense(<FinanceSettingsPage />) },
      { path: 'tasks', element: withSuspense(<TasksPage />) },
      { path: 'productivity', element: withSuspense(<ProductivityPage />) },
      { path: 'tasks/:id', element: withSuspense(<TaskDetailPage />) },
      { path: 'calendar', element: withSuspense(<CalendarPage />) },
      { path: 'wishlist', element: withSuspense(<WishlistPage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
