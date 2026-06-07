const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'

export { BASE_URL }

export class ApiError extends Error {
  constructor(
    message: string,
    public kode?: string,
    public status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiResponse<T> {
  berhasil: boolean
  data?: T
  meta?: { halaman?: number; batas?: number; total?: number }
  error?: { kode: string; pesan: string }
}

export function getToken(): string | null {
  return localStorage.getItem('kasku_token')
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('kasku_token', token)
  else localStorage.removeItem('kasku_token')
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    setToken(null)
    localStorage.removeItem('kasku_pengguna')
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
    throw new ApiError('Sesi berakhir, silakan masuk kembali', 'TIDAK_DIIZINKAN', 401)
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('text/csv')) {
    return (await res.text()) as T
  }

  const json = (await res.json()) as ApiResponse<T>
  if (!json.berhasil) {
    throw new ApiError(json.error?.pesan ?? 'Permintaan gagal', json.error?.kode, res.status)
  }
  return json.data as T
}

export async function apiRequestWithMeta<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; meta?: ApiResponse<T>['meta'] }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const json = (await res.json()) as ApiResponse<T>
  if (!json.berhasil) {
    throw new ApiError(json.error?.pesan ?? 'Permintaan gagal', json.error?.kode, res.status)
  }
  return { data: json.data as T, meta: json.meta }
}

export function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n)
}

export function bulanSekarang() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function tanggalHariIni() {
  return new Date().toISOString().slice(0, 10)
}
