import { z } from 'zod'

export const anggaranSchema = z.object({
  kategoriId: z.string().uuid('Pilih kategori'),
  bulan: z.string().regex(/^\d{4}-\d{2}$/, 'Format bulan: YYYY-MM'),
  jumlah: z.coerce.number().positive('Jumlah harus lebih dari 0'),
})

export type AnggaranInput = z.infer<typeof anggaranSchema>

export interface Anggaran {
  id: string
  kategoriId: string
  bulan: string
  jumlah: number
  dibuatPada: string
}

export interface RingkasanAnggaran {
  kategoriId: string
  bulan: string
  jumlahAnggaran: number
  terpakai: number
  sisa: number
  persentase: number
}
