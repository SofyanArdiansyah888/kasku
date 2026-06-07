package repositori

import (
	"time"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/transaksi_berulang/entitas"
)

type Repositori interface {
	Simpan(t *entitas.TransaksiBerulang) error
	Ubah(t *entitas.TransaksiBerulang) error
	Hapus(id, penggunaID uuid.UUID) error
	AmbilByID(id, penggunaID uuid.UUID) (*entitas.TransaksiBerulang, error)
	AmbilSemua(penggunaID uuid.UUID) ([]entitas.TransaksiBerulang, error)
	AmbilJatuhTempo(penggunaID *uuid.UUID, hariIni time.Time) ([]entitas.TransaksiBerulang, error)
}
