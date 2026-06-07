import { apiRequest } from '../api-client'
import type { Kategori, KategoriInput } from '../../schemas/kategori.schema'

export const kategoriApi = {
  list: (jenis?: string) =>
    apiRequest<Kategori[]>(`/kategori${jenis ? `?jenis=${jenis}` : ''}`),
  create: (data: KategoriInput) =>
    apiRequest<Kategori>('/kategori', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: KategoriInput) =>
    apiRequest<Kategori>(`/kategori/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiRequest<{ pesan: string }>(`/kategori/${id}`, { method: 'DELETE' }),
}
