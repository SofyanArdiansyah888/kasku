package dto

type RingkasanDashboard struct {
	TotalSaldo        float64 `json:"totalSaldo"`
	PemasukanBulanIni float64 `json:"pemasukanBulanIni"`
	PengeluaranBulanIni float64 `json:"pengeluaranBulanIni"`
	SaldoBulanIni     float64 `json:"saldoBulanIni"`
	JumlahDompet      int     `json:"jumlahDompet"`
	JumlahTransaksi   int64   `json:"jumlahTransaksi"`
}

type AktivitasTerbaru struct {
	ID         string  `json:"id"`
	Pesan      string  `json:"pesan"`
	Jumlah     float64 `json:"jumlah"`
	Jenis      string  `json:"jenis"`
	Waktu      string  `json:"waktu"`
}
