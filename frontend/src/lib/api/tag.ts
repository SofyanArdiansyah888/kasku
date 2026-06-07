import { apiRequest } from '../api-client'
import type { Tag, TagInput } from '../../schemas/tag.schema'

export const tagApi = {
  list: () => apiRequest<Tag[]>('/tag'),
  create: (data: TagInput) =>
    apiRequest<Tag>('/tag', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: TagInput) =>
    apiRequest<Tag>(`/tag/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiRequest<{ pesan: string }>(`/tag/${id}`, { method: 'DELETE' }),
}
