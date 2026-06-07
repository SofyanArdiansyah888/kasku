package dto

type PermintaanBuat struct {
	KategoriID string  `json:"kategoriId" binding:"required,uuid"`
	Bulan      string  `json:"bulan" binding:"required"`
	Jumlah     float64 `json:"jumlah" binding:"required,gt=0"`
}

type PermintaanUbah struct {
	Jumlah float64 `json:"jumlah" binding:"required,gt=0"`
}

type ResponsAnggaran struct {
	ID         string  `json:"id"`
	KategoriID string  `json:"kategoriId"`
	Bulan      string  `json:"bulan"`
	Jumlah     float64 `json:"jumlah"`
	DibuatPada string  `json:"dibuatPada"`
}

type ItemRingkasan struct {
	KategoriID   string  `json:"kategoriId"`
	Bulan        string  `json:"bulan"`
	JumlahAnggaran float64 `json:"jumlahAnggaran"`
	Terpakai     float64 `json:"terpakai"`
	Sisa         float64 `json:"sisa"`
	Persentase   float64 `json:"persentase"`
}
