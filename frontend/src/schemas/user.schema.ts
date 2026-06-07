import { z } from 'zod'

export const userRoles = ['Superadmin', 'Editor', 'Viewer'] as const
export const userStatuses = ['Aktif', 'Nonaktif'] as const

export type UserRole = (typeof userRoles)[number]
export type UserStatus = (typeof userStatuses)[number]

export const userSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(64, 'Nama terlalu panjang'),
  email: z.string().email('Email tidak valid'),
  role: z.enum(userRoles, { errorMap: () => ({ message: 'Pilih role yang valid' }) }),
  status: z.enum(userStatuses, { errorMap: () => ({ message: 'Pilih status yang valid' }) }),
})

export const createUserSchema = userSchema

export const updateUserSchema = userSchema.partial()

export type UserInput = z.infer<typeof userSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
}
