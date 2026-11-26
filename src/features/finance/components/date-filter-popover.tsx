import { useState, useRef, useEffect } from 'react'
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addMonths,
  subMonths,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react'

export type FilterScope = 'day' | 'month' | 'year' | 'all'

export interface DateFilterValue {
  scope: FilterScope
  date: Date
  start?: Date
  end?: Date
}

interface DateFilterPopoverProps {
  value: DateFilterValue
  onChange: (val: DateFilterValue) => void
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export function DateFilterPopover({ value, onChange }: DateFilterPopoverProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState<Date>(value.date || new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Compute label for the trigger button
  const getLabel = () => {
    if (value.scope === 'all') return 'All Time'
    if (value.scope === 'year') return format(value.date, 'yyyy')
    if (value.scope === 'month') return format(value.date, 'MMM yyyy')
    return format(value.date, 'd MMM yyyy')
  }

  const handleScopeChange = (newScope: FilterScope) => {
    if (newScope === 'all') {
      onChange({ scope: 'all', date: value.date })
      setOpen(false)
      return
    }

    if (newScope === 'year') {
      onChange({
        scope: 'year',
        date: viewDate,
        start: startOfYear(viewDate),
        end: endOfYear(viewDate),
      })
    } else if (newScope === 'month') {
      onChange({
        scope: 'month',
        date: viewDate,
        start: startOfMonth(viewDate),
        end: endOfMonth(viewDate),
      })
    } else {
      onChange({
        scope: 'day',
        date: viewDate,
        start: startOfDay(viewDate),
        end: endOfDay(viewDate),
      })
    }
  }

  const handleSelectDay = (day: Date) => {
    setViewDate(day)
    onChange({
      scope: 'day',
      date: day,
      start: startOfDay(day),
      end: endOfDay(day),
    })
    setOpen(false)
  }

  const handleSelectMonth = (monthIndex: number) => {
    const newDate = new Date(viewDate.getFullYear(), monthIndex, 1)
    setViewDate(newDate)
    onChange({
      scope: 'month',
      date: newDate,
      start: startOfMonth(newDate),
      end: endOfMonth(newDate),
    })
    setOpen(false)
  }

  const handleSelectYear = (year: number) => {
    const newDate = new Date(year, viewDate.getMonth(), 1)
    setViewDate(newDate)
    onChange({
      scope: 'year',
      date: newDate,
      start: startOfYear(newDate),
      end: endOfYear(newDate),
    })
    setOpen(false)
  }

  // Days for the Day calendar view
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const daysInView = eachDayOfInterval({ start: startDate, end: endDate })

  const currentYear = viewDate.getFullYear()
  const yearRange = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i)

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="lisso-btn-secondary text-xs gap-1.5 px-3 py-2 border border-stone-200/90 dark:border-white/[0.12] bg-white dark:bg-[#141414] shadow-xs hover:border-stone-400 dark:hover:border-stone-600 transition-all font-semibold"
        title="Filter transactions by date"
      >
        <CalendarIcon size={14} className="text-stone-500 dark:text-stone-400" />
        <span className="text-stone-900 dark:text-stone-100 font-bold">{getLabel()}</span>
        <ChevronDown size={13} className={`text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Content */}
      {open && (
        <div className="absolute left-0 sm:right-0 sm:left-auto top-11 z-50 w-72 sm:w-80 p-3.5 rounded-2xl bg-white dark:bg-[#141414] border border-stone-200/90 dark:border-white/[0.12] shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-3">
          {/* Scope Selector Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl text-center">
            {(['day', 'month', 'year', 'all'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleScopeChange(s)}
                className={`py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  value.scope === s
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          {/* DAY View */}
          {value.scope === 'day' && (
            <div className="space-y-2">
              {/* Month Navigation */}
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setViewDate(subMonths(viewDate, 1))}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  title="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                  {format(viewDate, 'MMMM yyyy')}
                </span>
                <button
                  type="button"
                  onClick={() => setViewDate(addMonths(viewDate, 1))}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                  title="Next month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-stone-400 py-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {daysInView.map((day) => {
                  const isCurrentMonth = isSameMonth(day, viewDate)
                  const isSelected = isSameDay(day, value.date)
                  const isTodayDate = isToday(day)

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`h-7 w-7 mx-auto rounded-lg text-xs flex items-center justify-center font-semibold transition-all ${
                        isSelected
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold shadow-xs'
                          : isTodayDate
                          ? 'border border-amber-500 text-amber-600 dark:text-amber-400'
                          : isCurrentMonth
                          ? 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                          : 'text-stone-300 dark:text-stone-600'
                      }`}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>

              {/* Quick Select Today */}
              <div className="pt-1 border-t border-stone-100 dark:border-white/[0.08] flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleSelectDay(new Date())}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Jump to Today
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[11px] font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* MONTH View */}
          {value.scope === 'month' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1))}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
                  {viewDate.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1))}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {MONTHS.map((m, idx) => {
                  const isSelected = value.date.getMonth() === idx && value.date.getFullYear() === viewDate.getFullYear()
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectMonth(idx)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* YEAR View */}
          {value.scope === 'year' && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400 px-1">Select Year</p>
              <div className="grid grid-cols-3 gap-1.5">
                {yearRange.map((yr) => {
                  const isSelected = value.date.getFullYear() === yr
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => handleSelectYear(yr)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      {yr}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ALL View */}
          {value.scope === 'all' && (
            <div className="p-3 text-center space-y-2">
              <div className="h-8 w-8 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Check size={16} />
              </div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Showing All Transactions</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                All records across all dates are currently shown.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
