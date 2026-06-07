import { z } from 'zod'

export const tagSchema = z.object({
  nama: z.string().min(1, 'Nama tag wajib diisi'),
})

export type TagInput = z.infer<typeof tagSchema>

export interface Tag {
  id: string
  nama: string
  dibuatPada: string
}
