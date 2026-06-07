package dto

type PermintaanBuat struct {
	DompetID         string   `json:"dompetId" binding:"required,uuid"`
	KategoriID       string   `json:"kategoriId"`
	Jenis            string   `json:"jenis" binding:"required,oneof=pemasukan pengeluaran"`
	Jumlah           float64  `json:"jumlah" binding:"required,gt=0"`
	Keterangan       string   `json:"keterangan"`
	TanggalTransaksi string   `json:"tanggalTransaksi" binding:"required"`
	TagIDs           []string `json:"tagIds"`
}

type PermintaanUbah struct {
	DompetID         string   `json:"dompetId" binding:"required,uuid"`
	KategoriID       string   `json:"kategoriId"`
	Jenis            string   `json:"jenis" binding:"required,oneof=pemasukan pengeluaran"`
	Jumlah           float64  `json:"jumlah" binding:"required,gt=0"`
	Keterangan       string   `json:"keterangan"`
	TanggalTransaksi string   `json:"tanggalTransaksi" binding:"required"`
	TagIDs           []string `json:"tagIds"`
}

type PermintaanTransfer struct {
	DompetAsalID     string  `json:"dompetAsalId" binding:"required,uuid"`
	DompetTujuanID   string  `json:"dompetTujuanId" binding:"required,uuid"`
	Jumlah           float64 `json:"jumlah" binding:"required,gt=0"`
	Keterangan       string  `json:"keterangan"`
	TanggalTransaksi string  `json:"tanggalTransaksi" binding:"required"`
}

type ResponsTransaksi struct {
	ID               string   `json:"id"`
	DompetID         string   `json:"dompetId"`
	KategoriID       string   `json:"kategoriId,omitempty"`
	Jenis            string   `json:"jenis"`
	Jumlah           float64  `json:"jumlah"`
	Keterangan       string   `json:"keterangan"`
	TanggalTransaksi string   `json:"tanggalTransaksi"`
	DompetTujuanID   string   `json:"dompetTujuanId,omitempty"`
	PasanganTransferID string `json:"pasanganTransferId,omitempty"`
	TagIDs           []string `json:"tagIds,omitempty"`
	DibuatPada       string   `json:"dibuatPada"`
}

type FilterQuery struct {
	Dari       string
	Sampai     string
	DompetID   string
	KategoriID string
	Jenis      string
	TagID      string
	Halaman    int
	Batas      int
}
