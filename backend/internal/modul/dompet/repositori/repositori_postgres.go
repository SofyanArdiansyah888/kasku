package repositori

import (
	"errors"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/dompet/entitas"
	"gorm.io/gorm"
)

type RepositoriPostgres struct {
	db *gorm.DB
}

func Baru(db *gorm.DB) *RepositoriPostgres {
	return &RepositoriPostgres{db: db}
}

func (r *RepositoriPostgres) Simpan(d *entitas.Dompet) error {
	if err := d.SebelumBuat(); err != nil {
		return err
	}
	return r.db.Create(d).Error
}

func (r *RepositoriPostgres) Ubah(d *entitas.Dompet) error {
	return r.db.Save(d).Error
}

func (r *RepositoriPostgres) Hapus(id, penggunaID uuid.UUID) error {
	res := r.db.Where("id = ? AND pengguna_id = ?", id, penggunaID).Delete(&entitas.Dompet{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *RepositoriPostgres) AmbilByID(id, penggunaID uuid.UUID) (*entitas.Dompet, error) {
	var d entitas.Dompet
	err := r.db.Where("id = ? AND pengguna_id = ?", id, penggunaID).First(&d).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &d, err
}

func (r *RepositoriPostgres) AmbilSemua(penggunaID uuid.UUID) ([]entitas.Dompet, error) {
	var list []entitas.Dompet
	err := r.db.Where("pengguna_id = ?", penggunaID).Order("dibuat_pada ASC").Find(&list).Error
	return list, err
}
