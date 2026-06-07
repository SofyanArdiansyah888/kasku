import { apiRequest } from '../api-client'
import type { Anggaran, AnggaranInput, RingkasanAnggaran } from '../../schemas/anggaran.schema'

export const anggaranApi = {
  list: (bulan?: string) =>
    apiRequest<Anggaran[]>(`/anggaran${bulan ? `?bulan=${bulan}` : ''}`),
  ringkasan: (bulan: string) =>
    apiRequest<RingkasanAnggaran[]>(`/anggaran/ringkasan?bulan=${bulan}`),
  create: (data: AnggaranInput) =>
    apiRequest<Anggaran>('/anggaran', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, jumlah: number) =>
    apiRequest<Anggaran>(`/anggaran/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ jumlah }),
    }),
  delete: (id: string) =>
    apiRequest<{ pesan: string }>(`/anggaran/${id}`, { method: 'DELETE' }),
}
