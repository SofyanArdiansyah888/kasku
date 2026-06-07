package dto

type PermintaanBuat struct {
	Nama string `json:"nama" binding:"required"`
}

type PermintaanUbah struct {
	Nama string `json:"nama" binding:"required"`
}

type ResponsTag struct {
	ID         string `json:"id"`
	Nama       string `json:"nama"`
	DibuatPada string `json:"dibuatPada"`
}
