import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuth } from '@/app/auth'
import { useDailyAllowance, useBudgetPeriod } from '@/features/finance/hooks/use-allowance'
import { useWalletBalances } from '@/features/finance/hooks/use-wallets'
import { useBills } from '@/features/finance/hooks/use-bills'
import { useTasks, useToggleTaskStatus } from '@/features/tasks/hooks/use-tasks'
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist'
import { useNotes } from '@/features/notes/hooks/use-notes'
import { formatRupiah } from '@/lib/format'
import { QuickAddSheet } from '@/features/finance/components/quick-add-sheet'
import { TaskFormDialog } from '@/features/tasks/components/task-form-dialog'
import { WishlistFormDialog } from '@/features/wishlist/components/wishlist-form-dialog'
import { NoteModal } from '@/features/notes/components/note-modal'
import { EventFormModal } from '@/features/calendar/components/event-form-modal'
import type { NoteDoc } from '@/lib/mock-storage'
import {
  ArrowRight,
  Circle,
  Plus,
  CheckSquare,
  Calendar,
  Target,
  StickyNote,
} from 'lucide-react'

const priorityLabel = { high: 'High', med: 'Medium', low: 'Low' } as const

function dateLabel(value: string | null) {
  if (!value) return 'No due date'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'No due date'
    : new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date)
}

