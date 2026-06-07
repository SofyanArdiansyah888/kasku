import { z } from 'zod'

export const jenisKategori = ['pemasukan', 'pengeluaran'] as const

export const kategoriSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  jenis: z.enum(jenisKategori, { message: 'Pilih jenis kategori' }),
  ikon: z.string().optional(),
  warna: z.string().optional(),
})

export type KategoriInput = z.infer<typeof kategoriSchema>

export interface Kategori {
  id: string
  nama: string
  jenis: (typeof jenisKategori)[number]
  ikon?: string
  warna?: string
  dibuatPada: string
}

export const labelJenisKategori: Record<(typeof jenisKategori)[number], string> = {
  pemasukan: 'Pemasukan',
  pengeluaran: 'Pengeluaran',
}
