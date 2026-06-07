import { apiRequest } from '../api-client'
import type { TransaksiBerulang, TransaksiBerulangInput } from '../../schemas/transaksi-berulang.schema'

export const transaksiBerulangApi = {
  list: () => apiRequest<TransaksiBerulang[]>('/transaksi-berulang'),
  create: (data: TransaksiBerulangInput) =>
    apiRequest<TransaksiBerulang>('/transaksi-berulang', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<TransaksiBerulangInput> & { aktif: boolean }) =>
    apiRequest<TransaksiBerulang>(`/transaksi-berulang/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<{ pesan: string }>(`/transaksi-berulang/${id}`, { method: 'DELETE' }),
  proses: () =>
    apiRequest<{ diproses: number; pesan: string }>('/transaksi-berulang/proses', { method: 'POST' }),
}
