import { getToken } from '../api-client'
import type {
  RingkasanBulanan,
  RincianKategori,
  RingkasanDashboard,
  AktivitasTerbaru,
} from '../../schemas/laporan.schema'
import { apiRequest } from '../api-client'

export const dashboardApi = {
  ringkasan: () => apiRequest<RingkasanDashboard>('/dashboard/ringkasan'),
  aktivitas: () => apiRequest<AktivitasTerbaru[]>('/dashboard/aktivitas-terbaru'),
}

export const laporanApi = {
  bulanan: (bulan: string) =>
    apiRequest<RingkasanBulanan>(`/laporan/bulanan?bulan=${bulan}`),
  rincianKategori: (bulan: string) =>
    apiRequest<RincianKategori[]>(`/laporan/rincian-kategori?bulan=${bulan}`),
  eksporTransaksi: async (dari?: string, sampai?: string) => {
    const params = new URLSearchParams()
    if (dari) params.set('dari', dari)
    if (sampai) params.set('sampai', sampai)
    const token = getToken()
    const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'
    const res = await fetch(`${base}/ekspor/transaksi?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error('Gagal mengekspor')
    return res.blob()
  },
}
