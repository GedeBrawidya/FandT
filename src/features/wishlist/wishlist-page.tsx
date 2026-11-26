import { useState, useMemo } from 'react'
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist'
import { WishlistFormDialog } from '@/features/wishlist/components/wishlist-form-dialog'
import { WishlistDepositDialog } from '@/features/wishlist/components/wishlist-deposit-dialog'
import { useUpdateSavingsTarget, useBudgetPeriod } from '@/features/finance/hooks/use-allowance'
import { formatRupiah } from '@/lib/format'
import type { WishlistItem } from '@/types/database'
import {
  Plus,
  LayoutGrid,
  List,
  CheckCircle2,
  ExternalLink,
  Pencil,
  Trash2,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

export function WishlistPage() {
  const { items, isLoading, deleteItem, updateItem } = useWishlist()
  const { data: period } = useBudgetPeriod()
  const updateSavingsTarget = useUpdateSavingsTarget()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'active' | 'achieved'>('active')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)
  const [depositItem, setDepositItem] = useState<WishlistItem | null>(null)
  const [targetSetSuccess, setTargetSetSuccess] = useState<string | null>(null)

  // Demo fallback items if empty
  const displayItems: (WishlistItem & { contributions: any[] })[] = useMemo(() => {
    return items

    return [
      {
        id: 'sample-wish-1',
        user_id: '00000000-0000-0000-0000-000000000001',
        name: 'MacBook Pro M4 14" Space Black',
        image_path: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        target_price: 28999000,
        url: 'https://apple.com/macbook-pro',
        priority: 5,
        status: 'menabung',
        note: 'Untuk upgrade perangkat development & multitasking harian.',
        achieved_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        contributions: [{ id: 'c1', item_id: 'sample-wish-1', amount: 12000000, contributed_on: '2026-11-20' }],
      },
      {
        id: 'sample-wish-2',
        user_id: '00000000-0000-0000-0000-000000000001',
        name: 'Sony WH-1000XM5 Noise Cancelling',
        image_path: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        target_price: 4999000,
        url: null,
        priority: 4,
        status: 'menabung',
        note: 'Fokus coding tanpa distraksi.',
        achieved_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        contributions: [{ id: 'c2', item_id: 'sample-wish-2', amount: 3500000, contributed_on: '2026-11-15' }],
      },
      {
        id: 'sample-wish-3',
        user_id: '00000000-0000-0000-0000-000000000001',
        name: 'Mechanical Keyboard Custom QMK',
        image_path: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        target_price: 2400000,
        url: null,
        priority: 3,
        status: 'tercapai',
        note: 'Gateron Oil King switch dengan keycaps PBT.',
        achieved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        contributions: [{ id: 'c3', item_id: 'sample-wish-3', amount: 2400000, contributed_on: '2026-11-01' }],
      },
    ]
  }, [items])

  const filteredItems = useMemo(() => {
    if (activeTab === 'achieved') {
      return displayItems.filter((it) => it.status === 'tercapai')
    }
    return displayItems.filter((it) => it.status !== 'tercapai')
  }, [displayItems, activeTab])

  // Set wishlist target as period savings target
  const handleDeleteItem = async (item: WishlistItem) => {
    if (window.confirm(`Hapus impian "${item.name}"?`)) {
      await deleteItem.mutateAsync(item.id)
    }
  }

  const handleSetAsPeriodTarget = async (item: WishlistItem) => {
    if (!period) {
      alert('Atur periode keuangan terlebih dahulu di menu Pengaturan.')
      return
    }
    // Set 20% of target as monthly savings target or full target
    const targetContribution = Math.min(item.target_price, Math.round(item.target_price / 3))
    await updateSavingsTarget.mutateAsync({
      periodId: period.id,
      amount: targetContribution,
    })
    setTargetSetSuccess(item.id)
    setTimeout(() => setTargetSetSuccess(null), 3000)
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Wishlist &amp; Vision Board
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Save your dream goals, track savings, and connect them directly to your daily budget allowance.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-full bg-stone-200/70 dark:bg-[#141414] border border-transparent dark:border-white/[0.08]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#202020] text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
              title="Vision Board"
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline">Vision Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#202020] text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
              title="List View"
            >
              <List size={15} />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingItem(null)
              setFormOpen(true)
            }}
            className="lisso-btn-black text-xs gap-1.5"
          >
            <Plus size={16} />
            <span>Add Wishlist Item</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-stone-200/60 dark:border-white/[0.06] pb-3">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
            activeTab === 'active'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
          }`}
        >
          Active Savings
        </button>
        <button
          onClick={() => setActiveTab('achieved')}
          className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
            activeTab === 'achieved'
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
          }`}
        >
          Achieved Goals (Archive)
        </button>
      </div>

      {/* Main Vision Board Grid or List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const contributions = item.contributions ?? []
            const savedAmount = contributions.reduce((acc: number, c: any) => acc + (c.amount ?? 0), 0)
            const pct = Math.min(100, Math.round((savedAmount / (item.target_price || 1)) * 100))
            const isTargetSet = targetSetSuccess === item.id

            return (
              <div
                key={item.id}
                className="lisso-card overflow-hidden flex flex-col justify-between group hover:border-stone-300 dark:hover:border-stone-700 transition-all"
              >
                {/* Image Cover */}
                <div className="h-48 w-full bg-stone-100 dark:bg-[#141414] relative overflow-hidden">
                  {item.image_path ? (
                    <img
                      src={item.image_path}
                      alt={item.name}
                      className="h-full w-full object-cover transition-colors"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-stone-400 text-xs font-bold">
                      No Image
                    </div>
                  )}

                  {/* Priority pill badge */}
                  <span className="absolute top-3 right-3 lisso-pill-green shadow-sm">
                    Priority {item.priority}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Target: <span className="font-bold text-stone-800 dark:text-stone-200">{formatRupiah(item.target_price)}</span>
                    </p>
                    {item.note && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1">
                        {item.note}
                      </p>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-[#59715A] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#3F6244] dark:text-[#B5D8B8]">
                        {formatRupiah(savedAmount)} ({pct}%)
                      </span>
                      <span className="text-stone-400">
                        Remaining: {formatRupiah(Math.max(0, item.target_price - savedAmount))}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-stone-100 dark:border-white/[0.08] flex items-center justify-between gap-2">
                    {item.status !== 'tercapai' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDepositItem(item)}
                          className="lisso-btn-black text-xs px-3.5 py-1.5"
                        >
                          + Deposit
                        </button>
                        <button
                          onClick={() => handleSetAsPeriodTarget(item)}
                          className="lisso-btn-secondary text-xs px-3 py-1.5"
                          title="Connect to monthly savings target"
                        >
                          {isTargetSet ? '✓ Connected' : 'Set as Goal'}
                        </button>
                      </div>
                    ) : (
                      <span className="lisso-pill-green text-xs">Goal Achieved!</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-[#181818] flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setEditingItem(item)
                          setFormOpen(true)
                        }}
                        className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-[#181818] flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                        title="Edit impian"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="h-8 w-8 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Hapus impian"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const contributions = item.contributions ?? []
            const savedAmount = contributions.reduce((acc: number, c: any) => acc + (c.amount ?? 0), 0)
            const pct = Math.min(100, Math.round((savedAmount / (item.target_price || 1)) * 100))

            return (
              <div
                key={item.id}
                className="lisso-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Target: {formatRupiah(item.target_price)} • Saved: {formatRupiah(savedAmount)} ({pct}%)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {item.status !== 'tercapai' && (
                    <button
                      onClick={() => setDepositItem(item)}
                      className="lisso-btn-black text-xs px-4 py-2"
                    >
                      + Add Deposit
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingItem(item)
                      setFormOpen(true)
                    }}
                    className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-[#181818] flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                    title="Edit impian"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="h-8 w-8 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Hapus impian"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form Dialog */}
      <WishlistFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialItem={editingItem}
      />

      {/* Deposit Dialog */}
      <WishlistDepositDialog
        open={Boolean(depositItem)}
        onClose={() => setDepositItem(null)}
        item={depositItem}
      />
    </div>
  )
}
