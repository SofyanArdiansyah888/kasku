package repositori

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/transaksi_berulang/entitas"
	"gorm.io/gorm"
)

type RepositoriPostgres struct {
	db *gorm.DB
}

func Baru(db *gorm.DB) *RepositoriPostgres {
	return &RepositoriPostgres{db: db}
}

func (r *RepositoriPostgres) Simpan(t *entitas.TransaksiBerulang) error {
	if err := t.SebelumBuat(); err != nil {
		return err
	}
	return r.db.Create(t).Error
}

func (r *RepositoriPostgres) Ubah(t *entitas.TransaksiBerulang) error {
	return r.db.Save(t).Error
}

func (r *RepositoriPostgres) Hapus(id, penggunaID uuid.UUID) error {
	res := r.db.Where("id = ? AND pengguna_id = ?", id, penggunaID).Delete(&entitas.TransaksiBerulang{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *RepositoriPostgres) AmbilByID(id, penggunaID uuid.UUID) (*entitas.TransaksiBerulang, error) {
	var t entitas.TransaksiBerulang
	err := r.db.Where("id = ? AND pengguna_id = ?", id, penggunaID).First(&t).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &t, err
}

func (r *RepositoriPostgres) AmbilSemua(penggunaID uuid.UUID) ([]entitas.TransaksiBerulang, error) {
	var list []entitas.TransaksiBerulang
	err := r.db.Where("pengguna_id = ?", penggunaID).Order("dibuat_pada DESC").Find(&list).Error
	return list, err
}

func (r *RepositoriPostgres) AmbilJatuhTempo(penggunaID *uuid.UUID, hariIni time.Time) ([]entitas.TransaksiBerulang, error) {
	var list []entitas.TransaksiBerulang
	q := r.db.Where("aktif = ? AND tanggal_jalankan_berikutnya <= ?", true, hariIni.Format("2006-01-02"))
	if penggunaID != nil {
		q = q.Where("pengguna_id = ?", *penggunaID)
	}
	err := q.Find(&list).Error
	return list, err
}
