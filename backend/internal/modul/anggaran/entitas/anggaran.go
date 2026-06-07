package entitas

import (
	"time"

	"github.com/google/uuid"
)

type Anggaran struct {
	ID         uuid.UUID `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	PenggunaID uuid.UUID `gorm:"column:pengguna_id;type:uuid;index;not null" json:"penggunaId"`
	KategoriID uuid.UUID `gorm:"column:kategori_id;type:uuid;index;not null" json:"kategoriId"`
	Bulan      string    `gorm:"column:bulan;not null" json:"bulan"`
	Jumlah     float64   `gorm:"column:jumlah;not null" json:"jumlah"`
	DibuatPada time.Time `gorm:"column:dibuat_pada;autoCreateTime" json:"dibuatPada"`
}

func (Anggaran) TableName() string { return "anggaran" }

func (a *Anggaran) SebelumBuat() error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
