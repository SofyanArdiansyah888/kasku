package entitas

import (
	"time"

	"github.com/google/uuid"
)

const (
	JenisTunai         = "tunai"
	JenisBank          = "bank"
	JenisDompetDigital = "dompet_digital"
)

type Dompet struct {
	ID         uuid.UUID `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	PenggunaID uuid.UUID `gorm:"column:pengguna_id;type:uuid;index;not null" json:"penggunaId"`
	Nama       string    `gorm:"column:nama;not null" json:"nama"`
	Jenis      string    `gorm:"column:jenis;not null" json:"jenis"`
	SaldoAwal  float64   `gorm:"column:saldo_awal;default:0" json:"saldoAwal"`
	MataUang   string    `gorm:"column:mata_uang;default:IDR" json:"mataUang"`
	DibuatPada time.Time `gorm:"column:dibuat_pada;autoCreateTime" json:"dibuatPada"`
}

func (Dompet) TableName() string { return "dompet" }

func (d *Dompet) SebelumBuat() error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}
