import { useState, useEffect } from 'react'
import type { NoteDoc } from '@/lib/mock-storage'
import { X, Trash2, Image, Sparkles } from 'lucide-react'

interface NoteModalProps {
  open: boolean
  onClose: () => void
  note?: NoteDoc | null
  onSave: (data: Partial<NoteDoc> & { title: string; content: string }) => Promise<any>
  onDelete?: (id: string) => Promise<any>
}

const EMOJI_OPTIONS = ['📝', '✈️', '💻', '🎯', '📌', '💡', '📚', '🏖️', '⚡', '☕']

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80', // Coding
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1000&auto=format&fit=crop&q=80', // Bali Beach
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1000&auto=format&fit=crop&q=80', // Minimal Desk
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&auto=format&fit=crop&q=80', // Workspace Coffee
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80', // Mountain Nature
]

const TAG_OPTIONS = ['Notes', 'Study', 'Itinerary', 'Plans', 'Projects', 'Ideas']

export function NoteModal({ open, onClose, note, onSave, onDelete }: NoteModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [icon, setIcon] = useState('📝')
  const [tag, setTag] = useState('Notes')
  const [showCoverPicker, setShowCoverPicker] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setCoverUrl(note.cover_url ?? null)
      setIcon(note.icon || '📝')
      setTag(note.tag || 'Notes')
    } else {
      setTitle('')
      setContent('')
      setCoverUrl(null)
      setIcon('📝')
      setTag('Notes')
    }
    setShowCoverPicker(false)
  }, [note, open])

  if (!open) return null

  const handleSave = async () => {
    if (!title.trim()) return
    if (note && !window.confirm(`Simpan perubahan catatan "${title.trim()}"?`)) return
    setSaving(true)
    try {
      await onSave({
        id: note?.id,
        title: title.trim(),
        content: content.trim(),
        cover_url: coverUrl,
        icon,
        tag,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!note?.id || !onDelete) return
    if (window.confirm(`Hapus catatan "${title || 'ini'}"?`)) {
      await onDelete(note.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="lisso-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative border border-stone-200/80 dark:border-white/[0.08]">
        {/* Cover Banner if set */}
        {coverUrl && (
          <div className="relative h-44 sm:h-52 w-full overflow-hidden shrink-0 group">
            <img src={coverUrl} alt="Cover" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              onClick={() => setShowCoverPicker(!showCoverPicker)}
              className="absolute top-4 right-14 px-3 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors flex items-center gap-1.5"
            >
              <Image size={13} />
              <span>Change Cover</span>
            </button>
            <button
              onClick={() => setCoverUrl(null)}
              className="absolute top-4 right-4 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              title="Remove Cover"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Cover Picker Dropdown */}
        {showCoverPicker && (
          <div className="p-3 bg-stone-100 dark:bg-stone-800 border-b border-stone-200/60 dark:border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar">
            {COVER_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCoverUrl(preset)
                  setShowCoverPicker(false)
                }}
                className="h-12 w-20 rounded-xl overflow-hidden shrink-0 border-2 border-transparent hover:border-stone-900 dark:hover:border-stone-100 transition-all"
              >
                <img src={preset} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Modal Top Controls */}
        <div className="p-5 sm:p-7 overflow-y-auto no-scrollbar flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Emoji Selector */}
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setIcon(e)}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-base transition-colors ${
                      icon === e ? 'bg-white dark:bg-stone-700 shadow-xs' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              {!coverUrl && (
                <button
                  type="button"
                  onClick={() => setShowCoverPicker(!showCoverPicker)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                >
                  <Image size={14} />
                  <span>+ Cover</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tag Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TAG_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  tag === t
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-stone-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Note or Plan Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl sm:text-2xl font-black bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none tracking-tight"
            />
          </div>

          {/* Content Area (Notion / Google Keep Editor) */}
          <div>
            <textarea
              rows={12}
              placeholder="Write notes, study materials, entity lists, or itinerary details here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium leading-relaxed bg-transparent text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-7 border-t border-stone-100 dark:border-white/[0.05] bg-stone-50/50 dark:bg-stone-900/30 flex items-center justify-between">
          <div>
            {note?.id && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || !title.trim()}
              onClick={handleSave}
              className="lisso-btn-black text-xs px-5 py-2"
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
