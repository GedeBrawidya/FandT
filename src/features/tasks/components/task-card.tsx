import { useNavigate } from 'react-router-dom'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import type { Task } from '@/types/database'
import { useToggleTaskStatus, useDeleteTask } from '@/features/tasks/hooks/use-tasks'
import { confirmDialog } from '@/components/ui/confirm-dialog'
import { CheckCircle2, Circle, Clock, CheckSquare, Trash2, Calendar } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const navigate = useNavigate()
  const toggleStatus = useToggleTaskStatus()
  const deleteTask = useDeleteTask()

  const isDone = task.status === 'done'
  const subtasks = task.subtasks ?? []
  const completedSubtasks = subtasks.filter((s) => s.is_done).length

  // Deadline formatting
  let dueText = ''
  let isOverdue = false
  if (task.due_at) {
    const dueDate = new Date(task.due_at)
    if (isToday(dueDate)) {
      dueText = `Today${task.all_day ? '' : `, ${format(dueDate, 'HH:mm')}`}`
    } else if (isTomorrow(dueDate)) {
      dueText = `Tomorrow${task.all_day ? '' : `, ${format(dueDate, 'HH:mm')}`}`
    } else {
      dueText = format(dueDate, 'dd MMM yyyy')
    }
    isOverdue = !isDone && isPast(dueDate) && !isToday(dueDate)
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextStatus = isDone ? 'todo' : 'done'
    toggleStatus.mutate({ id: task.id, status: nextStatus })
  }

  const getPriorityPill = () => {
    switch (task.priority) {
      case 'high':
        return <span className="lisso-pill-red">High</span>
      case 'med':
        return <span className="lisso-pill-amber">Medium</span>
      case 'low':
        return <span className="lisso-pill-neutral">Low</span>
    }
  }

  return (
    <div
      onClick={() => navigate(`/tasks/${task.id}`)}
      className="lisso-card border-0 p-4.5 sm:p-5 flex flex-col justify-between gap-3 cursor-pointer hover:bg-[#F3EEE6] dark:hover:bg-[#1c1c1c] transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox & Title */}
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={handleToggle}
            className="mt-0.5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors shrink-0"
            title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
          >
            {isDone ? (
              <CheckCircle2 size={20} className="text-emerald-500" />
            ) : (
              <Circle size={20} />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <h4
              className={`text-sm font-extrabold leading-snug truncate transition-all ${
                isDone
                  ? 'line-through text-stone-400 dark:text-stone-500'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {task.title}
            </h4>

            {task.notes && (
              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                {task.notes}
              </p>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        <div className="shrink-0">{getPriorityPill()}</div>
      </div>

      {/* Meta Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-white/[0.06] text-xs text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-3">
          {/* Category */}
          {task.category && (
            <div className="flex items-center gap-1.5 font-semibold text-stone-700 dark:text-stone-300">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: task.category.color }}
              />
              <span className="truncate max-w-[100px]">{task.category.name}</span>
            </div>
          )}

          {/* Subtasks Count */}
          {subtasks.length > 0 && (
            <div className="flex items-center gap-1 font-medium">
              <CheckSquare size={13} />
              <span>
                {completedSubtasks}/{subtasks.length}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Deadline */}
          {dueText && (
            <span
              className={`flex items-center gap-1 font-semibold ${
                isOverdue
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              <Clock size={12} />
              <span>{dueText}</span>
            </span>
          )}

          {/* Delete Action (on hover) */}
          <button
            onClick={async (e) => {
              e.stopPropagation()
              const ok = await confirmDialog({
                title: 'Delete Task',
                description: `Are you sure you want to delete "${task.title}"?`,
                confirmText: 'Delete',
                cancelText: 'Cancel',
                variant: 'destructive',
              })
              if (ok) {
                deleteTask.mutate(task.id)
              }
            }}
            className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 transition-opacity p-1"
            title="Delete Task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
