import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMockNotes, saveMockNote, deleteMockNote, type NoteDoc } from '@/lib/mock-storage'

export function useNotes() {
  const qc = useQueryClient()

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => getMockNotes(),
  })

  const saveNoteMutation = useMutation({
    mutationFn: (data: Partial<NoteDoc> & { title: string; content: string }) => {
      return Promise.resolve(saveMockNote(data))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => {
      deleteMockNote(noteId)
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
