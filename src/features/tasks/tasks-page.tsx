import { useState, useMemo, useRef, useEffect } from 'react'
import { addMonths, format, parse, setMonth, setYear } from 'date-fns'
import { useSearchParams } from 'react-router-dom'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { useCategories } from '@/features/finance/hooks/use-categories'
import { TaskListView } from '@/features/tasks/components/task-list-view'
import { TaskBoardView } from '@/features/tasks/components/task-board-view'
import { TaskFormDialog } from '@/features/tasks/components/task-form-dialog'
import { sortByDeadline } from '@/features/tasks/utils/task-groups'
import type { Task } from '@/types/database'
import { Plus, LayoutList, Columns3, Search, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const viewMode = (searchParams.get('view') as 'list' | 'board') || 'board'
  const selectedCategory = searchParams.get('category') || ''
  const [searchQuery, setSearchQuery] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [createStatus, setCreateStatus] = useState<'todo' | 'doing' | 'done'>('todo')
  const [selectedMonth, setSelectedMonth] = useState<string>(() => format(new Date(), 'yyyy-MM'))
  const [monthPickerOpen, setMonthPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const selectedMonthDate = useMemo(() => {
    return selectedMonth ? parse(selectedMonth, 'yyyy-MM', new Date()) : new Date()
  }, [selectedMonth])

  const [pickerYear, setPickerYear] = useState(() => selectedMonthDate.getFullYear())

  // Keep picker year in sync when selectedMonth changes
  useEffect(() => {
    if (selectedMonth) {
      setPickerYear(selectedMonthDate.getFullYear())
    }
  }, [selectedMonth, selectedMonthDate])

  // Close popup on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setMonthPickerOpen(false)
      }
    }
    if (monthPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [monthPickerOpen])

  const handleOpenCreateWithStatus = (status: 'todo' | 'doing' | 'done' = 'todo') => {
    setEditingTask(null)
    setCreateStatus(status)
    setFormOpen(true)
  }

  const { data: realTasks = [] } = useTasks({
    categoryId: selectedCategory || undefined,
    search: searchQuery || undefined,
  })
  const { data: categories = [] } = useCategories('task')

  const displayTasks: Task[] = realTasks

  const filteredTasks = useMemo(() => {
    let list = displayTasks
    if (selectedMonth) {
      list = list.filter((t) => t.due_at && t.due_at.startsWith(selectedMonth))
    }
    return sortByDeadline(list)
  }, [displayTasks, selectedMonth])

  const setView = (view: 'list' | 'board') => {
    searchParams.set('view', view)
    setSearchParams(searchParams)
  }

  const setCategoryFilter = (catId: string) => {
    if (catId) {
      searchParams.set('category', catId)
    } else {
      searchParams.delete('category')
    }
    setSearchParams(searchParams)
  }

  const handleSelectMonthYear = (monthIndex: number) => {
    const updated = setMonth(setYear(new Date(), pickerYear), monthIndex)
    setSelectedMonth(format(updated, 'yyyy-MM'))
    setMonthPickerOpen(false)
  }

  const handlePreviousMonth = () => {
    const base = selectedMonth ? selectedMonthDate : new Date()
    setSelectedMonth(format(addMonths(base, -1), 'yyyy-MM'))
  }

  const handleNextMonth = () => {
    const base = selectedMonth ? selectedMonthDate : new Date()
    setSelectedMonth(format(addMonths(base, 1), 'yyyy-MM'))
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Tasks &amp; Priorities
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Manage daily tasks, deadlines, and track progress in List or Board view.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-full bg-stone-200/70 dark:bg-stone-800">
            <button
              onClick={() => setView('board')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
              title="Board view"
            >
              <Columns3 size={15} />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
              title="List view"
            >
              <LayoutList size={15} />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenCreateWithStatus('todo')}
            className="lisso-btn-black text-xs gap-1.5"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all shrink-0 ${
              !selectedCategory
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                : 'bg-white dark:bg-[#141414] text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-white/[0.08]'
            }`}
          >
            All
          </button>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id
            return (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all shrink-0 ${
                  isSelected
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                    : 'bg-white dark:bg-[#141414] text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-white/[0.08]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: c.color }}
                />
                <span>{c.name}</span>
              </button>
            )
          })}
        </div>

        {/* Month Selector & Search Input */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <div ref={pickerRef} className="relative flex items-center rounded-full border border-stone-200/60 bg-white p-1 dark:border-white/[0.08] dark:bg-[#141414]">
            <button
              onClick={handlePreviousMonth}
              className="grid h-7 w-7 place-items-center rounded-full text-stone-500 transition-colors hover:bg-[#EDE5D9] dark:hover:bg-white/[0.08]"
              aria-label="Previous month"
            >
              <ChevronLeft size={15} />
            </button>

            <button
              onClick={() => setMonthPickerOpen((value) => !value)}
              className="flex items-center gap-1.5 px-2.5 text-xs font-bold text-stone-800 dark:text-stone-100 hover:text-stone-950 dark:hover:text-white"
            >
              <CalendarDays size={14} />
              <span>{selectedMonth ? format(selectedMonthDate, 'MMMM yyyy') : 'All Months'}</span>
            </button>

            <button
              onClick={handleNextMonth}
              className="grid h-7 w-7 place-items-center rounded-full text-stone-500 transition-colors hover:bg-[#EDE5D9] dark:hover:bg-white/[0.08]"
              aria-label="Next month"
            >
              <ChevronRight size={15} />
            </button>

            {/* Custom Mini Month/Year Picker Popover */}
            {monthPickerOpen && (
              <div className="absolute right-0 top-11 z-30 w-64 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xl dark:border-white/[0.1] dark:bg-[#141414] animate-in fade-in slide-in-from-top-1 duration-150">
                {/* Year Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100 dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setPickerYear((y) => y - 1)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                    title="Previous year"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                    {pickerYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPickerYear((y) => y + 1)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                    title="Next year"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* 12 Months Grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTH_NAMES.map((name, idx) => {
                    const monthStr = `${pickerYear}-${String(idx + 1).padStart(2, '0')}`
                    const isSelected = selectedMonth === monthStr
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleSelectMonthYear(idx)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        {name}
                      </button>
                    )
                  })}
                </div>

                {/* Quick Actions Footer */}
                <div className="pt-3 mt-2.5 border-t border-stone-100 dark:border-white/[0.08] flex items-center justify-between gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonth(format(new Date(), 'yyyy-MM'))
                      setMonthPickerOpen(false)
                    }}
                    className="font-bold text-stone-800 dark:text-stone-200 hover:underline"
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonth('')
                      setMonthPickerOpen(false)
                    }}
                    className="font-semibold text-stone-500 hover:underline"
                  >
                    All Months
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3.5 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium h-9 pl-9 pr-3.5 rounded-full bg-white dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/60 dark:border-white/[0.08] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Task View (List or Board) */}
      {viewMode === 'list' ? (
        <TaskListView
          tasks={filteredTasks}
          onEditTask={(t) => {
            setEditingTask(t)
            setFormOpen(true)
          }}
        />
      ) : (
        <TaskBoardView
          tasks={filteredTasks}
          onEditTask={(t) => {
            setEditingTask(t)
            setFormOpen(true)
          }}
          onAddTask={handleOpenCreateWithStatus}
        />
      )}

      {/* Task Form Dialog */}
      <TaskFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialTask={editingTask}
        initialStatus={createStatus}
      />
    </div>
  )
}
