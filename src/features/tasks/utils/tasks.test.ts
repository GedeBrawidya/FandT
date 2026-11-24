import { describe, it, expect } from 'vitest'
import { groupTasksByDeadline, sortByDeadline } from './task-groups'
import type { Task } from '@/types/database'

function createTask(overrides: Partial<Task>): Task {
  return {
    id: 'test-id',
    user_id: 'user-1',
    title: 'Test Task',
    notes: null,
    type: 'task',
    category_id: null,
    priority: 'med',
    status: 'todo',
    due_at: null,
    all_day: false,
    completed_at: null,
    recurrence_rule: null,
    google_event_id: null,
    sort_order: 0,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('groupTasksByDeadline', () => {
  it('groups completed tasks under completed regardless of due date', () => {
    const task = createTask({
      title: 'Done task',
      status: 'done',
      due_at: new Date().toISOString(),
    })
    const groups = groupTasksByDeadline([task])

    expect(groups.completed).toHaveLength(1)
    expect(groups.todayAndOverdue).toHaveLength(0)
  })

  it('groups task without due_at under noDeadline', () => {
    const task = createTask({
      title: 'No deadline task',
      due_at: null,
    })
    const groups = groupTasksByDeadline([task])

    expect(groups.noDeadline).toHaveLength(1)
    expect(groups.noDeadline[0].title).toBe('No deadline task')
  })

  it('groups overdue and today tasks under todayAndOverdue', () => {
    const todayTask = createTask({
      title: 'Today task',
      due_at: new Date().toISOString(),
    })
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    const overdueTask = createTask({
      title: 'Overdue task',
      due_at: yesterday,
    })

    const groups = groupTasksByDeadline([todayTask, overdueTask])

    expect(groups.todayAndOverdue).toHaveLength(2)
  })

  it('groups tomorrow tasks under tomorrow', () => {
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000 + 1000)
    const tomorrowTask = createTask({
      title: 'Tomorrow task',
      due_at: tomorrow.toISOString(),
    })

    const groups = groupTasksByDeadline([tomorrowTask])

    expect(groups.tomorrow).toHaveLength(1)
    expect(groups.tomorrow[0].title).toBe('Tomorrow task')
  })

  it('groups future tasks correctly', () => {
    const farFuture = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    const futureTask = createTask({
      title: 'Next month task',
      due_at: farFuture,
    })

    const groups = groupTasksByDeadline([futureTask])

    expect(groups.later).toHaveLength(1)
  })
})

describe('sortByDeadline', () => {
  it('places earlier deadline before later deadline (closest deadline at the top)', () => {
    const today = new Date().toISOString()
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString()

    const taskTomorrow = createTask({ id: 't-tomorrow', title: 'Besok', due_at: tomorrow })
    const taskToday = createTask({ id: 't-today', title: 'Hari Ini', due_at: today })

    const sorted = sortByDeadline([taskTomorrow, taskToday])
    expect(sorted[0].id).toBe('t-today')
    expect(sorted[1].id).toBe('t-tomorrow')
  })

  it('places tasks with deadlines before tasks with no deadline', () => {
    const today = new Date().toISOString()
    const taskWithDeadline = createTask({ id: 't-has', title: 'With Deadline', due_at: today })
    const taskNoDeadline = createTask({ id: 't-none', title: 'No Deadline', due_at: null })

    const sorted = sortByDeadline([taskNoDeadline, taskWithDeadline])
    expect(sorted[0].id).toBe('t-has')
    expect(sorted[1].id).toBe('t-none')
  })

  it('sorts tasks without deadline by priority (high > med > low)', () => {
    const lowTask = createTask({ id: 't-low', title: 'Rendah', priority: 'low', due_at: null })
    const highTask = createTask({ id: 't-high', title: 'Tinggi', priority: 'high', due_at: null })

    const sorted = sortByDeadline([lowTask, highTask])
    expect(sorted[0].id).toBe('t-high')
    expect(sorted[1].id).toBe('t-low')
  })
})
