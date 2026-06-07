package entitas

import (
	"time"

	"github.com/google/uuid"
)

const (
	JenisPemasukan  = "pemasukan"
	JenisPengeluaran = "pengeluaran"
)

type Kategori struct {
	ID         uuid.UUID `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	PenggunaID uuid.UUID `gorm:"column:pengguna_id;type:uuid;index;not null" json:"penggunaId"`
	Nama       string    `gorm:"column:nama;not null" json:"nama"`
	Jenis      string    `gorm:"column:jenis;not null" json:"jenis"`
	Ikon       string    `gorm:"column:ikon" json:"ikon"`
	Warna      string    `gorm:"column:warna" json:"warna"`
	DibuatPada time.Time `gorm:"column:dibuat_pada;autoCreateTime" json:"dibuatPada"`
}

func (Kategori) TableName() string { return "kategori" }

func (k *Kategori) SebelumBuat() error {
	if k.ID == uuid.Nil {
		k.ID = uuid.New()
	}
	return nil
}
