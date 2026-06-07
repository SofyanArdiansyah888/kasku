import { z } from 'zod'

export const frekuensiBerulang = ['harian', 'mingguan', 'bulanan', 'tahunan'] as const

export const transaksiBerulangSchema = z.object({
  dompetId: z.string().uuid('Pilih dompet'),
  kategoriId: z.string().uuid('Pilih kategori'),
  jenis: z.enum(['pemasukan', 'pengeluaran']),
  jumlah: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  keterangan: z.string().optional(),
  frekuensi: z.enum(frekuensiBerulang),
  interval: z.coerce.number().int().min(1).default(1),
  tanggalMulai: z.string().min(1),
  tanggalSelesai: z.string().optional(),
  aktif: z.boolean().default(true),
})

export type TransaksiBerulangInput = z.infer<typeof transaksiBerulangSchema>

export interface TransaksiBerulang {
  id: string
  dompetId: string
  kategoriId: string
  jenis: string
  jumlah: number
  keterangan: string
  frekuensi: string
  interval: number
  tanggalMulai: string
  tanggalSelesai?: string
  tanggalJalankanBerikutnya: string
  aktif: boolean
  dibuatPada: string
}

export const labelFrekuensi: Record<(typeof frekuensiBerulang)[number], string> = {
  harian: 'Harian',
  mingguan: 'Mingguan',
  bulanan: 'Bulanan',
  tahunan: 'Tahunan',
}
