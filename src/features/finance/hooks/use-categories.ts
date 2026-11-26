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
        title: 'Category added successfully',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to add category',
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
        title: 'Category updated successfully',
        variant: 'success',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to update category',
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
        title: 'Category archived',
        variant: 'default',
      })
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to archive category',
        description: err?.message,
        variant: 'destructive',
      })
    },
  })
}
