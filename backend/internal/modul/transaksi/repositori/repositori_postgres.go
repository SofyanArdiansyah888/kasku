package repositori

import (
	"errors"
	"time"

	"github.com/google/uuid"
	entDompet "github.com/kasku/backend/internal/modul/dompet/entitas"
	"github.com/kasku/backend/internal/modul/transaksi/entitas"
	"gorm.io/gorm"
)

type RepositoriPostgres struct {
	db *gorm.DB
}

func Baru(db *gorm.DB) *RepositoriPostgres {
	return &RepositoriPostgres{db: db}
}

func (r *RepositoriPostgres) MulaiTx() interface{} {
	return r.db.Begin()
}

func (r *RepositoriPostgres) CommitTx(tx interface{}) error {
	return tx.(*gorm.DB).Commit().Error
}

func (r *RepositoriPostgres) RollbackTx(tx interface{}) error {
	return tx.(*gorm.DB).Rollback().Error
}

func (r *RepositoriPostgres) Simpan(t *entitas.Transaksi) error {
	if err := t.SebelumBuat(); err != nil {
		return err
	}
	return r.db.Create(t).Error
}

func (r *RepositoriPostgres) SimpanDalamTx(tx interface{}, t *entitas.Transaksi) error {
	if err := t.SebelumBuat(); err != nil {
		return err
	}
	return tx.(*gorm.DB).Create(t).Error
}

func (r *RepositoriPostgres) Ubah(t *entitas.Transaksi) error {
	return r.db.Save(t).Error
}

func (r *RepositoriPostgres) UbahDalamTx(tx interface{}, t *entitas.Transaksi) error {
	return tx.(*gorm.DB).Save(t).Error
}

