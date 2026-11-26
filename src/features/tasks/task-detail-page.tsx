import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useTask, useToggleTaskStatus, useDeleteTask, useCreateSubtask, useToggleSubtask } from '@/features/tasks/hooks/use-tasks'
import { TaskFormDialog } from '@/features/tasks/components/task-form-dialog'
import { confirmDialog } from '@/components/ui/confirm-dialog'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  Share2,
  Download,
  ExternalLink,
} from 'lucide-react'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: task, isLoading } = useTask(id || '')
  const toggleStatus = useToggleTaskStatus()
  const deleteTask = useDeleteTask()
  const createSubtask = useCreateSubtask()
  const toggleSubtask = useToggleSubtask()

  const [editOpen, setEditOpen] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  if (isLoading) {
    return (
      <div className="lisso-card p-12 text-center text-xs text-stone-400">
        Loading task details...
      </div>
    )
  }

  // Fallback demo task if opened without DB
  const displayTask = task ?? {
    id: id || 'demo-task',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Review Pengeluaran & Sisa Jatah Periode',
    notes: 'Cek mutasi seminggu terakhir dan sesuaikan target tabungan untuk sisa hari periode berjalan.',
    type: 'task',
    category_id: null,
    priority: 'high',
    status: 'todo',
    due_at: new Date(Date.now() + 86400000).toISOString(),
    all_day: false,
    completed_at: null,
    recurrence_rule: null,
    google_event_id: null,
    sort_order: 1,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: {
      id: 'c1',
      user_id: '',
      kind: 'task',
      name: 'Personal',
      color: '#ec4899',
      icon: 'user',
      sort_order: 1,
      is_archived: false,
      created_at: '',
      updated_at: '',
    },
    subtasks: [
      { id: 'st-1', task_id: id || '', title: 'Export transactions to CSV', is_done: true, sort_order: 0, created_at: '', updated_at: '' },
      { id: 'st-2', task_id: id || '', title: 'Check utility and internet bills', is_done: false, sort_order: 1, created_at: '', updated_at: '' },
      { id: 'st-3', task_id: id || '', title: 'Allocate savings deposit', is_done: false, sort_order: 2, created_at: '', updated_at: '' },
    ],
  }

  const isDone = displayTask.status === 'done'

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    await createSubtask.mutateAsync({ taskId: displayTask.id, title: newSubtaskTitle.trim() })
    setNewSubtaskTitle('')
  }

  // Google Calendar URL Generator (PRD Stage A)
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(displayTask.title)
    const details = encodeURIComponent(displayTask.notes ?? 'Created from FandT Dashboard')
    const start = displayTask.due_at
      ? format(new Date(displayTask.due_at), "yyyyMMdd'T'HHmmss")
      : format(new Date(), "yyyyMMdd'T'HHmmss")
    const end = displayTask.due_at
      ? format(new Date(new Date(displayTask.due_at).getTime() + 3600000), "yyyyMMdd'T'HHmmss")
      : format(new Date(Date.now() + 3600000), "yyyyMMdd'T'HHmmss")

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to Tasks</span>
      </button>

      {/* Main Task Card */}
      <div className="lisso-card p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <button
              onClick={() =>
                toggleStatus.mutate({
                  id: displayTask.id,
                  status: isDone ? 'todo' : 'done',
                })
              }
              className="mt-1 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors shrink-0"
            >
              {isDone ? (
                <CheckCircle2 size={26} className="text-emerald-500" />
              ) : (
                <Circle size={26} />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <h1
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isDone
                    ? 'line-through text-stone-400 dark:text-stone-500'
                    : 'text-stone-900 dark:text-stone-100'
                }`}
              >
                {displayTask.title}
              </h1>
              <div className="flex items-center gap-2.5 mt-2 flex-wrap text-xs">
                {displayTask.category && (
                  <span className="lisso-pill-neutral font-semibold">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: displayTask.category.color }}
                    />
                    <span>{displayTask.category.name}</span>
                  </span>
                )}
                <span
                  className={
                    displayTask.priority === 'high'
                      ? 'lisso-pill-red'
                      : displayTask.priority === 'med'
                      ? 'lisso-pill-amber'
                      : 'lisso-pill-neutral'
                  }
                >
                  Priority: {displayTask.priority.toUpperCase()}
                </span>
                <span className={isDone ? 'lisso-pill-green' : 'lisso-pill-neutral'}>
                  {isDone ? 'Done' : 'To Do'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setEditOpen(true)}
              className="h-9 w-9 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-[#141414] dark:hover:bg-[#1c1c1c] flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors"
              title="Edit Task"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={async () => {
                const ok = await confirmDialog({
                  title: 'Delete Task',
                  description: `Are you sure you want to delete "${displayTask.title}"?`,
                  confirmText: 'Delete',
                  cancelText: 'Cancel',
                  variant: 'destructive',
                })
                if (ok) {
                  deleteTask.mutate(displayTask.id)
                  navigate('/tasks')
                }
              }}
              className="h-9 w-9 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center text-stone-400 hover:text-rose-600 transition-colors"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Notes & Description */}
        {displayTask.notes && (
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#141414] text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
            {displayTask.notes}
          </div>
        )}

        {/* Due Date Info */}
        {displayTask.due_at && (
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-400 p-3 rounded-2xl bg-stone-50 dark:bg-[#141414]">
            <Calendar size={15} className="text-stone-500" />
            <span>
              Due date:{' '}
              {format(new Date(displayTask.due_at), 'EEEE, dd MMMM yyyy HH:mm')}
            </span>
          </div>
        )}

        {/* Google Calendar Link (PRD Stage A) */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="lisso-btn-secondary text-xs gap-1.5"
          >
            <ExternalLink size={14} />
            <span>Add to Google Calendar</span>
          </a>
        </div>

        {/* Subtask Checklist Section */}
        <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-white/[0.08]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
              Subtask Checklist
            </h3>
            <span className="text-xs text-stone-400 font-semibold">
              {(displayTask.subtasks ?? []).filter((s) => s.is_done).length}/
              {(displayTask.subtasks ?? []).length} completed
            </span>
          </div>

          <div className="space-y-2">
            {(displayTask.subtasks ?? []).map((subtask) => (
              <div
                key={subtask.id}
                onClick={() =>
                  toggleSubtask.mutate({
                    id: subtask.id,
                    isDone: !subtask.is_done,
                    taskId: displayTask.id,
                  })
                }
                className="p-3 rounded-2xl bg-stone-50 dark:bg-[#141414] hover:bg-stone-100/70 dark:hover:bg-[#1c1c1c] flex items-center gap-3 cursor-pointer transition-colors"
              >
                <button className="text-stone-400 shrink-0">
                  {subtask.is_done ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : (
                    <Circle size={18} />
                  )}
                </button>
                <span
                  className={`text-xs font-semibold ${
                    subtask.is_done
                      ? 'line-through text-stone-400 dark:text-stone-500'
                      : 'text-stone-800 dark:text-stone-200'
                  }`}
                >
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>

          {/* Add Subtask Input */}
          <form onSubmit={handleAddSubtask} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add new subtask..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className="flex-1 text-xs font-medium h-10 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
            />
            <button type="submit" className="lisso-btn-black text-xs px-4">
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>

      {/* Edit Dialog */}
      <TaskFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialTask={displayTask}
      />
    </div>
  )
}
