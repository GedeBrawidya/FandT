import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, createCategory, updateCategory, archiveCategory } from '@/features/finance/api/categories'
import type { CategoryInsert } from '@/types/database'
import { toast } from '@/components/ui/use-toast'

export function useCategories(kind?: 'expense' | 'income' | 'task') {
  return useQuery({
    queryKey: ['categories', kind],
    queryFn: () => getCategories(kind),
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<CategoryInsert, 'user_id'>) => createCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: 'Kategori baru ditambahkan',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal menambahkan kategori',
        description: err?.message,
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<CategoryInsert, 'user_id'>> }) =>
      updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: 'Kategori berhasil diperbarui',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal memperbarui kategori',
        description: err?.message,
        variant: 'destructive',
      })
    },
  })
}

export function useArchiveCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => archiveCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast({
        title: 'Kategori diarsipkan',
        variant: 'default',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Gagal mengarsipkan kategori',
        description: err?.message,
        variant: 'destructive',
      })
    },
  })
}
