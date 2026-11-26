import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from '@/app/auth'
import { AppShell } from '@/app/shell'
import { Loader2 } from 'lucide-react'

// Eagerly loaded (small, always needed)
import { LoginPage } from '@/features/auth/login-page'

// Helper for resilient lazy loading with chunk retry on version update
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((error) => {
      // If a dynamic import chunk fails to load (e.g. after a redeployment), reload once
      const storageKey = 'fandt_chunk_reload'
      const hasReloaded = sessionStorage.getItem(storageKey)
      if (!hasReloaded) {
        sessionStorage.setItem(storageKey, 'true')
        window.location.reload()
      }
      throw error
    })
  )
}

// Lazy-loaded feature pages with automatic chunk reload retry
const DashboardPage = lazyWithRetry(() =>
  import('@/features/dashboard/dashboard-page').then((m) => ({ default: m.DashboardPage }))
)
const FinancePage = lazyWithRetry(() =>
  import('@/features/finance/finance-page').then((m) => ({ default: m.FinancePage }))
)
const TransactionsPage = lazyWithRetry(() =>
  import('@/features/finance/transactions-page').then((m) => ({ default: m.TransactionsPage }))
)
const BillsPage = lazyWithRetry(() =>
  import('@/features/finance/bills-page').then((m) => ({ default: m.BillsPage }))
)
const WalletsPage = lazyWithRetry(() =>
  import('@/features/finance/wallets-page').then((m) => ({ default: m.WalletsPage }))
)
const FinanceSettingsPage = lazyWithRetry(() =>
  import('@/features/finance/finance-settings-page').then((m) => ({ default: m.FinanceSettingsPage }))
)
const TasksPage = lazyWithRetry(() =>
  import('@/features/tasks/tasks-page').then((m) => ({ default: m.TasksPage }))
)
const ProductivityPage = lazyWithRetry(() =>
  import('@/features/productivity/productivity-page').then((m) => ({ default: m.ProductivityPage }))
)
const TaskDetailPage = lazyWithRetry(() =>
  import('@/features/tasks/task-detail-page').then((m) => ({ default: m.TaskDetailPage }))
)
const CalendarPage = lazyWithRetry(() =>
  import('@/features/calendar/calendar-page').then((m) => ({ default: m.CalendarPage }))
)
const WishlistPage = lazyWithRetry(() =>
  import('@/features/wishlist/wishlist-page').then((m) => ({ default: m.WishlistPage }))
)
const SettingsPage = lazyWithRetry(() =>
  import('@/features/settings/settings-page').then((m) => ({ default: m.SettingsPage }))
)

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 size={24} className="animate-spin text-amber-500" />
    </div>
  )
}

function PageErrorBoundary() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div className="lisso-card p-6 max-w-sm w-full text-center space-y-3">
        <p className="text-sm font-bold text-stone-900 dark:text-stone-100">Gagal memuat halaman</p>
        <p className="text-xs text-stone-500 dark:text-stone-400">Terjadi pembaruan aplikasi. Silakan muat ulang.</p>
        <button
          onClick={() => {
            sessionStorage.removeItem('fandt_chunk_reload')
            window.location.reload()
          }}
          className="lisso-btn-black text-xs w-full py-2"
        >
          Muat Ulang
        </button>
      </div>
    </div>
  )
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    errorElement: <PageErrorBoundary />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/',
        element: <AppShell />,
        errorElement: <PageErrorBoundary />,
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
    ],
  },
])
