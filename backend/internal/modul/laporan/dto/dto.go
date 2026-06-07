package dto

type RingkasanBulanan struct {
	Bulan       string  `json:"bulan"`
	Pemasukan   float64 `json:"pemasukan"`
	Pengeluaran float64 `json:"pengeluaran"`
	Saldo       float64 `json:"saldo"`
}

type RincianKategori struct {
	KategoriID string  `json:"kategoriId"`
	Jenis      string  `json:"jenis"`
	Total      float64 `json:"total"`
}
