import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { autentikasiApi } from '../lib/api/autentikasi'
import type { Pengguna } from '../schemas/pengguna.schema'
import { setToken } from '../lib/api-client'

export interface AuthContextType {
  pengguna: Pengguna | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [pengguna, setPengguna] = useState<Pengguna | null>(() => {
    try {
      const stored = localStorage.getItem('kasku_pengguna')
      return stored ? (JSON.parse(stored) as Pengguna) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('kasku_token'))

  useEffect(() => {
    const token = localStorage.getItem('kasku_token')
    if (!token) {
      setIsLoading(false)
      return
    }
    autentikasiApi
      .saya()
      .then((p) => {
        setPengguna(p)
        localStorage.setItem('kasku_pengguna', JSON.stringify(p))
      })
      .catch(() => {
        autentikasiApi.hapusSesi()
        setPengguna(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const isAuthenticated = !!pengguna && !!localStorage.getItem('kasku_token')

  const login = async (email: string, password: string) => {
    const res = await autentikasiApi.masuk(email, password)
    autentikasiApi.simpanSesi(res)
    setPengguna(res.pengguna)
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await autentikasiApi.daftar(name, email, password)
    autentikasiApi.simpanSesi(res)
    setPengguna(res.pengguna)
  }

  const logout = () => {
    autentikasiApi.hapusSesi()
    setToken(null)
    setPengguna(null)
  }

  return (
    <AuthContext.Provider value={{ pengguna, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
