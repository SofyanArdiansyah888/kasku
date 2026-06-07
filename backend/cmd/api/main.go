package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kasku/backend/internal/bersama/database"
	"github.com/kasku/backend/internal/bersama/jwt"
	"github.com/kasku/backend/internal/bersama/konfigurasi"
	"github.com/kasku/backend/internal/bersama/seed"
	modAnggaran "github.com/kasku/backend/internal/modul/anggaran"
	modAutentikasi "github.com/kasku/backend/internal/modul/autentikasi"
	modDashboard "github.com/kasku/backend/internal/modul/dashboard"
	modDompet "github.com/kasku/backend/internal/modul/dompet"
	modKategori "github.com/kasku/backend/internal/modul/kategori"
	modLaporan "github.com/kasku/backend/internal/modul/laporan"
	modTag "github.com/kasku/backend/internal/modul/tag"
	modTransaksi "github.com/kasku/backend/internal/modul/transaksi"
	modTB "github.com/kasku/backend/internal/modul/transaksi_berulang"
	"github.com/kasku/backend/router"
	"github.com/robfig/cron/v3"
)

func main() {
	cfg, err := konfigurasi.Muat()
	if err != nil {
		log.Fatal("gagal muat konfigurasi:", err)
	}

	db, err := database.Hubungkan(cfg.DSN())
	if err != nil {
		log.Fatal(err)
	}

	if err := database.Migrasi(db); err != nil {
		log.Fatal("gagal migrasi database:", err)
	}

	jwtSvc := jwt.Baru(cfg.JWTSecret, cfg.JWTExpiry)

	modTransaksiInst := modTransaksi.Baru(db)
	modDompetInst := modDompet.Baru(db, modTransaksiInst.Repositori)
	modKategoriInst := modKategori.Baru(db)
	modTagInst := modTag.Baru(db)
	modAnggaranInst := modAnggaran.Baru(db, modTransaksiInst.Repositori)
	modTBInst := modTB.Baru(db, modTransaksiInst.Repositori)
	modLaporanInst := modLaporan.Baru(modTransaksiInst.Repositori)
	modDashboardInst := modDashboard.Baru(
		modDompetInst.Repositori,
		modTransaksiInst.Repositori,
		modTransaksiInst.Repositori,
	)

	modul := &router.Modul{
		Autentikasi: modAutentikasi.Baru(db, jwtSvc, func(penggunaID uuid.UUID) error {
			return seed.DataAwal(penggunaID, modKategoriInst.Repositori, modDompetInst.Repositori)
		}),
		Dompet:            modDompetInst,
		Kategori:          modKategoriInst,
		Tag:               modTagInst,
		Transaksi:         modTransaksiInst,
		Anggaran:          modAnggaranInst,
		TransaksiBerulang: modTBInst,
		Laporan:           modLaporanInst,
		Dashboard:         modDashboardInst,
	}

	c := cron.New()
	_, _ = c.AddFunc("5 0 * * *", func() {
		n, err := modTBInst.Usecase.ProsesJatuhTempo(nil)
		if err != nil {
			log.Println("cron proses jatuh tempo gagal:", err)
			return
		}
		if n > 0 {
			log.Printf("cron: %d transaksi berulang diproses", n)
		}
	})
	c.Start()

	r := gin.Default()
	router.Setup(r, modul, jwtSvc, cfg.CORSOrigin)

	log.Printf("Kasku API berjalan di port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
