import { useState } from 'react'
import { format } from 'date-fns'
import { useCalendar } from '@/features/calendar/hooks/use-calendar'
import { X } from 'lucide-react'

interface EventFormModalProps {
  open: boolean
  onClose: () => void
  initialDate?: string
}

export function EventFormModal({ open, onClose, initialDate }: EventFormModalProps) {
  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState(() => initialDate ?? format(new Date(), 'yyyy-MM-dd'))
  const [eventTime, setEventTime] = useState('10:00')
  const { createEvent } = useCalendar()

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle.trim()) return

    const starts_at = new Date(`${eventDate}T${eventTime}:00`).toISOString()
    const ends_at = new Date(new Date(starts_at).getTime() + 3600000).toISOString()

    await createEvent.mutateAsync({
      title: eventTitle.trim(),
      description: null,
      starts_at,
      ends_at,
      all_day: false,
      google_event_id: null,
    })

    setEventTitle('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="lisso-card w-full max-w-md p-6 flex flex-col gap-5 shadow-2xl relative border-0">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/[0.08] pb-3">
          <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100">
            Create New Event
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-[#181818] flex items-center justify-center text-stone-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
              Event Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Project meeting, Consultation, Exam..."
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full text-xs font-semibold h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full text-xs font-medium h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-600 dark:text-stone-400 mb-1 block">
                Time
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full text-xs font-medium h-11 px-3.5 rounded-2xl bg-stone-100 dark:bg-[#141414] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-white/[0.08] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="lisso-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createEvent.isPending}
              className="lisso-btn-black text-xs"
            >
              {createEvent.isPending ? 'Saving...' : 'Save event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
