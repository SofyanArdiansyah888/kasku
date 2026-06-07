package repositori

import (
	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/dompet/entitas"
)

type Repositori interface {
	Simpan(d *entitas.Dompet) error
	Ubah(d *entitas.Dompet) error
	Hapus(id, penggunaID uuid.UUID) error
	AmbilByID(id, penggunaID uuid.UUID) (*entitas.Dompet, error)
	AmbilSemua(penggunaID uuid.UUID) ([]entitas.Dompet, error)
}

// PenghitungSaldo diimplementasi modul transaksi
type PenghitungSaldo interface {
	HitungSaldoDompet(dompetID, penggunaID uuid.UUID) (float64, error)
}
