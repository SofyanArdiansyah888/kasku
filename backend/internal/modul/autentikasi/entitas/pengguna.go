package entitas

import (
	"time"

	"github.com/google/uuid"
)

type Pengguna struct {
	ID             uuid.UUID `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	Nama           string    `gorm:"column:nama;not null" json:"nama"`
	Email          string    `gorm:"column:email;uniqueIndex;not null" json:"email"`
	KataSandiHash  string    `gorm:"column:kata_sandi_hash;not null" json:"-"`
	DibuatPada     time.Time `gorm:"column:dibuat_pada;autoCreateTime" json:"dibuatPada"`
	DiperbaruiPada time.Time `gorm:"column:diperbarui_pada;autoUpdateTime" json:"diperbaruiPada"`
}

func (Pengguna) TableName() string { return "pengguna" }

func (p *Pengguna) SebelumBuat() error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