func (r *RepositoriPostgres) Hapus(id, penggunaID uuid.UUID) error {
	res := r.db.Where("id = ? AND pengguna_id = ?", id, penggunaID).Delete(&entitas.Transaksi{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	r.HapusTag(id)
	return nil
}

func (r *RepositoriPostgres) AmbilByID(id, penggunaID uuid.UUID) (*entitas.Transaksi, error) {
	var t entitas.Transaksi
	err := r.db.Where("id = ? AND pengguna_id = ?", id, penggunaID).First(&t).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &t, err
}

func (r *RepositoriPostgres) Filter(f Filter) ([]entitas.Transaksi, int64, error) {
	q := r.db.Model(&entitas.Transaksi{}).Where("pengguna_id = ?", f.PenggunaID)
	if f.Dari != nil {
		q = q.Where("tanggal_transaksi >= ?", f.Dari.Format("2006-01-02"))
	}
	if f.Sampai != nil {
		q = q.Where("tanggal_transaksi <= ?", f.Sampai.Format("2006-01-02"))
	}
	if f.DompetID != nil {
		q = q.Where("dompet_id = ?", *f.DompetID)
	}
	if f.KategoriID != nil {
		q = q.Where("kategori_id = ?", *f.KategoriID)
	}
	if f.Jenis != "" {
		q = q.Where("jenis = ?", f.Jenis)
	}
	if f.TagID != nil {
		q = q.Joins("JOIN transaksi_tag ON transaksi_tag.transaksi_id = transaksi.id").
			Where("transaksi_tag.tag_id = ?", *f.TagID)
	}

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	batas := f.Batas
	if batas <= 0 {
		batas = 20
	}
	halaman := f.Halaman
	if halaman <= 0 {
		halaman = 1
	}
	offset := (halaman - 1) * batas

	var list []entitas.Transaksi
	err := q.Order("tanggal_transaksi DESC, dibuat_pada DESC").Offset(offset).Limit(batas).Find(&list).Error
	return list, total, err
}

func (r *RepositoriPostgres) HitungSaldoDompet(dompetID, penggunaID uuid.UUID) (float64, error) {
	saldoAwal, err := r.AmbilSaldoAwalDompet(dompetID, penggunaID)
	if err != nil {
		return 0, err
	}

	var transaksi []entitas.Transaksi
	err = r.db.Where("pengguna_id = ? AND (dompet_id = ? OR dompet_tujuan_id = ?)", penggunaID, dompetID, dompetID).
		Find(&transaksi).Error
	if err != nil {
		return 0, err
	}

	saldo := saldoAwal
	for _, t := range transaksi {
		switch t.Jenis {
		case entitas.JenisPemasukan:
			if t.DompetID == dompetID {
				saldo += t.Jumlah
			}
		case entitas.JenisPengeluaran:
			if t.DompetID == dompetID {
				saldo -= t.Jumlah
			}
		case entitas.JenisTransfer:
			if t.DompetID == dompetID {
				saldo -= t.Jumlah
			}
			if t.DompetTujuanID != nil && *t.DompetTujuanID == dompetID {
				saldo += t.Jumlah
			}
		}
	}
	return saldo, nil
}

func (r *RepositoriPostgres) AmbilSaldoAwalDompet(dompetID, penggunaID uuid.UUID) (float64, error) {
	var d entDompet.Dompet
	err := r.db.Select("saldo_awal").Where("id = ? AND pengguna_id = ?", dompetID, penggunaID).First(&d).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return 0, nil
	}
	return d.SaldoAwal, err
}

func (r *RepositoriPostgres) SimpanTag(transaksiID uuid.UUID, tagIDs []uuid.UUID) error {
	r.HapusTag(transaksiID)
	for _, tagID := range tagIDs {
		if err := r.db.Create(&entitas.TransaksiTag{TransaksiID: transaksiID, TagID: tagID}).Error; err != nil {
			return err
		}
	}
	return nil
}

func (r *RepositoriPostgres) AmbilTagIDs(transaksiID uuid.UUID) ([]uuid.UUID, error) {
	var rows []entitas.TransaksiTag
	if err := r.db.Where("transaksi_id = ?", transaksiID).Find(&rows).Error; err != nil {
		return nil, err
	}
	ids := make([]uuid.UUID, len(rows))
	for i, row := range rows {
		ids[i] = row.TagID
	}
	return ids, nil
}

func (r *RepositoriPostgres) HapusTag(transaksiID uuid.UUID) error {
	return r.db.Where("transaksi_id = ?", transaksiID).Delete(&entitas.TransaksiTag{}).Error
}

func (r *RepositoriPostgres) TotalByJenis(penggunaID uuid.UUID, jenis string, dari, sampai time.Time) (float64, error) {
	var total float64
	err := r.db.Model(&entitas.Transaksi{}).
		Where("pengguna_id = ? AND jenis = ? AND tanggal_transaksi BETWEEN ? AND ?",
			penggunaID, jenis, dari.Format("2006-01-02"), sampai.Format("2006-01-02")).
		Select("COALESCE(SUM(jumlah), 0)").Scan(&total).Error
	return total, err
}

func (r *RepositoriPostgres) TotalByKategori(penggunaID uuid.UUID, kategoriID uuid.UUID, dari, sampai time.Time) (float64, error) {
	var total float64
	err := r.db.Model(&entitas.Transaksi{}).
		Where("pengguna_id = ? AND kategori_id = ? AND jenis = ? AND tanggal_transaksi BETWEEN ? AND ?",
			penggunaID, kategoriID, entitas.JenisPengeluaran, dari.Format("2006-01-02"), sampai.Format("2006-01-02")).
		Select("COALESCE(SUM(jumlah), 0)").Scan(&total).Error
	return total, err
}

func (r *RepositoriPostgres) AmbilTerbaru(penggunaID uuid.UUID, batas int) ([]entitas.Transaksi, error) {
	var list []entitas.Transaksi
	err := r.db.Where("pengguna_id = ?", penggunaID).
		Order("dibuat_pada DESC").Limit(batas).Find(&list).Error
	return list, err
}

func (r *RepositoriPostgres) AmbilUntukEkspor(penggunaID uuid.UUID, dari, sampai *time.Time) ([]entitas.Transaksi, error) {
	q := r.db.Where("pengguna_id = ?", penggunaID)
	if dari != nil {
		q = q.Where("tanggal_transaksi >= ?", dari.Format("2006-01-02"))
	}
	if sampai != nil {
		q = q.Where("tanggal_transaksi <= ?", sampai.Format("2006-01-02"))
	}
	var list []entitas.Transaksi
	err := q.Order("tanggal_transaksi ASC").Find(&list).Error
	return list, err
}
