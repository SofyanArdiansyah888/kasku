package repositori

import (
	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/tag/entitas"
)

type Repositori interface {
	Simpan(t *entitas.Tag) error
	Ubah(t *entitas.Tag) error
	Hapus(id, penggunaID uuid.UUID) error
	AmbilByID(id, penggunaID uuid.UUID) (*entitas.Tag, error)
	AmbilSemua(penggunaID uuid.UUID) ([]entitas.Tag, error)
	AmbilByIDs(ids []uuid.UUID, penggunaID uuid.UUID) ([]entitas.Tag, error)
}
