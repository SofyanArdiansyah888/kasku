import { z } from 'zod'

export const jenisDompet = ['tunai', 'bank', 'dompet_digital'] as const

export const dompetSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  jenis: z.enum(jenisDompet, { message: 'Pilih jenis dompet' }),
  saldoAwal: z.coerce.number().min(0, 'Saldo awal tidak boleh negatif'),
  mataUang: z.string().default('IDR'),
})

export type DompetInput = z.infer<typeof dompetSchema>

export interface Dompet {
  id: string
  nama: string
  jenis: (typeof jenisDompet)[number]
  saldoAwal: number
  saldo: number
  mataUang: string
  dibuatPada: string
}

export const labelJenisDompet: Record<(typeof jenisDompet)[number], string> = {
  tunai: 'Tunai',
  bank: 'Bank',
  dompet_digital: 'Dompet Digital',
}