export function DashboardPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [wishlistDialogOpen, setWishlistDialogOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)

  const { data: allowance } = useDailyAllowance()
  const { data: period } = useBudgetPeriod()
  const { data: walletBalances = [] } = useWalletBalances()
  const { data: bills = [] } = useBills()
  const { data: tasks = [] } = useTasks()
  const { items: wishlist } = useWishlist()
  const { notes = [], saveNote } = useNotes()
  const toggleTask = useToggleTaskStatus()

  const userName = session?.user?.user_metadata?.full_name?.split(' ')[0] ?? session?.user?.email?.split('@')[0] ?? 'User'
  const totalBalance = walletBalances.reduce((sum, wallet) => sum + (wallet.balance || 0), 0)
  const todayTasks = tasks.filter((task) => task.status !== 'done').slice(0, 3)
  const upcomingBills = bills.filter((bill) => bill.is_active).slice(0, 2)
  const activeWish = wishlist.find((item) => item.status !== 'tercapai')
  const savedWish = activeWish?.contributions?.reduce((sum, contribution) => sum + contribution.amount, 0) ?? 0
  const wishProgress = activeWish ? Math.min(100, Math.round((savedWish / Math.max(activeWish.target_price, 1)) * 100)) : 0
  const budgetLeft = allowance?.sisa_hari_ini ?? 0
  const budgetCap = allowance?.jatah_harian ?? 0
  const budgetUsed = allowance?.terpakai_hari_ini ?? 0
  const budgetProgress = budgetCap > 0 ? Math.min(100, Math.max(0, (budgetLeft / budgetCap) * 100)) : 0

  const activeMonthYear = format(new Date(), 'MMMM yyyy')

  const handleSaveNote = async (data: Partial<NoteDoc> & { title: string; content: string }) => {
    await saveNote(data)
    setNoteModalOpen(false)
  }

  return (
    <div className="dashboard-screen animate-in fade-in duration-300">
      <section className="dashboard-intro">
        <div>
          <p className="eyebrow">Today's overview</p>
          <h1>Hello, {userName}</h1>
        </div>
        <div className="dashboard-actions">
          <button
            onClick={() => navigate('/finance/settings')}
            className="dashboard-period"
            title="Budget period settings"
          >
            {activeMonthYear}
          </button>
          <button onClick={() => setQuickAddOpen(true)} className="lisso-btn-black dashboard-add">
            <Plus size={16} /> Add transaction
          </button>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Dashboard overview">
        <aside className="dashboard-rail dashboard-left-rail">
          <article className="dashboard-card dashboard-budget">
            <div className="card-kicker">
              <span>Daily allowance</span>
              <span className={budgetLeft >= 0 ? 'status-good' : 'status-danger'}>
                {budgetLeft >= 0 ? 'Safe' : 'Over budget'}
              </span>
            </div>
            <p className="dashboard-amount">{formatRupiah(budgetLeft)}</p>
            <p className="card-copy">Spent {formatRupiah(budgetUsed)} of {formatRupiah(budgetCap)}</p>
            <div className="dashboard-meter"><i style={{ width: `${budgetProgress}%` }} /></div>
            <button onClick={() => setQuickAddOpen(true)} className="dashboard-link">
              Record expense <ArrowRight size={14} />
            </button>
          </article>

          <article className="dashboard-card dashboard-balance">
            <div className="card-kicker">
              <span>Total balance</span>
              <button onClick={() => navigate('/finance/wallets')}>Manage wallets</button>
            </div>
            <p className="dashboard-amount">{formatRupiah(totalBalance)}</p>
            <p className="card-copy">
              {walletBalances.length} active wallets · remaining budget {formatRupiah(allowance?.sisa_budget ?? 0)}
            </p>
            <div className="wallet-list-mini">
              {walletBalances.slice(0, 3).map((wallet) => (
                <span key={wallet.wallet_id}>{wallet.name}: <b>{formatRupiah(wallet.balance)}</b></span>
              ))}
            </div>
          </article>

          <article className="dashboard-card dashboard-wishlist">
            <div className="card-kicker">
              <span>Dream target</span>
              <button onClick={() => navigate('/wishlist')}>View wishlist</button>
            </div>
            {activeWish ? (
              <>
                <h2>{activeWish.name}</h2>
                <p className="card-copy">{formatRupiah(savedWish)} of {formatRupiah(activeWish.target_price)}</p>
                <div className="dashboard-meter"><i style={{ width: `${wishProgress}%` }} /></div>
                <p className="progress-copy">{wishProgress}% funded</p>
              </>
            ) : (
              <div className="empty-mini">
                <p>No active target yet.</p>
                <button onClick={() => navigate('/wishlist')}>Add target</button>
              </div>
            )}
          </article>
        </aside>

        <section className="dashboard-middle-rail" aria-label="Agenda and tasks">
          <div className="dashboard-column-title">
            <span>Today's agenda</span>
            <button onClick={() => navigate('/calendar')}>View calendar <ArrowRight size={13} /></button>
          </div>

          <article className="dashboard-card dashboard-tasks">
            <div className="card-kicker">
              <span>Next tasks</span>
              <button onClick={() => navigate('/tasks')}>View all</button>
            </div>
            <div className="dashboard-list">
              {todayTasks.length ? (
                todayTasks.map((task) => (
                  <div key={task.id} className="task-row">
                    <button
                      aria-label={`Mark ${task.title} as done`}
                      onClick={() => toggleTask.mutate({ id: task.id, status: 'done' })}
                    >
                      <Circle size={17} />
                    </button>
                    <button onClick={() => navigate(`/tasks/${task.id}`)} className="task-title">
                      <b>{task.title}</b>
                      <small>{dateLabel(task.due_at)}</small>
                    </button>
                    <span className={`priority priority-${task.priority}`}>
                      {priorityLabel[task.priority]}
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-mini">
                  <p>No active tasks.</p>
                  <button onClick={() => navigate('/tasks')}>Add task</button>
                </div>
              )}
            </div>
          </article>

          <article className="dashboard-card dashboard-bills">
            <div className="card-kicker">
              <span>Active bills</span>
              <button onClick={() => navigate('/finance/bills')}>Manage bills</button>
            </div>
            <div className="dashboard-list">
              {upcomingBills.length ? (
                upcomingBills.map((bill) => (
                  <button key={bill.id} onClick={() => navigate('/finance/bills')} className="bill-row">
                    <span>
                      <b>{bill.name}</b>
                      <small>Due: {bill.due_date ?? `Day ${bill.due_day}`}</small>
                    </span>
                    <strong>{formatRupiah(bill.amount)}</strong>
                  </button>
                ))
              ) : (
                <div className="empty-mini">
                  <p>No active bills.</p>
                  <button onClick={() => navigate('/finance/bills')}>Add bill</button>
                </div>
              )}
            </div>
          </article>
        </section>

        <aside className="dashboard-rail dashboard-right-rail">
          <article className="dashboard-card dashboard-note">
            <div className="card-kicker">
              <span>Recent notes</span>
              <button onClick={() => navigate('/productivity')}>View notes</button>
            </div>
            {notes[0] ? (
              <button onClick={() => navigate('/productivity')} className="note-preview">
                <span>{notes[0].icon}</span>
                <div>
                  <h2>{notes[0].title}</h2>
                  <p>{notes[0].content.replace(/\n/g, ' ').slice(0, 128)}</p>
                </div>
              </button>
            ) : (
              <div className="empty-mini">
                <p>No notes yet.</p>
                <button onClick={() => navigate('/productivity')}>Add note</button>
              </div>
            )}
          </article>

          {/* Quick Shortcuts Card (Replacing Daily focus) */}
          <article className="dashboard-card dashboard-shortcuts">
            <div className="card-kicker">
              <span>Quick shortcuts</span>
              <span className="text-[10px] text-stone-400">Actions</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 xl:mt-2.5">
              <button
                type="button"
                onClick={() => setTaskDialogOpen(true)}
                className="shortcut-tile"
                title="Create to-do task"
              >
                <div className="shortcut-icon bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <CheckSquare size={15} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-title">To-Do</span>
                  <span className="shortcut-sub">Add task</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEventModalOpen(true)}
                className="shortcut-tile"
                title="Add calendar event"
              >
                <div className="shortcut-icon bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <Calendar size={15} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-title">Calendar</span>
                  <span className="shortcut-sub">Add note</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setWishlistDialogOpen(true)}
                className="shortcut-tile"
                title="Add saving target"
              >
                <div className="shortcut-icon bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Target size={15} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-title">Savings</span>
                  <span className="shortcut-sub">Add target</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNoteModalOpen(true)}
                className="shortcut-tile"
                title="Add note memo"
              >
                <div className="shortcut-icon bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                  <StickyNote size={15} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-title">Noted</span>
                  <span className="shortcut-sub">Add memo</span>
                </div>
              </button>
            </div>
          </article>
        </aside>
      </section>

      {/* Transaction Quick Add */}
      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />

      {/* Quick Action Dialogs */}
      <TaskFormDialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} />
      <EventFormModal open={eventModalOpen} onClose={() => setEventModalOpen(false)} />
      <WishlistFormDialog open={wishlistDialogOpen} onClose={() => setWishlistDialogOpen(false)} />
      <NoteModal open={noteModalOpen} onClose={() => setNoteModalOpen(false)} onSave={handleSaveNote} />
    </div>
  )
}
