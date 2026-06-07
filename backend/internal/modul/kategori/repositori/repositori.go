package repositori

import (
	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/kategori/entitas"
)

type Repositori interface {
	Simpan(k *entitas.Kategori) error
	Ubah(k *entitas.Kategori) error
	Hapus(id, penggunaID uuid.UUID) error
	AmbilByID(id, penggunaID uuid.UUID) (*entitas.Kategori, error)
	AmbilSemua(penggunaID uuid.UUID, jenis string) ([]entitas.Kategori, error)
}
