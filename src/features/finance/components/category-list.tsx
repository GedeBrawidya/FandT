import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useArchiveCategory,
} from '@/features/finance/hooks/use-categories'
import type { Category } from '@/types/database'
import { Plus, Edit2, Archive, Tag } from 'lucide-react'
import { confirmDialog } from '@/components/ui/confirm-dialog'

const KIND_LABELS = {
  expense: 'Expense',
  income: 'Income',
  task: 'Task',
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b',
]

export function CategoryList() {
  const [selectedKind, setSelectedKind] = useState<'expense' | 'income' | 'task'>('expense')
  const { data: categories = [], isLoading } = useCategories(selectedKind)
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const archiveMutation = useArchiveCategory()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#10b981')
  const [icon, setIcon] = useState('tag')

  const handleOpenAdd = () => {
    setEditingCategory(null)
    setName('')
    setColor('#10b981')
    setIcon('tag')
    setDialogOpen(true)
  }

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c)
    setName(c.name)
    setColor(c.color || '#10b981')
    setIcon(c.icon || 'tag')
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (editingCategory) {
      const ok = await confirmDialog({
        title: 'Save Category',
        description: `Save changes to category "${name.trim()}"?`,
        confirmText: 'Save',
        variant: 'default',
      })
      if (!ok) return
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        data: { name: name.trim(), color, icon },
      })
    } else {
      await createMutation.mutateAsync({
        kind: selectedKind,
        name: name.trim(),
        color,
        icon,
        sort_order: categories.length + 1,
        is_archived: false,
      })
    }
    setDialogOpen(false)
  }

  const handleArchive = async (c: Category) => {
    const ok = await confirmDialog({
      title: 'Archive Category',
      description: `Archive category "${c.name}"? It will no longer appear in primary options.`,
      confirmText: 'Archive',
      cancelText: 'Cancel',
      variant: 'destructive',
    })
    if (ok) {
      await archiveMutation.mutateAsync(c.id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-white/[0.08]">
          {(['expense', 'income', 'task'] as const).map((kind) => (
            <button
              key={kind}
              onClick={() => setSelectedKind(kind)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedKind === kind
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {KIND_LABELS[kind]}
            </button>
          ))}
        </div>

        <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 lisso-btn-black">
          Add Category
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
        </div>
      ) : categories.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center gap-3">
          <Tag size={28} className="text-stone-400" />
          <p className="text-sm text-stone-500 dark:text-stone-400">No categories found for {KIND_LABELS[selectedKind]}.</p>
          <Button size="sm" onClick={handleOpenAdd} className="lisso-btn-black">
            Add Category
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {categories.map((c) => (
            <Card
              key={c.id}
              className="p-3.5 flex items-center justify-between border border-stone-200/80 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/[0.16] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {c.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleArchive(c)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Archive"
                >
                  <Archive size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? 'Edit Category' : `Add Category (${KIND_LABELS[selectedKind]})`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Category Name</Label>
            <Input
              id="cat-name"
              placeholder="e.g., Dining, Transport, Salary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-stone-800 dark:text-stone-200 font-semibold">Color Selection</Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-stone-900 dark:ring-white ring-offset-2 ring-offset-[#FAF7F2] dark:ring-offset-stone-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="lisso-btn-black font-semibold"
            >
              Save
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
