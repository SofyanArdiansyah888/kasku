package dto

type PermintaanBuat struct {
	Nama  string `json:"nama" binding:"required"`
	Jenis string `json:"jenis" binding:"required,oneof=pemasukan pengeluaran"`
	Ikon  string `json:"ikon"`
	Warna string `json:"warna"`
}

type PermintaanUbah struct {
	Nama  string `json:"nama" binding:"required"`
	Jenis string `json:"jenis" binding:"required,oneof=pemasukan pengeluaran"`
	Ikon  string `json:"ikon"`
	Warna string `json:"warna"`
}

type ResponsKategori struct {
	ID         string `json:"id"`
	Nama       string `json:"nama"`
	Jenis      string `json:"jenis"`
	Ikon       string `json:"ikon"`
	Warna      string `json:"warna"`
	DibuatPada string `json:"dibuatPada"`
}
