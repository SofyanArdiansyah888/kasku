package repositori

import (
	"errors"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/autentikasi/entitas"
	"gorm.io/gorm"
)

type RepositoriPostgres struct {
	db *gorm.DB
}

func Baru(db *gorm.DB) *RepositoriPostgres {
	return &RepositoriPostgres{db: db}
}

func (r *RepositoriPostgres) Simpan(p *entitas.Pengguna) error {
	if err := p.SebelumBuat(); err != nil {
		return err
	}
	return r.db.Create(p).Error
}

func (r *RepositoriPostgres) CariByEmail(email string) (*entitas.Pengguna, error) {
	var p entitas.Pengguna
	err := r.db.Where("email = ?", email).First(&p).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &p, err
}

func (r *RepositoriPostgres) CariByID(id uuid.UUID) (*entitas.Pengguna, error) {
	var p entitas.Pengguna
	err := r.db.First(&p, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &p, err
}

func (r *RepositoriPostgres) Hitung() (int64, error) {
	var n int64
	err := r.db.Model(&entitas.Pengguna{}).Count(&n).Error
	return n, err
}
