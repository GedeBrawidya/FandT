import { supabase } from '@/lib/supabase'
import type { Task, Subtask, Category } from '@/types/database'
import { deleteMockSubtask, getMockTasks, saveMockSubtask, saveMockTask, setMockSubtaskDone, deleteMockTask } from '@/lib/mock-storage'

export interface TaskFilter {
  categoryId?: string
  priority?: 'low' | 'med' | 'high'
  status?: 'todo' | 'doing' | 'done'
  search?: string
  month?: string // YYYY-MM
}

export async function getTasks(filter?: TaskFilter): Promise<Task[]> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        let query = supabase
          .from('tasks')
          .select('*, category:categories(*), subtasks(*)')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .order('due_at', { ascending: true, nullsFirst: false })

        if (filter?.categoryId) {
          query = query.eq('category_id', filter.categoryId)
        }
        if (filter?.priority) {
          query = query.eq('priority', filter.priority)
        }
        if (filter?.status) {
          query = query.eq('status', filter.status)
        }
        if (filter?.search) {
          query = query.ilike('title', `%${filter.search}%`)
        }

        const { data, error } = await query
        if (!error && data && data.length > 0) return data as Task[]
      }
    } catch {
      // fallback
    }
  }

  // Mock Storage fallback
  let list = getMockTasks()
  if (filter?.categoryId) {
    list = list.filter((t) => t.category_id === filter.categoryId)
  }
  if (filter?.priority) {
    list = list.filter((t) => t.priority === filter.priority)
  }
  if (filter?.status) {
    list = list.filter((t) => t.status === filter.status)
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase()
    list = list.filter((t) => t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q))
  }
  if (filter?.month) {
    list = list.filter((t) => {
      if (!t.due_at) return false
      return t.due_at.startsWith(filter.month!)
    })
  }
  return list
}

export async function getTaskById(id: string): Promise<Task | null> {
  const all = await getTasks()
  return all.find((t) => t.id === id) ?? null
}

export async function createTask(
  taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'category' | 'subtasks'> & {
    subtaskTitles?: string[]
  }
): Promise<Task> {
  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { subtaskTitles, ...insertData } = taskData
        const { data: created, error } = await supabase
          .from('tasks')
          .insert({ ...insertData, user_id: user.id })
          .select()
          .single()
        if (!error && created) {
          if (subtaskTitles && subtaskTitles.length > 0) {
            const subtaskPayloads = subtaskTitles
              .filter((t) => t.trim().length > 0)
              .map((title, idx) => ({
                task_id: created.id,
                title: title.trim(),
                is_done: false,
                sort_order: idx,
              }))
            await supabase.from('subtasks').insert(subtaskPayloads)
          }
          return created as Task
        }
      }
    } catch {
      // fallback
    }
  }

  // Mock save
  const subtasks = (taskData.subtaskTitles ?? []).map((t, idx) => ({
    id: `st-${Date.now()}-${idx}`,
    task_id: '',
    title: t,
    is_done: false,
    sort_order: idx,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
  return saveMockTask({ ...taskData, subtasks })
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  if (supabase) {
    try {
      const { data: updated, error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (!error && updated) return updated as Task
    } catch {
      // fallback
    }
  }
  return saveMockTask({ id, ...data } as any)
}

export async function deleteTask(id: string): Promise<void> {
  deleteMockTask(id)
  if (supabase) {
    try {
      await supabase.from('tasks').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    } catch {
      // ignore
    }
  }
}

export async function createSubtask(taskId: string, title: string): Promise<Subtask> {
  if (!supabase) return saveMockSubtask(taskId, title)
  const { data, error } = await supabase
    .from('subtasks')
    .insert({ task_id: taskId, title, is_done: false })
    .select()
    .single()

  if (error) throw error
  return data as Subtask
}

export async function toggleSubtask(id: string, isDone: boolean): Promise<Subtask> {
  if (!supabase) return setMockSubtaskDone(id, isDone)
  const { data, error } = await supabase
    .from('subtasks')
    .update({ is_done: isDone })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Subtask
}

export async function deleteSubtask(id: string): Promise<void> {
  if (!supabase) {
    deleteMockSubtask(id)
    return
  }
  const { error } = await supabase.from('subtasks').delete().eq('id', id)
  if (error) throw error
}
