import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import type { Task } from '@/types/database'
import { useToggleTaskStatus, useDeleteTask } from '@/features/tasks/hooks/use-tasks'
import { sortByDeadline } from '@/features/tasks/utils/task-groups'
import {
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Clock,
  Bell,
  AlignLeft,
  ArrowRight,
  ArrowLeft,
  Trash2,
} from 'lucide-react'

interface TaskBoardViewProps {
  tasks: Task[]
  onEditTask?: (task: Task) => void
  onAddTask?: (status: 'todo' | 'doing' | 'done') => void
}

export function TaskBoardView({ tasks, onEditTask, onAddTask }: TaskBoardViewProps) {
  const navigate = useNavigate()
  const toggleStatus = useToggleTaskStatus()
  const deleteTask = useDeleteTask()

  const columns = useMemo(() => {
    return {
      todo: sortByDeadline(tasks.filter((t) => t.status === 'todo')),
      doing: sortByDeadline(tasks.filter((t) => t.status === 'doing')),
      done: sortByDeadline(tasks.filter((t) => t.status === 'done')),
    }
  }, [tasks])

  const renderCard = (task: Task, currentStatus: 'todo' | 'doing' | 'done') => {
    const isDone = currentStatus === 'done'
    const subtasks = task.subtasks ?? []
    const completedSubtasks = subtasks.filter((s) => s.is_done).length

    // Due date formatting
    let dueText = ''
    let isOverdue = false
    if (task.due_at) {
      const dueDate = new Date(task.due_at)
      if (isToday(dueDate)) {
        dueText = `Today${task.all_day ? '' : `, ${format(dueDate, 'HH:mm')}`}`
      } else if (isTomorrow(dueDate)) {
        dueText = `Tomorrow${task.all_day ? '' : `, ${format(dueDate, 'HH:mm')}`}`
      } else {
        dueText = format(dueDate, 'dd MMM')
      }
      isOverdue = !isDone && isPast(dueDate) && !isToday(dueDate)
    }

    return (
      <div
        key={task.id}
        onClick={() => navigate(`/tasks/${task.id}`)}
        className="group relative bg-white dark:bg-[#181818] hover:bg-[#F6F1EA] dark:hover:bg-[#202020] rounded-2xl p-4 border-0 shadow-xs transition-colors cursor-pointer flex flex-col gap-3"
      >
        {/* Top: Checkbox & Title */}
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              const nextStatus = isDone ? 'todo' : 'done'
              toggleStatus.mutate({ id: task.id, status: nextStatus })
            }}
            className="mt-0.5 shrink-0 transition-colors text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
          >
            {isDone ? (
              <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-500/10" />
            ) : (
              <Circle size={18} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <h4
              className={`text-xs sm:text-sm font-bold leading-snug transition-all ${
                isDone
                  ? 'line-through text-stone-400 dark:text-stone-500'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {task.title}
            </h4>

            {task.notes && (
              <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-1 font-medium">
                {task.notes}
              </p>
            )}
          </div>
        </div>

        {/* Clean Typography Badges (Minimalist, no icon clutter) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {/* Priority */}
          {task.priority === 'high' && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              High
            </span>
          )}
          {task.priority === 'med' && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              Medium
            </span>
          )}

          {/* Subtasks Count */}
          {subtasks.length > 0 && (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              {completedSubtasks}/{subtasks.length} Subtasks
            </span>
          )}

          {/* Due Date */}
          {dueText && (
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                isOverdue
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : isDone
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {dueText}
            </span>
          )}

          {/* Category */}
          {task.category && (
            <span className="ml-auto text-[10px] font-bold text-stone-500 dark:text-stone-400 bg-stone-100/80 dark:bg-stone-800 px-2 py-0.5 rounded-lg truncate max-w-[110px]">
              {task.category.name}
            </span>
          )}
        </div>

        {/* Board Move Pipeline Controls */}
        <div className="pt-2 border-t border-stone-100 dark:border-white/[0.04] flex items-center justify-between text-[11px] font-semibold text-stone-400">
          <div className="flex items-center gap-1">
            {currentStatus !== 'todo' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const prev = currentStatus === 'done' ? 'doing' : 'todo'
                  toggleStatus.mutate({ id: task.id, status: prev })
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                title="Move to previous column"
              >
                <ArrowLeft size={11} />
                <span>{currentStatus === 'done' ? 'Doing' : 'To Do'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {currentStatus !== 'done' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const next = currentStatus === 'todo' ? 'doing' : 'done'
                  toggleStatus.mutate({ id: task.id, status: next })
                }}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-colors ${
                  currentStatus === 'doing'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
                title="Move to next column"
              >
                <span>{currentStatus === 'todo' ? 'Start' : 'Done'}</span>
                <ArrowRight size={11} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderColumn = (
    title: string,
    statusKey: 'todo' | 'doing' | 'done',
    items: Task[],
    headerPill: string
  ) => {
    return (
      <div className="flex-1 min-w-[300px] max-w-[420px] bg-[#EDE7DD]/80 dark:bg-[#141414] rounded-[26px] p-4 flex flex-col gap-3.5 border-0 shadow-xs">
        {/* Column Header: Title, Count, More Options */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              {title}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${headerPill}`}>
              {items.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onAddTask?.(statusKey)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
              title={`Add task to ${title}`}
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              className="p-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
              title="Column options"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Card Stack */}
        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 no-scrollbar flex-1">
          {items.length === 0 ? (
            <div className="py-10 text-center rounded-2xl border border-dashed border-stone-300/70 dark:border-stone-800/80 text-xs font-semibold text-stone-400">
              No tasks in {title}
            </div>
          ) : (
            items.map((task) => renderCard(task, statusKey))
          )}
        </div>

        {/* Column Footer: Add a card */}
        <button
          type="button"
          onClick={() => onAddTask?.(statusKey)}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-2xl text-xs font-bold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 bg-white/40 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.08] border-0 transition-all shadow-2xs"
        >
          <span>Add a card</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar items-start">
      {renderColumn('To Do', 'todo', columns.todo, 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200')}
      {renderColumn('Doing', 'doing', columns.doing, 'bg-amber-500/20 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300')}
      {renderColumn('Done', 'done', columns.done, 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300')}
    </div>
  )
}
