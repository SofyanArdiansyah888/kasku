import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockApi } from '../../../lib/mock-api'
import type { CreateUserInput } from '../../../schemas/user.schema'

const QUERY_KEY = ['users'] as const

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: mockApi.users.list,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserInput) => mockApi.users.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateUserInput> }) =>
      mockApi.users.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mockApi.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
