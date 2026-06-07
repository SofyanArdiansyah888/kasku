package laporan

import (
	"github.com/gin-gonic/gin"
	"github.com/kasku/backend/internal/bersama/jwt"
	"github.com/kasku/backend/internal/bersama/middleware"
	"github.com/kasku/backend/internal/modul/laporan/handler"
	"github.com/kasku/backend/internal/modul/laporan/usecase"
	repoTransaksi "github.com/kasku/backend/internal/modul/transaksi/repositori"
)

type Modul struct {
	Handler *handler.Handler
}

func Baru(repoTransaksi repoTransaksi.Repositori) *Modul {
	uc := usecase.Baru(repoTransaksi)
	return &Modul{Handler: handler.Baru(uc)}
}

func (m *Modul) DaftarkanRoute(r *gin.RouterGroup, jwtSvc *jwt.Layanan) {
	auth := middleware.Otentikasi(jwtSvc)
	g := r.Group("/laporan")
	g.Use(auth)
	{
		g.GET("/bulanan", m.Handler.RingkasanBulanan)
		g.GET("/rincian-kategori", m.Handler.RincianKategori)
	}
	ekspor := r.Group("/ekspor")
	ekspor.Use(auth)
	{
		ekspor.GET("/transaksi", m.Handler.EksporTransaksi)
	}
}
