package repositori

import (
	"errors"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/kategori/entitas"
	"gorm.io/gorm"
)

type RepositoriPostgres struct {
	db *gorm.DB
}

func Baru(db *gorm.DB) *RepositoriPostgres {
	return &RepositoriPostgres{db: db}
}

func (r *RepositoriPostgres) Simpan(k *entitas.Kategori) error {
	if err := k.SebelumBuat(); err != nil {
		return err
	}
	return r.db.Create(k).Error
}

func (r *RepositoriPostgres) Ubah(k *entitas.Kategori) error {
	return r.db.Save(k).Error
}

func (r *RepositoriPostgres) Hapus(id, penggunaID uuid.UUID) error {
	res := r.db.Where("id = ? AND pengguna_id = ?", id, penggunaID).Delete(&entitas.Kategori{})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *RepositoriPostgres) AmbilByID(id, penggunaID uuid.UUID) (*entitas.Kategori, error) {
	var k entitas.Kategori
	err := r.db.Where("id = ? AND pengguna_id = ?", id, penggunaID).First(&k).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &k, err
}

func (r *RepositoriPostgres) AmbilSemua(penggunaID uuid.UUID, jenis string) ([]entitas.Kategori, error) {
	q := r.db.Where("pengguna_id = ?", penggunaID)
	if jenis != "" {
		q = q.Where("jenis = ?", jenis)
	}
	var list []entitas.Kategori
	err := q.Order("nama ASC").Find(&list).Error
	return list, err
}
