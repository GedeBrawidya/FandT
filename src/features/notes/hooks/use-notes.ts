import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMockNotes, saveMockNote, deleteMockNote, type NoteDoc } from '@/lib/mock-storage'
import { useAuth } from '@/app/auth'

export function useNotes() {
  const qc = useQueryClient()
  const { session, isDemo } = useAuth()
  const userId = session?.user?.id

  const getNotes = (): NoteDoc[] => {
    if (!userId || isDemo) {
      return getMockNotes()
    }
    try {
      const stored = localStorage.getItem(`fandt_notes_${userId}`)
      if (stored) {
        return JSON.parse(stored) as NoteDoc[]
      }
      return []
    } catch {
      return []
    }
  }

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', userId, isDemo],
    queryFn: getNotes,
  })

  const saveNoteMutation = useMutation({
    mutationFn: (data: Partial<NoteDoc> & { title: string; content: string }) => {
      if (!userId || isDemo) {
        return Promise.resolve(saveMockNote(data))
      }
      const current = getNotes()
      const now = new Date().toISOString()
      const newDoc: NoteDoc = {
        id: data.id || `note-${Date.now()}`,
        title: data.title,
        content: data.content,
        cover_url: data.cover_url || null,
        icon: data.icon || '📝',
        tag: data.tag || 'General',
        created_at: data.created_at || now,
        updated_at: now,
      }
      const existingIdx = current.findIndex((n) => n.id === newDoc.id)
      const next = existingIdx >= 0
        ? current.map((n, i) => (i === existingIdx ? newDoc : n))
        : [newDoc, ...current]
      localStorage.setItem(`fandt_notes_${userId}`, JSON.stringify(next))
      return Promise.resolve(newDoc)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => {
      if (!userId || isDemo) {
        deleteMockNote(noteId)
        return Promise.resolve()
      }
      const current = getNotes()
      const next = current.filter((n) => n.id !== noteId)
      localStorage.setItem(`fandt_notes_${userId}`, JSON.stringify(next))
      return Promise.resolve()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  return {
    notes,
    isLoading,
    saveNote: saveNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
  }
}
