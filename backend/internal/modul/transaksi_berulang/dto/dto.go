package dto

type PermintaanBuat struct {
	DompetID     string  `json:"dompetId" binding:"required,uuid"`
	KategoriID   string  `json:"kategoriId" binding:"required,uuid"`
	Jenis        string  `json:"jenis" binding:"required,oneof=pemasukan pengeluaran"`
	Jumlah       float64 `json:"jumlah" binding:"required,gt=0"`
	Keterangan   string  `json:"keterangan"`
	Frekuensi    string  `json:"frekuensi" binding:"required,oneof=harian mingguan bulanan tahunan"`
	Interval     int     `json:"interval"`
	TanggalMulai string  `json:"tanggalMulai" binding:"required"`
	TanggalSelesai string `json:"tanggalSelesai"`
	Aktif        *bool   `json:"aktif"`
}

type PermintaanUbah struct {
	Jumlah       float64 `json:"jumlah" binding:"required,gt=0"`
	Keterangan   string  `json:"keterangan"`
	Frekuensi    string  `json:"frekuensi" binding:"required,oneof=harian mingguan bulanan tahunan"`
	Interval     int     `json:"interval"`
	TanggalSelesai string `json:"tanggalSelesai"`
	Aktif        bool    `json:"aktif"`
}

type ResponsTransaksiBerulang struct {
	ID                        string  `json:"id"`
	DompetID                  string  `json:"dompetId"`
	KategoriID                string  `json:"kategoriId"`
	Jenis                     string  `json:"jenis"`
	Jumlah                    float64 `json:"jumlah"`
	Keterangan                string  `json:"keterangan"`
	Frekuensi                 string  `json:"frekuensi"`
	Interval                  int     `json:"interval"`
	TanggalMulai              string  `json:"tanggalMulai"`
	TanggalSelesai            string  `json:"tanggalSelesai,omitempty"`
	TanggalJalankanBerikutnya string  `json:"tanggalJalankanBerikutnya"`
	Aktif                     bool    `json:"aktif"`
	DibuatPada                string  `json:"dibuatPada"`
}
