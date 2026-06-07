package transaksi_berulang

import (
	"github.com/gin-gonic/gin"
	"github.com/kasku/backend/internal/bersama/jwt"
	"github.com/kasku/backend/internal/bersama/middleware"
	"github.com/kasku/backend/internal/modul/transaksi_berulang/handler"
	"github.com/kasku/backend/internal/modul/transaksi_berulang/repositori"
	"github.com/kasku/backend/internal/modul/transaksi_berulang/usecase"
	repoTransaksi "github.com/kasku/backend/internal/modul/transaksi/repositori"
	"gorm.io/gorm"
)

type Modul struct {
	Handler *handler.Handler
	Usecase *usecase.Usecase
}

func Baru(db *gorm.DB, repoTransaksi repoTransaksi.Repositori) *Modul {
	repo := repositori.Baru(db)
	uc := usecase.Baru(repo, repoTransaksi)
	return &Modul{Handler: handler.Baru(uc), Usecase: uc}
}

func (m *Modul) DaftarkanRoute(r *gin.RouterGroup, jwtSvc *jwt.Layanan) {
	g := r.Group("/transaksi-berulang")
	g.Use(middleware.Otentikasi(jwtSvc))
	{
		g.GET("", m.Handler.AmbilSemua)
		g.POST("", m.Handler.Buat)
		g.POST("/proses", m.Handler.Proses)
		g.GET("/:id", m.Handler.AmbilByID)
		g.PUT("/:id", m.Handler.Ubah)
		g.DELETE("/:id", m.Handler.Hapus)
	}
}
