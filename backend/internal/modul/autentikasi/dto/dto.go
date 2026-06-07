package dto

type PermintaanDaftar struct {
	Nama       string `json:"nama" binding:"required,min=2"`
	Email      string `json:"email" binding:"required,email"`
	KataSandi  string `json:"kataSandi" binding:"required,min=6"`
}

type PermintaanMasuk struct {
	Email     string `json:"email" binding:"required,email"`
	KataSandi string `json:"kataSandi" binding:"required"`
}

type ResponsMasuk struct {
	Token    string          `json:"token"`
	Pengguna ResponsPengguna `json:"pengguna"`
}

type ResponsPengguna struct {
	ID         string `json:"id"`
	Nama       string `json:"nama"`
	Email      string `json:"email"`
	DibuatPada string `json:"dibuatPada"`
}
