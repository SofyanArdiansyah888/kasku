import { apiRequest } from '../api-client'
import type { Dompet, DompetInput } from '../../schemas/dompet.schema'

export const dompetApi = {
  list: () => apiRequest<Dompet[]>('/dompet'),
  get: (id: string) => apiRequest<Dompet>(`/dompet/${id}`),
  create: (data: DompetInput) =>
    apiRequest<Dompet>('/dompet', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: DompetInput) =>
    apiRequest<Dompet>(`/dompet/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiRequest<{ pesan: string }>(`/dompet/${id}`, { method: 'DELETE' }),
}
