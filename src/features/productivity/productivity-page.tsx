import { useState, useMemo } from 'react'
import { useBudgetPeriod, useDailyAllowance, useUpdateSavingsTarget, useUpdateDailyCap } from '@/features/finance/hooks/use-allowance'
import { useWalletBalances } from '@/features/finance/hooks/use-wallets'
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist'
import { useTasks, useToggleTaskStatus } from '@/features/tasks/hooks/use-tasks'
import { useNotes } from '@/features/notes/hooks/use-notes'
import { NoteModal } from '@/features/notes/components/note-modal'
import { formatRupiah } from '@/lib/format'
import { isToday, isPast } from 'date-fns'
import type { NoteDoc } from '@/lib/mock-storage'
import type { WishlistItem } from '@/types/database'
import {
  TrendingUp,
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Pencil,
  Check,
} from 'lucide-react'

export function ProductivityPage() {
  // Financial hooks
  const { data: allowance } = useDailyAllowance()
  const { data: period } = useBudgetPeriod()
  const { data: walletBalances = [] } = useWalletBalances()
  const updateSavings = useUpdateSavingsTarget()
  const updateDailyCap = useUpdateDailyCap()

  // Wishlist & Tasks hooks
  const { items: wishlistItems = [] } = useWishlist()
  const { data: tasks = [] } = useTasks()
  const toggleTaskStatus = useToggleTaskStatus()

  // Notes & Docs (Notion / Google Keep style)
  const { notes, saveNote, deleteNote } = useNotes()
  const [selectedNote, setSelectedNote] = useState<NoteDoc | null>(null)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [noteSearch, setNoteSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [activePanel, setActivePanel] = useState<'activity' | 'noted'>('activity')

  // State for active wishlist item target (Rule 5x)
  const [selectedWishlistId, setSelectedWishlistId] = useState<string>('')

  // Interactive Target Edit popover/state
  const [isEditingTarget, setIsEditingTarget] = useState(false)
  const [dailyCapInput, setDailyCapInput] = useState('')
  const [savingsTargetInput, setSavingsTargetInput] = useState('')
  const [targetSaveSuccess, setTargetSaveSuccess] = useState(false)

  // Calculations
  const totalSavings = walletBalances.reduce((sum, w) => sum + (w.balance ?? 0), 0)
  const jatahHarian = allowance?.jatah_harian ?? 50000
  const terpakaiHariIni = allowance?.terpakai_hari_ini ?? 0
  const sisaHariIni = allowance?.sisa_hari_ini ?? 50000
  const currentSavingsTarget = period?.savings_target ?? 500000

  // Active Wishlist Item
  const activeWishlist: WishlistItem = useMemo(() => {
    if (selectedWishlistId) {
      const found = wishlistItems.find((w) => w.id === selectedWishlistId)
      if (found) return found
    }
    return (
      wishlistItems[0] ?? {
        id: 'wish-sample',
        user_id: '',
        name: 'MacBook Pro M4 14" Space Black',
        target_price: 28999000,
        image_path: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        url: null,
        priority: 5,
        status: 'menabung',
        note: 'Safety Rule: Boleh dibeli saat tabungan > 5x harga barang',
        achieved_at: null,
        created_at: '',
        updated_at: '',
      }
    )
  }, [wishlistItems, selectedWishlistId])

  // Rule of 5x Calculation:
  // Wishlist item is only safely achievable when totalSavings >= 5x target_price!
  const targetPrice = activeWishlist.target_price || 1
  const safeBenchmark5x = targetPrice * 5
  const progress5xPercent = Math.min(100, Math.round((totalSavings / safeBenchmark5x) * 100))
  const isSafeToBuy = totalSavings >= safeBenchmark5x
  const shortfall5x = Math.max(0, safeBenchmark5x - totalSavings)

  // Tasks Due Today
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!t.due_at) return false
      const d = new Date(t.due_at)
      return isToday(d) || (isPast(d) && t.status !== 'done')
    })
  }, [tasks])

  const todayCompletedCount = todayTasks.filter((t) => t.status === 'done').length
  const todayTaskPercent = todayTasks.length > 0
    ? Math.round((todayCompletedCount / todayTasks.length) * 100)
    : 100

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
        n.content.toLowerCase().includes(noteSearch.toLowerCase())
      const matchesTag = selectedTag
        ? n.tag?.toLowerCase() === selectedTag.toLowerCase() ||
          (selectedTag === 'Notes' && n.tag === 'Catatan') ||
          (selectedTag === 'Study' && n.tag === 'Kuliah') ||
          (selectedTag === 'Plans' && n.tag === 'Rencana') ||
          (selectedTag === 'Projects' && n.tag === 'Project') ||
          (selectedTag === 'Ideas' && n.tag === 'Ide')
        : true
      return matchesSearch && matchesTag
    })
  }, [notes, noteSearch, selectedTag])

  // Save updated daily target & savings target (Syncs immediately with Dashboard & Finance)
  const handleSaveBudgetTargets = async (e: React.FormEvent) => {
    e.preventDefault()
    const newCap = parseInt(dailyCapInput, 10)
    const newSavings = parseInt(savingsTargetInput, 10)

    if (!isNaN(newCap) && newCap > 0) {
      await updateDailyCap.mutateAsync(newCap)
    }
    if (period && !isNaN(newSavings) && newSavings >= 0) {
      await updateSavings.mutateAsync({ periodId: period.id, amount: newSavings })
    }

    setTargetSaveSuccess(true)
    setTimeout(() => {
      setTargetSaveSuccess(false)
      setIsEditingTarget(false)
    }, 1200)
  }

  const handleOpenEditTargets = () => {
    setDailyCapInput(String(jatahHarian))
    setSavingsTargetInput(String(currentSavingsTarget))
    setIsEditingTarget(true)
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-300">
      <section className="lisso-card p-5 sm:p-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">Personal workspace</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">Plans, progress &amp; notes</h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400">Keep your daily budget, tasks and ideas in one calm place.</p>
        </div>
        <div className="flex rounded-full bg-stone-100 p-1 dark:bg-white/[0.08]">
          <button onClick={() => setActivePanel('activity')} className={`rounded-full px-5 py-2 text-xs font-bold transition-colors ${activePanel === 'activity' ? 'bg-stone-900 text-white dark:bg-white dark:text-black' : 'text-stone-500 hover:bg-[#EDE5D9] dark:hover:bg-white/[0.08]'}`}>Activity</button>
          <button onClick={() => setActivePanel('noted')} className={`rounded-full px-5 py-2 text-xs font-bold transition-colors ${activePanel === 'noted' ? 'bg-stone-900 text-white dark:bg-white dark:text-black' : 'text-stone-500 hover:bg-[#EDE5D9] dark:hover:bg-white/[0.08]'}`}>Noted</button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TOP 3 CARDS                                                  */}
      {/* 1: Wishlist Rule 5x | 2: Disiplin Jatah Harian | 3: Tugas Hari Ini */}
      {/* ============================================================ */}
      {activePanel === 'activity' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Wishlist Rule of 5x */}
        <div className="lisso-card p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Wishlist &amp; 5x Savings Rule
            </span>
            <span
              className={
                isSafeToBuy
                  ? 'lisso-pill-green'
                  : 'px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400'
              }
            >
              {isSafeToBuy ? 'Safe to Buy (>5x)' : 'Target 5x Savings'}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 truncate">
                {activeWishlist.name}
              </h3>
              {wishlistItems.length > 1 && (
                <select
                  value={selectedWishlistId || activeWishlist.id}
                  onChange={(e) => setSelectedWishlistId(e.target.value)}
                  className="text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 rounded-lg px-2 py-1 text-stone-600 dark:text-stone-300 border-none focus:outline-none"
                >
                  {wishlistItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Item Price: <span className="font-bold text-stone-800 dark:text-stone-200">{formatRupiah(targetPrice)}</span>
            </p>

            <div className="mt-3 p-3 rounded-2xl bg-stone-100/70 dark:bg-stone-800/50 space-y-1 text-xs">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-stone-500">Current Savings Balance:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{formatRupiah(totalSavings)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span className="text-stone-500">Safe Benchmark (5x Price):</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatRupiah(safeBenchmark5x)}</span>
              </div>
            </div>
          </div>

          {/* Progress bar towards 5x benchmark */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-stone-500">
              <span>Safe Balance Progress: {progress5xPercent}%</span>
              <span>{isSafeToBuy ? '5x Target Reached!' : `${formatRupiah(shortfall5x)} remaining`}</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  isSafeToBuy ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${progress5xPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Daily Allowance & Budget Targets */}
        <div className="lisso-card p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Daily Allowance &amp; Budget Targets
            </span>
            <button
              onClick={handleOpenEditTargets}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center gap-1"
            >
              <Pencil size={12} />
              <span>Edit Targets</span>
            </button>
          </div>

          {!isEditingTarget ? (
            <div>
              <p className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 tabular-nums">
                {formatRupiah(sisaHariIni)}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Remaining allowance today from <span className="font-bold text-stone-800 dark:text-stone-200">{formatRupiah(jatahHarian)}</span> cap
              </p>

              <div className="mt-3 p-3 rounded-2xl bg-stone-100/70 dark:bg-stone-800/50 space-y-1 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-stone-500">Spent Today:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{formatRupiah(terpakaiHariIni)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-stone-500">Period Savings Target:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{formatRupiah(currentSavingsTarget)}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveBudgetTargets} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">
                  Daily Allowance Cap (Rp)
                </label>
                <input
                  type="number"
                  value={dailyCapInput}
                  onChange={(e) => setDailyCapInput(e.target.value)}
                  className="w-full text-xs font-bold h-9 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">
                  Period Savings Target (Rp)
                </label>
                <input
                  type="number"
                  value={savingsTargetInput}
                  onChange={(e) => setSavingsTargetInput(e.target.value)}
                  className="w-full text-xs font-bold h-9 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingTarget(false)}
                  className="flex-1 py-1.5 rounded-xl text-xs font-semibold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-xl text-xs font-bold bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs flex items-center justify-center gap-1"
                >
                  {targetSaveSuccess ? <Check size={14} /> : null}
                  <span>{targetSaveSuccess ? 'Saved!' : 'Save & Sync'}</span>
                </button>
              </div>
            </form>
          )}

          <div className="pt-1">
            <span className="text-[11px] font-medium text-stone-400">
              Automatically syncs with Dashboard, Finance &amp; Daily Allowance.
            </span>
          </div>
        </div>

        {/* Card 3: Today's Tasks */}
        <div className="lisso-card p-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Today's Tasks
            </span>
            <span className="lisso-pill-green">
              {todayCompletedCount}/{todayTasks.length} Completed
            </span>
          </div>

          <div>
            <p className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 tabular-nums">
              {todayTaskPercent}%
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {todayTasks.length === 0
                ? 'No tasks due today.'
                : `${todayCompletedCount} of ${todayTasks.length} tasks completed today.`}
            </p>
          </div>

          {/* Quick List of Today's Tasks */}
          <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar pt-1">
            {todayTasks.length === 0 ? (
              <div className="p-3 text-center text-xs text-stone-400 bg-stone-100/50 dark:bg-stone-800/30 rounded-2xl">
                All tasks completed for today!
              </div>
            ) : (
              todayTasks.map((t) => {
                const isDone = t.status === 'done'
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/40 dark:hover:bg-stone-800/70 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleTaskStatus.mutate({ id: t.id, status: isDone ? 'todo' : 'done' })
                      }
                      className="shrink-0 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                    >
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <Circle size={16} />
                      )}
                    </button>
                    <span
                      className={`text-xs font-bold truncate flex-1 ${
                        isDone ? 'line-through text-stone-400' : 'text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {t.title}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>}

      {/* ============================================================ */}
      {/* NOTION / GOOGLE KEEP STYLE NOTES & DOCS SECTION              */}
      {/* ============================================================ */}
      {activePanel === 'noted' && <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
              Notes, Plans &amp; Docs
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              Personal workspace for ideas, study notes, project plans, and itineraries.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedNote(null)
              setNoteModalOpen(true)
            }}
            className="lisso-btn-black text-xs gap-1.5 self-start"
          >
            <Plus size={16} />
            <span>New Note</span>
          </button>
        </div>

        {/* Tag Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: '', label: 'All Documents' },
              { id: 'Notes', label: 'Notes' },
              { id: 'Study', label: 'Study' },
              { id: 'Itinerary', label: 'Itinerary' },
              { id: 'Plans', label: 'Plans' },
              { id: 'Projects', label: 'Projects' },
            ].map((item) => {
              const isSelected = selectedTag === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedTag(item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all shrink-0 ${
                    isSelected
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                      : 'bg-white dark:bg-[#141414] text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-white/[0.08]'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search size={14} className="absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Search notes or plans..."
              value={noteSearch}
              onChange={(e) => setNoteSearch(e.target.value)}
              className="w-full text-xs font-medium h-9 pl-9 pr-3.5 rounded-full bg-white dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/60 dark:border-white/[0.08] focus:outline-none"
            />
          </div>
        </div>

        {/* Notes Grid (Notion / Keep Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                setSelectedNote(note)
                setNoteModalOpen(true)
              }}
              className="group lisso-card overflow-hidden cursor-pointer hover:border-stone-400 dark:hover:border-stone-600 transition-all flex flex-col justify-between"
            >
              {/* Optional Cover Banner */}
              {note.cover_url && (
                <div className="h-32 w-full overflow-hidden shrink-0 relative">
                  <img
                    src={note.cover_url}
                    alt=""
                    className="h-full w-full object-cover transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xl shrink-0">{note.icon || '📝'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {note.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {note.title}
                  </h3>

                  {/* Multi-line Content Preview (Styled like Keep / Notion list) */}
                  <div className="text-xs text-stone-600 dark:text-stone-300 font-medium leading-relaxed whitespace-pre-line line-clamp-6 mt-2">
                    {note.content}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-white/[0.04] flex items-center justify-between text-[11px] text-stone-400 font-semibold">
                  <span>Click to open / edit</span>
                  <span className="text-stone-400">→</span>
                </div>
              </div>
            </div>
          ))}

          {/* Add Note Placeholder Card */}
          <div
            onClick={() => {
              setSelectedNote(null)
              setNoteModalOpen(true)
            }}
            className="min-h-[200px] border-2 border-dashed border-stone-300/80 dark:border-stone-700/80 hover:border-stone-500 rounded-[28px] p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-white/20 dark:bg-white/[0.02] hover:bg-white/60 dark:hover:bg-white/[0.05]"
          >
            <div className="h-10 w-10 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300">
              <Plus size={20} />
            </div>
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
              Add New Note or Plan
            </span>
          </div>
        </div>
      </div>}

      {/* Note Reader & Editor Modal */}
      <NoteModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        note={selectedNote}
        onSave={saveNote}
        onDelete={deleteNote}
      />
    </div>
  )
}
