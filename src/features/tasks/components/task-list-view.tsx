import { useMemo } from 'react'
import type { Task } from '@/types/database'
import { TaskCard } from '@/features/tasks/components/task-card'
import { groupTasksByDeadline } from '@/features/tasks/utils/task-groups'

interface TaskListViewProps {
  tasks: Task[]
  onEditTask?: (task: Task) => void
}

export function TaskListView({ tasks, onEditTask }: TaskListViewProps) {
  const groups = useMemo(() => groupTasksByDeadline(tasks), [tasks])

  const renderSection = (title: string, list: Task[], countColor = 'text-stone-400') => {
    if (list.length === 0) return null

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {title}
          </h3>
          <span className={`text-xs font-bold ${countColor}`}>({list.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {list.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="lisso-card p-12 text-center space-y-2">
        <p className="text-base font-bold text-stone-900 dark:text-stone-100">
          No matching tasks found
        </p>
        <p className="text-xs text-stone-400">
          Create a new task to start organizing your day.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {renderSection('Today & Overdue', groups.todayAndOverdue, 'text-rose-600 dark:text-rose-400')}
      {renderSection('Tomorrow', groups.tomorrow, 'text-amber-600 dark:text-amber-400')}
      {renderSection('This Week', groups.thisWeek)}
      {renderSection('Later', groups.later)}
      {renderSection('No Deadline', groups.noDeadline)}
      {renderSection('Completed Tasks', groups.completed, 'text-emerald-600 dark:text-emerald-400')}
    </div>
  )
}
