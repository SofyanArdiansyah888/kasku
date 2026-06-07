package entitas

import (
	"time"

	"github.com/google/uuid"
)

type Tag struct {
	ID         uuid.UUID `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	PenggunaID uuid.UUID `gorm:"column:pengguna_id;type:uuid;index;not null" json:"penggunaId"`
	Nama       string    `gorm:"column:nama;not null" json:"nama"`
	DibuatPada time.Time `gorm:"column:dibuat_pada;autoCreateTime" json:"dibuatPada"`
}

func (Tag) TableName() string { return "tag" }

func (t *Tag) SebelumBuat() error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}
