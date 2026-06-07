package entitas

import (
	"time"

	"github.com/google/uuid"
)

const (
	JenisPemasukan  = "pemasukan"
	JenisPengeluaran = "pengeluaran"
	JenisTransfer   = "transfer"
)

type Transaksi struct {
	ID                   uuid.UUID  `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	PenggunaID           uuid.UUID  `gorm:"column:pengguna_id;type:uuid;index;not null" json:"penggunaId"`
	DompetID             uuid.UUID  `gorm:"column:dompet_id;type:uuid;index;not null" json:"dompetId"`
	KategoriID           *uuid.UUID `gorm:"column:kategori_id;type:uuid" json:"kategoriId,omitempty"`
	Jenis                string     `gorm:"column:jenis;not null" json:"jenis"`
	Jumlah               float64    `gorm:"column:jumlah;not null" json:"jumlah"`
	Keterangan           string     `gorm:"column:keterangan" json:"keterangan"`
	TanggalTransaksi     time.Time  `gorm:"column:tanggal_transaksi;type:date;not null" json:"tanggalTransaksi"`
	PasanganTransferID   *uuid.UUID `gorm:"column:pasangan_transfer_id;type:uuid" json:"pasanganTransferId,omitempty"`
	TransaksiBerulangID  *uuid.UUID `gorm:"column:transaksi_berulang_id;type:uuid" json:"transaksiBerulangId,omitempty"`
	DompetTujuanID       *uuid.UUID `gorm:"column:dompet_tujuan_id;type:uuid" json:"dompetTujuanId,omitempty"`
	DibuatPada           time.Time  `gorm:"column:dibuat_pada;autoCreateTime" json:"dibuatPada"`
}

func (Transaksi) TableName() string { return "transaksi" }

func (t *Transaksi) SebelumBuat() error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

type TransaksiTag struct {
	TransaksiID uuid.UUID `gorm:"column:transaksi_id;type:uuid;primaryKey"`
	TagID       uuid.UUID `gorm:"column:tag_id;type:uuid;primaryKey"`
}

func (TransaksiTag) TableName() string { return "transaksi_tag" }
