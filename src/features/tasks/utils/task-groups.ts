import { isToday, isTomorrow, isThisWeek, isPast } from 'date-fns'
import type { Task } from '@/types/database'

export interface TaskDeadlineGroups {
  todayAndOverdue: Task[]
  tomorrow: Task[]
  thisWeek: Task[]
  later: Task[]
  noDeadline: Task[]
  completed: Task[]
}

/**
 * Urutkan tugas berdasarkan deadline terdekat di paling atas.
 * 1. Tugas dengan deadline terdekat (hari ini/overdue) di paling atas.
 * 2. Tugas yang memiliki deadline di atas tugas tanpa deadline.
 * 3. Jika deadline sama / tanpa deadline, urutkan berdasarkan prioritas (tinggi > sedang > rendah).
 */
export function sortByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // 1. Keduanya punya deadline: deadline lebih awal (terdekat) di atas
    if (a.due_at && b.due_at) {
      const diff = new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
      if (diff !== 0) return diff
    }
    // 2. Tugas dengan deadline mendahului tugas tanpa deadline
    if (a.due_at && !b.due_at) return -1
    if (!a.due_at && b.due_at) return 1

    // 3. Jika deadline sama / tidak ada deadline: prioritaskan prioritas (high > med > low)
    const priorityWeight: Record<string, number> = { high: 3, med: 2, low: 1 }
    const pA = priorityWeight[a.priority ?? 'med'] ?? 2
    const pB = priorityWeight[b.priority ?? 'med'] ?? 2
    if (pA !== pB) return pB - pA

    // 4. Fallback tanggal pembuatan
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function groupTasksByDeadline(tasks: Task[]): TaskDeadlineGroups {
  const todayAndOverdue: Task[] = []
  const tomorrow: Task[] = []
  const thisWeek: Task[] = []
  const later: Task[] = []
  const noDeadline: Task[] = []
  const completed: Task[] = []

  for (const t of tasks) {
    if (t.status === 'done') {
      completed.push(t)
      continue
    }

    if (!t.due_at) {
      noDeadline.push(t)
      continue
    }

    const d = new Date(t.due_at)
    if (isToday(d) || (isPast(d) && !isToday(d))) {
      todayAndOverdue.push(t)
    } else if (isTomorrow(d)) {
      tomorrow.push(t)
    } else if (isThisWeek(d, { weekStartsOn: 1 })) {
      thisWeek.push(t)
    } else {
      later.push(t)
    }
  }

  return {
    todayAndOverdue: sortByDeadline(todayAndOverdue),
    tomorrow: sortByDeadline(tomorrow),
    thisWeek: sortByDeadline(thisWeek),
    later: sortByDeadline(later),
    noDeadline: sortByDeadline(noDeadline),
    completed: sortByDeadline(completed),
  }
}
