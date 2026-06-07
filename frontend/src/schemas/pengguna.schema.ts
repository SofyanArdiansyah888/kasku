export interface Pengguna {
  id: string
  nama: string
  email: string
  dibuatPada: string
}

export interface ResponsMasuk {
  token: string
  pengguna: Pengguna
}
