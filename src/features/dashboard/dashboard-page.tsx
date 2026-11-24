import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth'
import { useDailyAllowance, useBudgetPeriod } from '@/features/finance/hooks/use-allowance'
import { useWalletBalances } from '@/features/finance/hooks/use-wallets'
import { useBills } from '@/features/finance/hooks/use-bills'
import { useTasks, useToggleTaskStatus } from '@/features/tasks/hooks/use-tasks'
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist'
import { useNotes } from '@/features/notes/hooks/use-notes'
import { formatRupiah } from '@/lib/format'
import { QuickAddSheet } from '@/features/finance/components/quick-add-sheet'
import { ArrowRight, Circle, Plus, Sparkles } from 'lucide-react'

const priorityLabel = { high: 'High', med: 'Medium', low: 'Low' } as const

function dateLabel(value: string | null) {
  if (!value) return 'No due date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'No due date' : new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date)
}

export function DashboardPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const { data: allowance } = useDailyAllowance()
  const { data: period } = useBudgetPeriod()
  const { data: walletBalances = [] } = useWalletBalances()
  const { data: bills = [] } = useBills()
  const { data: tasks = [] } = useTasks()
  const { items: wishlist } = useWishlist()
  const { notes = [] } = useNotes()
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

  return <div className="dashboard-screen animate-in fade-in duration-300">
    <section className="dashboard-intro">
      <div><p className="eyebrow">Today's overview</p><h1>Hello, {userName}</h1></div>
      <div className="dashboard-actions"><button onClick={() => navigate('/finance/settings')} className="dashboard-period">{period ? `${period.start_date} — ${period.end_date}` : 'Set budget period'}</button><button onClick={() => setQuickAddOpen(true)} className="lisso-btn-black dashboard-add"><Plus size={16} /> Add transaction</button></div>
    </section>
    <section className="dashboard-grid" aria-label="Dashboard overview">
      <aside className="dashboard-rail dashboard-left-rail">
        <article className="dashboard-card dashboard-budget"><div className="card-kicker"><span>Daily allowance</span><span className={budgetLeft >= 0 ? 'status-good' : 'status-danger'}>{budgetLeft >= 0 ? 'Safe' : 'Over budget'}</span></div><p className="dashboard-amount">{formatRupiah(budgetLeft)}</p><p className="card-copy">Spent {formatRupiah(budgetUsed)} of {formatRupiah(budgetCap)}</p><div className="dashboard-meter"><i style={{ width: `${budgetProgress}%` }} /></div><button onClick={() => setQuickAddOpen(true)} className="dashboard-link">Record expense <ArrowRight size={14} /></button></article>
        <article className="dashboard-card dashboard-balance"><div className="card-kicker"><span>Total balance</span><button onClick={() => navigate('/finance/wallets')}>Manage wallets</button></div><p className="dashboard-amount">{formatRupiah(totalBalance)}</p><p className="card-copy">{walletBalances.length} active wallets · remaining budget {formatRupiah(allowance?.sisa_budget ?? 0)}</p><div className="wallet-list-mini">{walletBalances.slice(0, 3).map((wallet) => <span key={wallet.wallet_id}>{wallet.name}: <b>{formatRupiah(wallet.balance)}</b></span>)}</div></article>
        <article className="dashboard-card dashboard-wishlist"><div className="card-kicker"><span>Dream target</span><button onClick={() => navigate('/wishlist')}>View wishlist</button></div>{activeWish ? <><h2>{activeWish.name}</h2><p className="card-copy">{formatRupiah(savedWish)} of {formatRupiah(activeWish.target_price)}</p><div className="dashboard-meter"><i style={{ width: `${wishProgress}%` }} /></div><p className="progress-copy">{wishProgress}% funded</p></> : <div className="empty-mini"><p>No active target yet.</p><button onClick={() => navigate('/wishlist')}>Add target</button></div>}</article>
      </aside>
      <section className="dashboard-middle-rail" aria-label="Agenda and tasks">
        <div className="dashboard-column-title"><span>Today's agenda</span><button onClick={() => navigate('/calendar')}>View calendar <ArrowRight size={13} /></button></div>
        <article className="dashboard-card dashboard-tasks"><div className="card-kicker"><span>Next tasks</span><button onClick={() => navigate('/tasks')}>View all</button></div><div className="dashboard-list">{todayTasks.length ? todayTasks.map((task) => <div key={task.id} className="task-row"><button aria-label={`Mark ${task.title} as done`} onClick={() => toggleTask.mutate({ id: task.id, status: 'done' })}><Circle size={17} /></button><button onClick={() => navigate(`/tasks/${task.id}`)} className="task-title"><b>{task.title}</b><small>{dateLabel(task.due_at)}</small></button><span className={`priority priority-${task.priority}`}>{priorityLabel[task.priority]}</span></div>) : <div className="empty-mini"><p>No active tasks.</p><button onClick={() => navigate('/tasks')}>Add task</button></div>}</div></article>
        <article className="dashboard-card dashboard-bills"><div className="card-kicker"><span>Active bills</span><button onClick={() => navigate('/finance/bills')}>Manage bills</button></div><div className="dashboard-list">{upcomingBills.length ? upcomingBills.map((bill) => <button key={bill.id} onClick={() => navigate('/finance/bills')} className="bill-row"><span><b>{bill.name}</b><small>Due: {bill.due_date ?? `Day ${bill.due_day}`}</small></span><strong>{formatRupiah(bill.amount)}</strong></button>) : <div className="empty-mini"><p>No active bills.</p><button onClick={() => navigate('/finance/bills')}>Add bill</button></div>}</div></article>
      </section>
      <aside className="dashboard-rail dashboard-right-rail">
        <article className="dashboard-card dashboard-note"><div className="card-kicker"><span>Recent notes</span><button onClick={() => navigate('/productivity')}>View notes</button></div>{notes[0] ? <button onClick={() => navigate('/productivity')} className="note-preview"><span>{notes[0].icon}</span><div><h2>{notes[0].title}</h2><p>{notes[0].content.replace(/\n/g, ' ').slice(0, 128)}</p></div></button> : <div className="empty-mini"><p>No notes yet.</p><button onClick={() => navigate('/productivity')}>Add note</button></div>}</article>
        <article className="dashboard-card dashboard-focus"><div className="focus-icon"><Sparkles size={17} /></div><p className="card-kicker">Daily focus</p><h2>Start with what matters most.</h2><p className="card-copy">Organize tasks, check your balance, and keep momentum in one calm place.</p><button onClick={() => navigate('/tasks')} className="dashboard-link">Open tasks <ArrowRight size={14} /></button></article>
      </aside>
    </section>
    <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
  </div>
}
