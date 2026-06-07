package entitas

import (
	"time"

	"github.com/google/uuid"
)

const (
	FrekuensiHarian   = "harian"
	FrekuensiMingguan = "mingguan"
	FrekuensiBulanan  = "bulanan"
	FrekuensiTahunan  = "tahunan"
)

type TransaksiBerulang struct {
	ID                        uuid.UUID  `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	PenggunaID                uuid.UUID  `gorm:"column:pengguna_id;type:uuid;index;not null" json:"penggunaId"`
	DompetID                  uuid.UUID  `gorm:"column:dompet_id;type:uuid;not null" json:"dompetId"`
	KategoriID                uuid.UUID  `gorm:"column:kategori_id;type:uuid;not null" json:"kategoriId"`
	Jenis                     string     `gorm:"column:jenis;not null" json:"jenis"`
	Jumlah                    float64    `gorm:"column:jumlah;not null" json:"jumlah"`
	Keterangan                string     `gorm:"column:keterangan" json:"keterangan"`
	Frekuensi                 string     `gorm:"column:frekuensi;not null" json:"frekuensi"`
	Interval                  int        `gorm:"column:interval;default:1" json:"interval"`
	TanggalMulai              time.Time  `gorm:"column:tanggal_mulai;type:date;not null" json:"tanggalMulai"`
	TanggalSelesai            *time.Time `gorm:"column:tanggal_selesai;type:date" json:"tanggalSelesai,omitempty"`
	TanggalJalankanBerikutnya time.Time  `gorm:"column:tanggal_jalankan_berikutnya;type:date;not null" json:"tanggalJalankanBerikutnya"`
	Aktif                     bool       `gorm:"column:aktif;default:true" json:"aktif"`
	DibuatPada                time.Time  `gorm:"column:dibuat_pada;autoCreateTime" json:"dibuatPada"`
}

func (TransaksiBerulang) TableName() string { return "transaksi_berulang" }

func (t *TransaksiBerulang) SebelumBuat() error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}
