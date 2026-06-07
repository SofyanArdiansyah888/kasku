package repositori

import (
	"time"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/transaksi/entitas"
)

type Filter struct {
	PenggunaID uuid.UUID
	Dari       *time.Time
	Sampai     *time.Time
	DompetID   *uuid.UUID
	KategoriID *uuid.UUID
	Jenis      string
	TagID      *uuid.UUID
	Halaman    int
	Batas      int
}

type Repositori interface {
	Simpan(t *entitas.Transaksi) error
	SimpanDalamTx(tx interface{}, t *entitas.Transaksi) error
	Ubah(t *entitas.Transaksi) error
	UbahDalamTx(tx interface{}, t *entitas.Transaksi) error
	Hapus(id, penggunaID uuid.UUID) error
	AmbilByID(id, penggunaID uuid.UUID) (*entitas.Transaksi, error)
	Filter(f Filter) ([]entitas.Transaksi, int64, error)
	HitungSaldoDompet(dompetID, penggunaID uuid.UUID) (float64, error)
	AmbilSaldoAwalDompet(dompetID, penggunaID uuid.UUID) (float64, error)
	SimpanTag(transaksiID uuid.UUID, tagIDs []uuid.UUID) error
	AmbilTagIDs(transaksiID uuid.UUID) ([]uuid.UUID, error)
	HapusTag(transaksiID uuid.UUID) error
	MulaiTx() interface{}
	CommitTx(tx interface{}) error
	RollbackTx(tx interface{}) error
	TotalByJenis(penggunaID uuid.UUID, jenis string, dari, sampai time.Time) (float64, error)
	TotalByKategori(penggunaID uuid.UUID, kategoriID uuid.UUID, dari, sampai time.Time) (float64, error)
	AmbilTerbaru(penggunaID uuid.UUID, batas int) ([]entitas.Transaksi, error)
	AmbilUntukEkspor(penggunaID uuid.UUID, dari, sampai *time.Time) ([]entitas.Transaksi, error)
}
