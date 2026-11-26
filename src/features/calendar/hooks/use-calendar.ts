import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEvents, createEvent, deleteEvent } from '@/features/calendar/api/events'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { useBills } from '@/features/finance/hooks/use-bills'
import type { Event } from '@/types/database'
import { format } from 'date-fns'

export interface UnifiedCalendarItem {
  id: string
  type: 'task' | 'bill' | 'event'
  title: string
  date: string // YYYY-MM-DD
  time?: string // HH:mm
  color: string
  isDone?: boolean
  amount?: number
  rawItem: any
}

export function useCalendar() {
  const qc = useQueryClient()
  const { data: events = [] } = useQuery({ queryKey: ['events'], queryFn: getEvents })
  const { data: tasks = [] } = useTasks()
  const { data: bills = [] } = useBills()

  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })

  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })

  const unifiedItems = useMemo<UnifiedCalendarItem[]>(() => {
    const list: UnifiedCalendarItem[] = []

    // 1. Task deadlines
    for (const task of tasks) {
      if (!task.due_at) continue
      const d = new Date(task.due_at)
      list.push({
        id: `task-${task.id}`,
        type: 'task',
        title: task.title,
        date: format(d, 'yyyy-MM-dd'),
        time: task.all_day ? undefined : format(d, 'HH:mm'),
        color: task.category?.color ?? '#3b82f6',
        isDone: task.status === 'done',
        rawItem: task,
      })
    }

    // 2. Bills due dates (this month)
    const currentYearMonth = format(new Date(), 'yyyy-MM')
    for (const bill of bills) {
      if (!bill.is_active || !bill.due_day) continue
      const dayStr = String(bill.due_day).padStart(2, '0')
      list.push({
        id: `bill-${bill.id}`,
        type: 'bill',
        title: `Bill: ${bill.name}`,
        date: `${currentYearMonth}-${dayStr}`,
        color: '#f59e0b',
        amount: bill.amount,
        rawItem: bill,
      })
    }

    // 3. Manual events
    for (const ev of events) {
      const d = new Date(ev.starts_at)
      list.push({
        id: `event-${ev.id}`,
        type: 'event',
        title: ev.title,
        date: format(d, 'yyyy-MM-dd'),
        time: ev.all_day ? undefined : format(d, 'HH:mm'),
        color: '#8b5cf6',
        rawItem: ev,
      })
    }

    return list.sort((a, b) => a.date.localeCompare(b.date))
  }, [tasks, bills, events])

  return {
    items: unifiedItems,
    createEvent: createEventMutation,
    deleteEvent: deleteEventMutation,
  }
}
