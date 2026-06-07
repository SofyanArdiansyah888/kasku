package repositori

import (
	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/anggaran/entitas"
)

type Repositori interface {
	Simpan(a *entitas.Anggaran) error
	Ubah(a *entitas.Anggaran) error
	Hapus(id, penggunaID uuid.UUID) error
	AmbilByID(id, penggunaID uuid.UUID) (*entitas.Anggaran, error)
	AmbilSemua(penggunaID uuid.UUID, bulan string) ([]entitas.Anggaran, error)
	AmbilByKategoriBulan(penggunaID, kategoriID uuid.UUID, bulan string) (*entitas.Anggaran, error)
}
