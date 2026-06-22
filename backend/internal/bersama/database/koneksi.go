package database

import (
	"fmt"

	entAnggaran "github.com/kasku/backend/internal/modul/anggaran/entitas"
	entAutentikasi "github.com/kasku/backend/internal/modul/autentikasi/entitas"
	entDompet "github.com/kasku/backend/internal/modul/dompet/entitas"
	entKategori "github.com/kasku/backend/internal/modul/kategori/entitas"
	entTag "github.com/kasku/backend/internal/modul/tag/entitas"
	entTransaksi "github.com/kasku/backend/internal/modul/transaksi/entitas"
	entBerulang "github.com/kasku/backend/internal/modul/transaksi_berulang/entitas"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Hubungkan(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("gagal hubungkan database: %w", err)
	}
	return db, nil
}

func Migrasi(db *gorm.DB) error {
	if err := db.AutoMigrate(
		&entAutentikasi.Pengguna{},
		&entDompet.Dompet{},
		&entKategori.Kategori{},
		&entTag.Tag{},
		&entTransaksi.Transaksi{},
		&entTransaksi.TransaksiTag{},
		&entAnggaran.Anggaran{},
		&entBerulang.TransaksiBerulang{},
	); err != nil {
		return err
	}
	return migrasiTransferLama(db)
}

func migrasiTransferLama(db *gorm.DB) error {
	// Keluar: record yang dirujuk pasangan_transfer_id oleh rekan transfer
	if err := db.Exec(`
		UPDATE transaksi
		SET jenis = 'pengeluaran'
		WHERE jenis = 'transfer'
		  AND id IN (
		    SELECT pasangan_transfer_id FROM transaksi
		    WHERE jenis = 'transfer' AND pasangan_transfer_id IS NOT NULL
		  )
	`).Error; err != nil {
		return err
	}
	// Masuk: sisa record transfer
	return db.Exec(`UPDATE transaksi SET jenis = 'pemasukan' WHERE jenis = 'transfer'`).Error
}
