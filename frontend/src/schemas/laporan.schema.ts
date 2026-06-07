export interface RingkasanBulanan {
  bulan: string
  pemasukan: number
  pengeluaran: number
  saldo: number
}

export interface RincianKategori {
  kategoriId: string
  jenis: string
  total: number
}

export interface RingkasanDashboard {
  totalSaldo: number
  pemasukanBulanIni: number
  pengeluaranBulanIni: number
  saldoBulanIni: number
  jumlahDompet: number
  jumlahTransaksi: number
}

export interface AktivitasTerbaru {
  id: string
  pesan: string
  jumlah: number
  jenis: string
  waktu: string
}
