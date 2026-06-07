import { apiRequest, setToken } from '../api-client'
import type { Pengguna, ResponsMasuk } from '../../schemas/pengguna.schema'

export const autentikasiApi = {
  daftar: (nama: string, email: string, kataSandi: string) =>
    apiRequest<ResponsMasuk>('/autentikasi/daftar', {
      method: 'POST',
      body: JSON.stringify({ nama, email, kataSandi }),
    }),

  masuk: (email: string, kataSandi: string) =>
    apiRequest<ResponsMasuk>('/autentikasi/masuk', {
      method: 'POST',
      body: JSON.stringify({ email, kataSandi }),
    }),

  saya: () => apiRequest<Pengguna>('/autentikasi/saya'),

  simpanSesi: (res: ResponsMasuk) => {
    setToken(res.token)
    localStorage.setItem('kasku_pengguna', JSON.stringify(res.pengguna))
  },

  hapusSesi: () => {
    setToken(null)
    localStorage.removeItem('kasku_pengguna')
  },
}
