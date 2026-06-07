package repositori

import (
	"errors"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/anggaran/entitas"
	"gorm.io/gorm"
)

type RepositoriPostgres struct {
	db *gorm.DB
}

func Baru(db *gorm.DB) *RepositoriPostgres {
	return &RepositoriPostgres{db: db}
}

func (r *RepositoriPostgres) Simpan(a *entitas.Anggaran) error {
	if err := a.SebelumBuat(); err != nil {
		return err
	}
	return r.db.Create(a).Error
}

func (r *RepositoriPostgres) Ubah(a *entitas.Anggaran) error {
	return r.db.Save(a).Error
}

func (r *RepositoriPostgres) Hapus(id, penggunaID uuid.UUID) error {
	res := r.db.Where("id = ? AND pengguna_id = ?", id, penggunaID).Delete(&entitas.Anggaran{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *RepositoriPostgres) AmbilByID(id, penggunaID uuid.UUID) (*entitas.Anggaran, error) {
	var a entitas.Anggaran
	err := r.db.Where("id = ? AND pengguna_id = ?", id, penggunaID).First(&a).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &a, err
}

func (r *RepositoriPostgres) AmbilSemua(penggunaID uuid.UUID, bulan string) ([]entitas.Anggaran, error) {
	q := r.db.Where("pengguna_id = ?", penggunaID)
	if bulan != "" {
		q = q.Where("bulan = ?", bulan)
	}
	var list []entitas.Anggaran
	err := q.Find(&list).Error
	return list, err
}

func (r *RepositoriPostgres) AmbilByKategoriBulan(penggunaID, kategoriID uuid.UUID, bulan string) (*entitas.Anggaran, error) {
	var a entitas.Anggaran
	err := r.db.Where("pengguna_id = ? AND kategori_id = ? AND bulan = ?", penggunaID, kategoriID, bulan).First(&a).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &a, err
}
