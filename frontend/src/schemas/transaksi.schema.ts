import { z } from 'zod'

export const jenisTransaksi = ['pemasukan', 'pengeluaran'] as const

export const transaksiSchema = z.object({
  dompetId: z.string().uuid('Pilih dompet'),
  kategoriId: z.string().uuid('Pilih kategori').optional().or(z.literal('')),
  jenis: z.enum(jenisTransaksi),
  jumlah: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  keterangan: z.string().optional(),
  tanggalTransaksi: z.string().min(1, 'Tanggal wajib diisi'),
  tagIds: z.array(z.string()).optional(),
})

export const transferSchema = z.object({
  dompetAsalId: z.string().uuid('Pilih dompet asal'),
  dompetTujuanId: z.string().uuid('Pilih dompet tujuan'),
  jumlah: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  keterangan: z.string().optional(),
  tanggalTransaksi: z.string().min(1, 'Tanggal wajib diisi'),
})

export type TransaksiInput = z.infer<typeof transaksiSchema>
export type TransferInput = z.infer<typeof transferSchema>

export interface Transaksi {
  id: string
  dompetId: string
  kategoriId?: string
  jenis: string
  jumlah: number
  keterangan: string
  tanggalTransaksi: string
  dompetTujuanId?: string
  pasanganTransferId?: string
  tagIds?: string[]
  dibuatPada: string
}
