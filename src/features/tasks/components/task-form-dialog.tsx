import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useCategories } from '@/features/finance/hooks/use-categories'
import { useCreateTask, useUpdateTask } from '@/features/tasks/hooks/use-tasks'
import type { Task } from '@/types/database'
import { confirmDialog } from '@/components/ui/confirm-dialog'
import { X, Plus, Trash2 } from 'lucide-react'

interface TaskFormDialogProps {
  open: boolean
  onClose: () => void
  initialTask?: Task | null
  initialStatus?: 'todo' | 'doing' | 'done'
}

export function TaskFormDialog({ open, onClose, initialTask, initialStatus }: TaskFormDialogProps) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med')
  const [status, setStatus] = useState<'todo' | 'doing' | 'done'>('todo')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [subtasks, setSubtasks] = useState<string[]>([])
  const [newSubtaskInput, setNewSubtaskInput] = useState('')

  const { data: categories = [] } = useCategories('task')
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title)
      setNotes(initialTask.notes ?? '')
      setCategoryId(initialTask.category_id ?? '')
      setPriority(initialTask.priority as 'low' | 'med' | 'high')
      setStatus(initialTask.status)
      if (initialTask.due_at) {
        const d = new Date(initialTask.due_at)
        setDueDate(format(d, 'yyyy-MM-dd'))
        setDueTime(initialTask.all_day ? '' : format(d, 'HH:mm'))
      } else {
        setDueDate('')
        setDueTime('')
      }
      setSubtasks((initialTask.subtasks ?? []).map((s) => s.title))
    } else {
      setTitle('')
      setNotes('')
      setCategoryId(categories[0]?.id ?? '')
      setPriority('med')
      setStatus(initialStatus || 'todo')
      setDueDate(format(new Date(), 'yyyy-MM-dd'))
      setDueTime('')
      setSubtasks([])
    }
  }, [initialTask, initialStatus, categories, open])

  if (!open) return null

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return
    setSubtasks((prev) => [...prev, newSubtaskInput.trim()])
    setNewSubtaskInput('')
  }

  const handleRemoveSubtask = (idx: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    let due_at: string | null = null
    const all_day = !dueTime

    if (dueDate) {
      due_at = dueTime
        ? new Date(`${dueDate}T${dueTime}:00`).toISOString()
        : new Date(`${dueDate}T23:59:59`).toISOString()
    }

    if (initialTask) {
      const ok = await confirmDialog({
        title: 'Save Task',
        description: `Save updates to "${title.trim()}"?`,
        confirmText: 'Save',
        variant: 'default',
      })
      if (!ok) return
      await updateTask.mutateAsync({
        id: initialTask.id,
        data: {
          title: title.trim(),
          notes: notes.trim() || null,
          category_id: categoryId || null,
          priority,
          status,
          due_at,
          all_day,
        },
      })
    } else {
      await createTask.mutateAsync({
        title: title.trim(),
        notes: notes.trim() || null,
        category_id: categoryId || null,
        priority,
        status,
        due_at,
        all_day,
        type: 'task',
        completed_at: status === 'done' ? new Date().toISOString() : null,
        recurrence_rule: null,
        google_event_id: null,
        sort_order: 0,
        deleted_at: null,
        subtaskTitles: subtasks,
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="lisso-card w-full max-w-lg p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar relative">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            {initialTask ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Complete quarterly review..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-semibold h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
              Notes / Details
            </label>
            <textarea
              rows={3}
              placeholder="Add details, links, or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs font-medium p-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none resize-none"
            />
          </div>

          {/* Status Column Selector */}
          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1.5 block">
              Board Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: 'todo', label: 'To Do' },
                  { key: 'doing', label: 'Doing' },
                  { key: 'done', label: 'Done' },
                ] as const
              ).map(({ key, label }) => {
                const isSelected = status === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatus(key)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-stone-700'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs font-semibold h-11 px-3 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'med' | 'high')}
                className="w-full text-xs font-semibold h-11 px-3 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs font-medium h-11 px-3 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Time (Optional)
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full text-xs font-medium h-11 px-3 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
              />
            </div>
          </div>

          {/* Subtasks checklist builder */}
          {!initialTask && (
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 block">
                Subtask Checklist
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add subtask..."
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSubtask()
                    }
                  }}
                  className="flex-1 text-xs font-medium h-10 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="lisso-btn-secondary text-xs px-3"
                >
                  <Plus size={14} />
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {subtasks.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40 text-xs"
                    >
                      <span className="text-stone-800 dark:text-stone-200 font-medium">{st}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(i)}
                        className="text-stone-400 hover:text-rose-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTask.isPending || updateTask.isPending}
              className="lisso-btn-black text-xs"
            >
              {createTask.isPending || updateTask.isPending ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
