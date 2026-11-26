import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns'
import { useCalendar, type UnifiedCalendarItem } from '@/features/calendar/hooks/use-calendar'
import { EventFormModal } from '@/features/calendar/components/event-form-modal'
import { formatRupiah } from '@/lib/format'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  X,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react'

export function CalendarPage() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month')
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<UnifiedCalendarItem | null>(null)
  const [dayDetailModalOpen, setDayDetailModalOpen] = useState(false)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [eventDate, setEventDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))

  const { items, deleteEvent } = useCalendar()

  // Month grid calculation
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [calendarStart, calendarEnd])

  const nextMonth = () => setCurrentDate((d) => addMonths(d, 1))
  const prevMonth = () => setCurrentDate((d) => subMonths(d, 1))
  const goToToday = () => {
    const now = new Date()
    setCurrentDate(now)
    setSelectedDay(now)
  }

  // Filter items for selected day
  const selectedDayItems = useMemo(() => {
    const selectedDateStr = format(selectedDay, 'yyyy-MM-dd')
    return items.filter((item) => item.date === selectedDateStr)
  }, [items, selectedDay])

  // Handler for double click on any day (prefill date & open create modal)
  const handleDayDoubleClick = (day: Date) => {
    setEventDate(format(day, 'yyyy-MM-dd'))
    setEventModalOpen(true)
  }

  // Handler for single click on day
  const handleDayClick = (day: Date, dayItems: UnifiedCalendarItem[]) => {
    setSelectedDay(day)
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && dayItems.length > 0) {
      setDayDetailModalOpen(true)
    }
  }

  const handleDeleteItem = async (it: UnifiedCalendarItem) => {
    if (it.type === 'event' && it.rawItem?.id) {
      await deleteEvent.mutateAsync(it.rawItem.id)
      setSelectedItemForDetail(null)
    }
  }

  return (
    <div className="space-y-5 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            Calendar &amp; agenda
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Select a date to view its schedule, or double-click a date to create an event.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start flex-wrap">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-full bg-stone-200/70 dark:bg-[#141414] border border-transparent dark:border-white/[0.08]">
            <button
              onClick={() => setViewMode('month')}
              className={`p-1.5 rounded-full text-xs font-bold transition-all ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-[#202020] text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
              title="Month view"
            >
              <Grid3X3 size={15} />
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`p-1.5 rounded-full text-xs font-bold transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white dark:bg-[#202020] text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400'
              }`}
              title="Agenda view"
            >
              <List size={15} />
            </button>
          </div>

          <button
            onClick={() => {
              setEventDate(format(selectedDay, 'yyyy-MM-dd'))
              setEventModalOpen(true)
            }}
            className="lisso-btn-black text-xs gap-1.5"
          >
            <Plus size={15} />
            <span>New event</span>
          </button>
        </div>
      </div>

      {/* Month Navigator Controls */}
      <div className="flex items-center justify-between lisso-card p-3.5 sm:p-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 capitalize">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-[#181818] dark:hover:bg-[#202020] text-[11px] font-bold text-stone-700 dark:text-stone-300 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-[#181818] flex items-center justify-center text-stone-600 dark:text-stone-400 transition-colors"
            title="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextMonth}
            className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-[#181818] flex items-center justify-center text-stone-600 dark:text-stone-400 transition-colors"
            title="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* View Mode Switch */}
      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Calendar Grid (8 cols) */}
          <div className="lg:col-span-8 lisso-card p-4 sm:p-5 space-y-3">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center text-xs font-extrabold text-stone-400 uppercase tracking-wider pb-2 border-b border-stone-100 dark:border-white/[0.08]">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isCurrentDay = isToday(day)
                const isSelected = isSameDay(day, selectedDay)
                const dayItems = items.filter((it) => it.date === dateStr)

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleDayClick(day, dayItems)}
                    onDoubleClick={() => handleDayDoubleClick(day)}
                    title={
                      dayItems.length > 0
                        ? `${dayItems.length} agenda items (Click to view • Double-click to add)`
                        : 'No events (Double-click to add new event)'
                    }
                    className={`group relative min-h-[78px] sm:min-h-[92px] p-2 rounded-2xl border-0 transition-colors cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#ECE5D8] dark:bg-[#222222] shadow-xs'
                        : isCurrentDay
                        ? 'bg-amber-500/15 dark:bg-amber-500/20'
                        : 'bg-white/60 dark:bg-[#141414] hover:bg-[#F6F1EA] dark:hover:bg-[#1c1c1c]'
                    } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                          isCurrentDay
                            ? 'bg-amber-500 text-white font-extrabold shadow-xs'
                            : isSelected
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-extrabold'
                            : 'text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayItems.length > 0 ? (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-stone-100 dark:bg-[#181818] text-stone-600 dark:text-stone-300">
                          {dayItems.length}
                        </span>
                      ) : <span />}
                    </div>

                    {/* Chips Agenda */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayItems.slice(0, 2).map((it) => {
                        const isTask = it.type === 'task'
                        const isBill = it.type === 'bill'
                        return (
                          <button
                            key={it.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedItemForDetail(it)
                            }}
                            className={`w-full text-left truncate text-[10px] px-1.5 py-0.5 rounded-md font-semibold transition-colors flex items-center gap-1 border-0 ${
                              isTask
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900'
                                : isBill
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                            }`}
                            title={`${it.title} (Click to view details)`}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: it.color }}
                            />
                            <span className="truncate">{it.title}</span>
                          </button>
                        )
                      })}
                      {dayItems.length > 2 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDay(day)
                            setDayDetailModalOpen(true)
                          }}
                          className="text-[9px] font-bold text-stone-500 dark:text-stone-400 block px-1 hover:underline text-left"
                        >
                          +{dayItems.length - 2} more...
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Day Detail Sidebar (4 cols) */}
          <div className="lg:col-span-4 lisso-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Date details
                </span>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                  {format(selectedDay, 'EEEE, dd MMMM yyyy')}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-[#181818] text-xs font-bold text-stone-700 dark:text-stone-300">
                {selectedDayItems.length} {selectedDayItems.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {selectedDayItems.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-stone-400">
                  No agenda or bills on this date.
                </p>
                <button
                  onClick={() => handleDayDoubleClick(selectedDay)}
                  className="lisso-btn-secondary text-xs inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Add event on this date</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1 no-scrollbar">
                {selectedDayItems.map((it) => (
                  <div
                    key={it.id}
                    onClick={() => setSelectedItemForDetail(it)}
                    className="p-3.5 rounded-2xl bg-stone-50 hover:bg-[#F6F1EA] dark:bg-[#181818] dark:hover:bg-[#202020] border-0 shadow-xs space-y-1.5 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: it.color }}
                      >
                        {it.type === 'task' ? 'TASK' : it.type === 'bill' ? 'BILL' : 'EVENT'}
                      </span>
                      {it.time && (
                        <span className="text-[11px] font-semibold text-stone-400">
                          {it.time}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-950 dark:group-hover:text-white">
                      {it.title}
                    </p>
                    {it.amount && (
                      <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                        {formatRupiah(it.amount)}
                      </p>
                    )}
                    <div className="pt-1 flex items-center justify-between text-[11px] text-stone-400 font-medium">
                      <span>Click to view</span>
                      <ArrowUpRight size={13} className="text-stone-400" />
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => handleDayDoubleClick(selectedDay)}
                  className="w-full mt-2 py-2.5 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 text-xs font-bold text-stone-600 dark:text-stone-400 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add another event</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Agenda Stream View */
        <div className="lisso-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/[0.08] pb-3">
            <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
              Upcoming Agenda Stream
            </h3>
            <span className="text-xs text-stone-400 font-semibold">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          <div className="space-y-3">
            {items.map((it) => (
              <div
                key={it.id}
                onClick={() => setSelectedItemForDetail(it)}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-[#181818] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-stone-300 dark:hover:border-stone-700 border border-transparent transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
                    style={{ backgroundColor: it.color }}
                  >
                    {it.type === 'task' ? 'T' : it.type === 'bill' ? 'B' : 'E'}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100">
                      {it.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Date: {it.date} {it.time ? `• Time: ${it.time}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {it.amount && (
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                      {formatRupiah(it.amount)}
                    </span>
                  )}
                  <span className="text-xs font-bold text-stone-500 hover:underline">
                    View Details &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DETAIL AGENDA TERTENTU (Dibuka saat di-klik)     */}
      {/* ======================================================== */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="lisso-card w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/[0.08] pb-3">
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-extrabold text-white"
                style={{ backgroundColor: selectedItemForDetail.color }}
              >
                {selectedItemForDetail.type === 'task'
                  ? 'TASK'
                  : selectedItemForDetail.type === 'bill'
                  ? 'BILL'
                  : 'EVENT'}
              </span>
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-[#181818] flex items-center justify-center text-stone-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
                {selectedItemForDetail.title}
              </h3>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#181818] space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                  <span>Date:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {selectedItemForDetail.date}
                  </span>
                </div>
                {selectedItemForDetail.time && (
                  <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                    <span>Time:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {selectedItemForDetail.time}
                    </span>
                  </div>
                )}
                {selectedItemForDetail.amount && (
                  <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                    <span>Amount:</span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">
                      {formatRupiah(selectedItemForDetail.amount)}
                    </span>
                  </div>
                )}
              </div>

              {selectedItemForDetail.type === 'event' && selectedItemForDetail.rawItem?.description && (
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {selectedItemForDetail.rawItem.description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-white/[0.08] flex items-center justify-between gap-2">
              {selectedItemForDetail.type === 'task' ? (
                <button
                  onClick={() => {
                    setSelectedItemForDetail(null)
                    navigate('/tasks')
                  }}
                  className="lisso-btn-black text-xs w-full justify-center"
                >
                  Open in Tasks
                </button>
              ) : selectedItemForDetail.type === 'bill' ? (
                <button
                  onClick={() => {
                    setSelectedItemForDetail(null)
                    navigate('/finance/bills')
                  }}
                  className="lisso-btn-black text-xs w-full justify-center"
                >
                  Manage Bills in Finance
                </button>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => handleDeleteItem(selectedItemForDetail)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Delete Event</span>
                  </button>
                  <button
                    onClick={() => setSelectedItemForDetail(null)}
                    className="lisso-btn-secondary text-xs"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: MOBILE DAY DETAIL                                 */}
      {/* ======================================================== */}
      {dayDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="lisso-card w-full max-w-md p-6 rounded-b-none sm:rounded-3xl flex flex-col gap-4 shadow-2xl relative max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Date Agenda
                </span>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
                  {format(selectedDay, 'dd MMMM yyyy')}
                </h3>
              </div>
              <button
                onClick={() => setDayDetailModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-[#181818] flex items-center justify-center text-stone-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[50vh]">
              {selectedDayItems.map((it) => (
                <div
                  key={it.id}
                  onClick={() => {
                    setDayDetailModalOpen(false)
                    setSelectedItemForDetail(it)
                  }}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#181818] border border-stone-200/60 dark:border-white/[0.06] space-y-1 cursor-pointer hover:bg-[#F6F1EA] dark:hover:bg-[#202020] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: it.color }}
                    >
                      {it.type.toUpperCase()}
                    </span>
                    {it.time && (
                      <span className="text-[11px] font-semibold text-stone-400">{it.time}</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{it.title}</p>
                  {it.amount && (
                    <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                      {formatRupiah(it.amount)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setDayDetailModalOpen(false)
                  handleDayDoubleClick(selectedDay)
                }}
                className="lisso-btn-black text-xs w-full justify-center"
              >
                + Create Event on this Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BUAT AGENDA BARU */}
      <EventFormModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        initialDate={eventDate}
      />
    </div>
  )
}
