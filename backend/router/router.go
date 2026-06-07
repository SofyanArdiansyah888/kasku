package router

import (
	"github.com/gin-gonic/gin"
	"github.com/kasku/backend/internal/bersama/jwt"
	"github.com/kasku/backend/internal/bersama/middleware"
	modAnggaran "github.com/kasku/backend/internal/modul/anggaran"
	modAutentikasi "github.com/kasku/backend/internal/modul/autentikasi"
	modDashboard "github.com/kasku/backend/internal/modul/dashboard"
	modDompet "github.com/kasku/backend/internal/modul/dompet"
	modKategori "github.com/kasku/backend/internal/modul/kategori"
	modLaporan "github.com/kasku/backend/internal/modul/laporan"
	modTag "github.com/kasku/backend/internal/modul/tag"
	modTransaksi "github.com/kasku/backend/internal/modul/transaksi"
	modTB "github.com/kasku/backend/internal/modul/transaksi_berulang"
)

type Modul struct {
	Autentikasi        *modAutentikasi.Modul
	Dompet             *modDompet.Modul
	Kategori           *modKategori.Modul
	Tag                *modTag.Modul
	Transaksi          *modTransaksi.Modul
	Anggaran           *modAnggaran.Modul
	TransaksiBerulang  *modTB.Modul
	Laporan            *modLaporan.Modul
	Dashboard          *modDashboard.Modul
}

func Setup(r *gin.Engine, m *Modul, jwtSvc *jwt.Layanan, corsOrigin string) {
	r.Use(middleware.CORS(corsOrigin))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "aplikasi": "Kasku"})
	})

	api := r.Group("/api/v1")
	m.Autentikasi.DaftarkanRoute(api, jwtSvc)
	m.Dompet.DaftarkanRoute(api, jwtSvc)
	m.Kategori.DaftarkanRoute(api, jwtSvc)
	m.Tag.DaftarkanRoute(api, jwtSvc)
	m.Transaksi.DaftarkanRoute(api, jwtSvc)
	m.Anggaran.DaftarkanRoute(api, jwtSvc)
	m.TransaksiBerulang.DaftarkanRoute(api, jwtSvc)
	m.Laporan.DaftarkanRoute(api, jwtSvc)
	m.Dashboard.DaftarkanRoute(api, jwtSvc)
}
