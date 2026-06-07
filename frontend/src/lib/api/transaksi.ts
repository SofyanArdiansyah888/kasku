import { apiRequest, apiRequestWithMeta } from '../api-client'
import type { Transaksi, TransaksiInput, TransferInput } from '../../schemas/transaksi.schema'

export interface FilterTransaksi {
  dari?: string
  sampai?: string
  dompet_id?: string
  kategori_id?: string
  jenis?: string
  tag_id?: string
  halaman?: number
  batas?: number
}

export const transaksiApi = {
  list: (filter: FilterTransaksi = {}) => {
    const params = new URLSearchParams()
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v))
    })
    const q = params.toString()
    return apiRequestWithMeta<Transaksi[]>(`/transaksi${q ? `?${q}` : ''}`)
  },
  create: (data: TransaksiInput) =>
    apiRequest<Transaksi>('/transaksi', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: TransaksiInput) =>
    apiRequest<Transaksi>(`/transaksi/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiRequest<{ pesan: string }>(`/transaksi/${id}`, { method: 'DELETE' }),
  transfer: (data: TransferInput) =>
    apiRequest<Transaksi>('/transaksi/transfer', { method: 'POST', body: JSON.stringify(data) }),
}
